import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { JobsService } from './jobs.service';
import { InjectConnection } from '@nestjs/mongoose';
import { IJob, Job } from './interfaces/job.interface';
import { CreateJobDto } from './dto/create-job.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { IResponse } from 'src/common/interfaces/response.interface';
import { Roles, SelfKey } from 'src/common/decorators/roles.decorator';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Type, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompleteJobDto } from './dto/complete-job.dto';
import { JobFeedbackDto } from './dto/job-feedback.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { UserDeviceService, NotificationPayload } from '../devices/devices.service';

@Controller({
  path: '/jobs',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class JobsController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly deviceService: UserDeviceService,
    private readonly jobsService: JobsService
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { title: { $regex: query.q, $options: 'i' } };
      }

      if (query.jobFor) {
        filter = { jobFor: { $eq: query.jobFor } };
      }

      if (query.team) {
        filter = { team: { $eq: query.team } };
      }

      if (query.createdBy) {
        filter = { createdBy: { $eq: query.createdBy } };
      }

      const toPopulate = [
        { path: 'jobFor', select: ['fullName'] },
        { path: 'property', select: [''] },
        { path: 'primaryVisit', select: ['rruleSet'] }
      ];

      const jobs = await this.jobsService.findAll(filter, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', jobs);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/summary')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async getSummary(): Promise<IResponse> {
    try {
      const summary = await this.jobsService.getSummary();
      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const job = await this.jobsService.findById(param.jobId, {
        authUser,
        toPopulate: [
          { path: 'jobFor', select: ['fullName', 'phoneNumber', 'email', 'address'] },
          { path: 'team', select: ['fullName'] },
          { path: 'property', select: [''] },
          { path: 'primaryVisit', select: [''] }
        ]
      });
      return new ResponseSuccess('COMMON.SUCCESS', job);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('jobFor')
  async create(@Body() jobCreateDto: CreateJobDto, @CurrentUser() authUser: User): Promise<IResponse> {
    // Check if we need to notify team
    const notifyTeam = jobCreateDto.notifyTeam;

    try {
      const session = await this.connection.startSession();
      let newJob: IJob;
      await session.withTransaction(async () => {
        // Delete notifyTeam flag
        delete jobCreateDto.notifyTeam;

        // Add createdBy user
        !jobCreateDto.createdBy ? (jobCreateDto.createdBy = authUser?._id) : null;

        // Continue job creation
        newJob = await this.jobsService.create(jobCreateDto, session, { authUser });
      });
      session.endSession();

      // Notifying the team members
      if (notifyTeam) {
        for (const memberId in newJob.team) {
          // Notify Teams via Push Notification:
          const notificationPayload: NotificationPayload = {
            notification: {
              title: 'Job Assigned to you!',
              body: `A job of ref. #${newJob.refCode} has been assigned to you.`
            },
            mobileData: {
              type: 'JOB_ASSIGNED',
              routeName: '/jobs',
              metaData: '',
              click_action: 'APP_NOTIFICATION_CLICK'
            }
          };
          this.deviceService.sendNotification(memberId, notificationPayload);

          // Send email notification of assignments
          this.jobsService.sendJobAssignmentEmail(memberId, newJob._id);
        }
      }

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdateJobDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IJob;
      await session.withTransaction(async () => {
        updatedJob = await this.jobsService.update(param.jobId, property, session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Updated!',
          body: `A job of ref. #${updatedJob.refCode} updated recently.`
        },
        mobileData: {
          type: 'JOB_UPDATED',
          routeName: '/jobs',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedJob.jobFor === 'string' ? updatedJob.jobFor : updatedJob.jobFor?._id, notificationPayload);

      // Notify Teams via Push Notification:
      updatedJob.team.forEach((mem: string | User) => {
        const notificationPayload: NotificationPayload = {
          notification: {
            title: 'Job Assigned to you!',
            body: `A job of ref. #${updatedJob.refCode} has been assigned to you.`
          },
          mobileData: {
            type: 'JOB_ASSIGNED',
            routeName: '/jobs',
            metaData: '',
            click_action: 'APP_NOTIFICATION_CLICK'
          }
        };
        this.deviceService.sendNotification(typeof mem === 'string' ? mem : mem?._id, notificationPayload);
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedJob: Job;
      await session.withTransaction(async () => {
        deletedJob = await this.jobsService.softDelete(param.jobId, session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Deleted!',
          body: `A job of ref. #${deletedJob.refCode} deleted recently.`
        },
        mobileData: {
          type: 'JOB_DELETED',
          routeName: '/jobs',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof deletedJob.jobFor === 'string' ? deletedJob.jobFor : deletedJob.jobFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', deletedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId/complete')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseInterceptors(FilesInterceptor('docs'))
  async markJobComplete(@Param('jobId') jobId, @Body() completeJobDto: CompleteJobDto, @UploadedFiles() files: Express.Multer.File[]): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IJob;
      await session.withTransaction(async () => {
        updatedJob = await this.jobsService.markJobAsComplete(jobId, completeJobDto, files || [], session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Marked as Complete!',
          body: `A job of ref. #${updatedJob.refCode} marked as complete.`
        },
        mobileData: {
          type: 'JOB_COMPLETED',
          routeName: '/jobs',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedJob.jobFor === 'string' ? updatedJob.jobFor : updatedJob.jobFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId/feedback')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async jobFeedback(@Param() param, @Body() jobFeedbackDto: JobFeedbackDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IJob;
      await session.withTransaction(async () => {
        updatedJob = await this.jobsService.provideJobFeedback(param.jobId, jobFeedbackDto, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
