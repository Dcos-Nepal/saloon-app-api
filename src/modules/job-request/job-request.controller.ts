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
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller({
  path: '/job-requests',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class JobRequestController {
  constructor(private readonly jobRequestService: JobRequestService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const properties = await this.jobRequestService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', properties);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Get('/:requestId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const property = await this.jobRequestService.findById(param.requestId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', property);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
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
      return new ResponseSuccess('COMMON.SUCCESS', newProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Put('/:propertyId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('client')
  async update(@Param() param, @Body() property: UpdatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: JobRequest;
      await session.withTransaction(async () => {
        updatedProperty = await this.jobRequestService.update(param.propertyId, property, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Delete('/:propertyId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async delete(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: boolean;
      await session.withTransaction(async () => {
        updatedProperty = await this.jobRequestService.remove(param.propertyId, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }
}
