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
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { VisitSummaryDto } from './dto/summary.dto';

@Controller({
  path: '/visits',
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
      const visits = await this.visitsService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', visits);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async getSummary(@Query() query: VisitSummaryDto): Promise<IResponse> {
    try {
      const visits = await this.visitsService.getSummary(query.startDate, query.endDate);
      return new ResponseSuccess('COMMON.SUCCESS', visits);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
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
  @Roles('ADMIN')
  async create(@Body() visit: CreateVisitDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJob: IVisit;
      await session.withTransaction(async () => {
        newJob = await this.visitsService.create(visit, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdateVisitDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = await this.visitsService.update(param.visitId, property, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId/update-status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async updateStatus(@Param() param, @Body() job: UpdateJobStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedVisit: IVisit;
      await session.withTransaction(async () => {
        updatedVisit = await this.visitsService.updateStatus(param.visitId, job.status, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedVisit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:visitId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
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
}
