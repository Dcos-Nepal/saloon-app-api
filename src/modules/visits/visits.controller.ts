import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { VisitsService } from './visits.service';
import { InjectConnection } from '@nestjs/mongoose';
import { IVisit, Visit } from './interfaces/visit.interface';
import { CreateVisitDto } from './dto/create-visit.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { UpdateJobStatusDto } from './dto/update-visit-status-dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { VisitSummaryDto } from './dto/summary.dto';
import { NotificationPayload, UserDeviceService } from '../devices/devices.service';
import { VisitFeedbackDto } from './dto/visit-feedback.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CompleteVisitDto } from './dto/complete-visit.dto';

@Controller({
  path: '/visits',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class VisitsController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly deviceService: UserDeviceService,
    private readonly visitsService: VisitsService
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    let filter: mongoose.FilterQuery<Visit> = { ...query };

    if (query.q) {
      filter = { title: { $regex: query.q, $options: 'i' } };
    }

    if (query.job) {
      filter = { job: { $eq: query.job } };
    }

    const toPopulate = [
      {
        path: 'job',
        populate: [
          {
            path: 'jobFor',
            select: ['fullName', 'address', 'email', 'phoneNumber']
          },
          {
            path: 'property',
            select: ['name', 'street1', 'street2', 'city', 'state', 'postalCode', 'country']
          },
          {
            path: 'team',
            model: 'User',
            select: ['fullName', 'address', 'email', 'phoneNumber']
          }
        ],
        select: ['title', 'type']
      },
      {
        path: 'team',
        select: ['fullName', 'address', 'email', 'phoneNumber']
      }
    ];

    try {
      const visits = await this.visitsService.findAll(filter, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', visits);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async getSummary(@Query() query: VisitSummaryDto): Promise<IResponse> {
    try {
      const visits = await this.visitsService.getSummary(query);
      return new ResponseSuccess('COMMON.SUCCESS', visits);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const visit = await this.visitsService.findById(param.visitId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', visit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async create(@Body() visit: CreateVisitDto, @Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJob: IVisit;
      await session.withTransaction(async () => {
        newJob = query.updateFollowing
          ? await this.visitsService.updateSelfAndFollowing(visit, session)
          : await this.visitsService.create(visit, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async update(@Param() param, @Body() visit: UpdateVisitDto, @Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = query.updateFollowing
          ? await this.visitsService.updateSelfAndFollowing(visit as IVisit, session)
          : await this.visitsService.update(param.visitId, visit, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId/update-status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async updateStatus(@Param() param, @Body() job: UpdateJobStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = await this.visitsService.updateStatus(param.visitId, job.status, session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Visit Status Updated!',
          body: `A visit status changed to ${updatedVisit.status.status}.`
        },
        mobileData: {
          type: 'VISIT_UPDATED',
          routeName: '/visits',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedVisit.visitFor === 'string' ? updatedVisit.visitFor : updatedVisit.visitFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let isVisitDeleted: boolean;
      await session.withTransaction(async () => {
        isVisitDeleted = await this.visitsService.remove(param.visitId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', isVisitDeleted);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId/complete')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseInterceptors(FilesInterceptor('docs'))
  async markVisitComplete(
    @Param('visitId') visitId,
    @Body() completeVisitDto: CompleteVisitDto,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = await this.visitsService.markVisitAsComplete(visitId, completeVisitDto, files || [], session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Visit Marked as Complete!',
          body: `A visit of id #${updatedVisit?._id} marked as complete.`
        },
        mobileData: {
          type: 'VISIT_COMPLETED',
          routeName: `/visits/${updatedVisit._id}/complete`,
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedVisit.visitFor === 'string' ? updatedVisit.visitFor : updatedVisit.visitFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId/feedback')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async visitFeedback(@Param('visitId') visitId, @Body() jobFeedbackDto: VisitFeedbackDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = await this.visitsService.provideVisitFeedback(visitId, jobFeedbackDto, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
