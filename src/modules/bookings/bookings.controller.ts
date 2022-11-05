import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';

import { IBooking, Booking } from './interfaces/booking.interface';
import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { UpdateJobStatusDto } from './dto/update-booking-status-dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller({
  path: '/bookings',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class BookingsController {
  constructor(@InjectConnection() private readonly connection: mongoose.Connection, private readonly visitsService: BookingsService) {}

  @Get()
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    const filter: mongoose.FilterQuery<Booking> = { ...query };
    // Get only not deleted visits
    filter.isDeleted = false;

    if (query.q) {
      filter.title = { $regex: query.q, $options: 'i' };
    }

    const toPopulate = [];

    try {
      const visits = await this.visitsService.findAll(filter, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', visits);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:visitId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const visit = await this.visitsService.findById(param.visitId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', visit);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  async create(@Body() visit: CreateBookingDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newJob: IBooking;
      await session.withTransaction(async () => {
        newJob = await this.visitsService.create(visit as IBooking, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId')
  async update(@Param() param, @Body() visit: UpdateBookingDto, @Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      let updatedBooking: IBooking;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        updatedBooking = await this.visitsService.update(param.visitId, visit, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:visitId/update-status')
  async updateStatus(@Param() param, @Body() job: UpdateJobStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedBooking: IBooking;
      await session.withTransaction(async () => {
        updatedBooking = await this.visitsService.updateStatus(param.visitId, job.status, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:visitId')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedBooking: Booking;
      await session.withTransaction(async () => {
        deletedBooking = await this.visitsService.softDelete(param.visitId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', !!deletedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
