import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { VisitsService } from './visits.service';
import { InjectConnection } from '@nestjs/mongoose';
import { IVisit } from './interfaces/visit.interface';
import { CreateVisitDto } from './dto/create-visit.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { UpdateJobStatusDto } from './dto/update-visit-status-dto';
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
export class VisitsController {
  constructor(private readonly visitsService: VisitsService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const jobs = await this.visitsService.findAll(query, { authUser });
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
      const job = await this.visitsService.findById(param.jobId, { authUser });
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
  async create(@Body() job: CreateVisitDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJob: IVisit;
      await session.withTransaction(async () => {
        newJob = await this.visitsService.create(job, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdateVisitDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IVisit;
      await session.withTransaction(async () => {
        updatedJob = await this.visitsService.update(param.jobId, property, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:jobId/update-status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('jobFor')
  async updateStatus(@Param() param, @Body() job: UpdateJobStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedJob: IVisit;
      await session.withTransaction(async () => {
        updatedJob = await this.visitsService.updateStatus(param.jobId, job.status, session, { authUser });
      });
      session.endSession();

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
        deletedJob = await this.visitsService.remove(param.jobId, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', deletedJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
