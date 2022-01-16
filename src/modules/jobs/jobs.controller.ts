import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { JobsService } from './jobs.service';
import { InjectConnection } from '@nestjs/mongoose';
import { IJob } from './interfaces/job.interface';
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
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller({
  path: '/jobs',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class JobsController {
  constructor(private readonly jobsService: JobsService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const jobs = await this.jobsService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', jobs);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const job = await this.jobsService.findById(param.jobId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', job);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('jobFor')
  async create(@Body() job: CreateJobDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJob: IJob;
      await session.withTransaction(async () => {
        newJob = await this.jobsService.create(job, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdateJobDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IJob;
      await session.withTransaction(async () => {
        updatedJob = await this.jobsService.update(param.jobId, property, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedJob: boolean;
      await session.withTransaction(async () => {
        deletedJob = await this.jobsService.remove(param.jobId, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', deletedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
