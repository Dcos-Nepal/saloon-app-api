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

@Controller({
  path: '/job-requests',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class JobRequestController {
  constructor(private readonly jobRequestService: JobRequestService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
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
  @Roles('ADMIN')
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
        { path: 'client', select: ['firstName', 'lastName', 'email', 'phoneNumber'] },
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
  async create(@Body() property: CreateJobRequestDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newProperty: JobRequest;
      await session.withTransaction(async () => {
        newProperty = await this.jobRequestService.create(property, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newProperty.toObject());
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

      return new ResponseSuccess('COMMON.SUCCESS', deletedJobReq);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
