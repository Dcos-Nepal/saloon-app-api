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
  constructor(@InjectConnection() private readonly connection: mongoose.Connection, private readonly bookingsService: BookingsService) {}

  @Get()
  async find(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    const filter: mongoose.FilterQuery<Booking> = { ...query };
    // Get only not deleted bookings
    filter.isDeleted = false;

    if (query.q) {
      filter.title = { $regex: query.q, $options: 'i' };
    }

    if (query.status) {
      filter['status.status'] = query.status;
    }

    // Default Filter
    filter['shopId'] = { $eq: authUser.shopId };

    delete filter.status;

    const toPopulate = [{ path: 'customer', select: ['fullName', 'firstName', 'lastName', 'address', 'phoneNumber'] }];

    try {
      const bookings = await this.bookingsService.findAll(filter, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', bookings);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:bookingId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const booking = await this.bookingsService.findById(param.bookingId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', booking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  async create(@CurrentUser() authUser: User, @Body() booking: CreateBookingDto): Promise<IResponse> {
    // Set Shop ID for Packaged Client
    booking.shopId = authUser.shopId;

    try {
      const session = await this.connection.startSession();
      let newJob: IBooking;
      await session.withTransaction(async () => {
        newJob = await this.bookingsService.create(booking as IBooking, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:bookingId')
  async update(@Param() param, @Body() booking: UpdateBookingDto, @Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      let updatedBooking: IBooking;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        updatedBooking = await this.bookingsService.update(param.bookingId, booking, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:bookingId/update-status')
  async updateStatus(@Param() param, @Body() job: UpdateJobStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedBooking: IBooking;
      await session.withTransaction(async () => {
        updatedBooking = await this.bookingsService.updateStatus(param.bookingId, job.status, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:bookingId')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedBooking: Booking;
      await session.withTransaction(async () => {
        deletedBooking = await this.bookingsService.softDelete(param.bookingId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', !!deletedBooking);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
