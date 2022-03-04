import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { JobRequestService } from './job-request.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { User } from '../users/interfaces/user.interface';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, SelfKey } from 'src/common/decorators/roles.decorator';
import { CreateJobRequestDto } from './dto/create-job-request.dto';
import { JobRequest } from './interfaces/job-request.interface';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { UpdatePropertyDto } from './dto/update-job-request.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Type, UseGuards, UseInterceptors } from '@nestjs/common';
import { NotificationPayload, UserDeviceService } from '../devices/devices.service';

@Controller({
  path: '/job-requests',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class JobRequestController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly deviceService: UserDeviceService,
    private readonly jobRequestService: JobRequestService
  ) {}

  @Get()
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async find(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    let filter: mongoose.FilterQuery<Type> = {};

    try {
      // Filters to listing Job Requests
      if (query.q) {
        filter = { name: { $regex: query.q, $options: 'i' }, isDeleted: false };
      } else {
        filter = { $or: [{ isDeleted: false }, { isDeleted: null }] };
      }

      const options = { authUser, query, toPopulate: [{ path: 'client', select: ['firstName', 'lastName', 'email', 'phoneNumber'] }] };
      const properties = await this.jobRequestService.findAll(filter, options);

      return new ResponseSuccess('COMMON.SUCCESS', { ...properties });
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/summary')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async getSummary(): Promise<IResponse> {
    try {
      const summary = await this.jobRequestService.getSummary();

      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:requestId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const populate = [
        { path: 'client', select: ['fullName', 'firstName', 'lastName', 'email', 'phoneNumber', 'address'] },
        { path: 'property', select: ['name', 'street1', 'street2', 'city', 'state', 'postalCode', 'country'] }
      ];
      const property = await this.jobRequestService.findById(param.requestId, { authUser, toPopulate: populate });

      return new ResponseSuccess('COMMON.SUCCESS', property);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('client')
  async create(@Body() jobReq: CreateJobRequestDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJobReq: JobRequest;
      await session.withTransaction(async () => {
        // Add createdBy user
        !jobReq.createdBy ? (jobReq.createdBy = authUser?._id) : null;

        // Continue job creation
        newJobReq = await this.jobRequestService.create(jobReq, session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Request Created!',
          body: `A job request of ref. #${newJobReq.reqCode} created for you.`
        },
        mobileData: {
          type: 'JOB_REQUEST_CREATED',
          routeName: '/job-requests',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(jobReq.client, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', newJobReq.toObject());
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:propertyId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  @SelfKey('client')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJobReq: JobRequest;
      await session.withTransaction(async () => {
        updatedJobReq = await this.jobRequestService.update(param.propertyId, property, session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Request Updated!',
          body: `A job request of ref. #${updatedJobReq.reqCode} updated recently.`
        },
        mobileData: {
          type: 'JOB_REQUEST_UPDATED',
          routeName: '/job-requests',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(updatedJobReq.client, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedJobReq);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:propertyId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedJobReq: JobRequest;
      await session.withTransaction(async () => {
        deletedJobReq = await this.jobRequestService.softDelete(param.propertyId, session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Request Deleted!',
          body: `A job request of ref. #${deletedJobReq.reqCode} deleted recently.`
        },
        mobileData: {
          type: 'JOB_REQUEST_DELETED',
          routeName: '/job-requests',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(deletedJobReq.client, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', deletedJobReq);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
