import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards, Type } from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CreateAppointmentDto, AppointmentQueryDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './interfaces/appointment.interface';

@Controller({
  path: '/appointments',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  private logger: Logger;

  constructor(private readonly appointmentsService: AppointmentsService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(AppointmentsController.name);
  }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      const Appointment = await this.appointmentsService.createAppointment(createAppointmentDto);

      if (Appointment) {
        return new ResponseSuccess('APPOINTMENT.CREATE', Appointment);
      } else {
        return new ResponseError('APPOINTMENT.ERROR.CREATE_APPOINTMENT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('APPOINTMENT.ERROR.CREATE_APPOINTMENT_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: AppointmentQueryDto) {
    const filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.appointmentDate) {
        filter.appointmentDate = { $eq: query.appointmentDate };
      }

      if (query.status) {
        filter['status.name'] = query.status.toString();
      }

      filter['$or'] = [{ isDeleted: false }];

      // Remove unnecessary fields
      delete filter.status;

      const toPopulate = [{ path: 'customer', select: ['fullName', 'firstName', 'lastName', 'address', 'phoneNumber', 'email', 'photo'] }];
      const appointmentResponse = await this.appointmentsService.findAll(filter, { query, toPopulate });

      let rowsCount = 0;
      if (query.q) {
        appointmentResponse.rows = appointmentResponse.rows.filter((row) => {
          if ((row.customer as any).fullName.includes(query.q)) {
            rowsCount += 1;
            return true;
          }
          return false;
        });
      }

      if (appointmentResponse) {
        appointmentResponse.totalCount - rowsCount;
        return new ResponseSuccess('APPOINTMENT.FILTER', appointmentResponse);
      } else {
        return new ResponseError('APPOINTMENT.ERROR.FILTER_APPOINTMENT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('APPOINTMENT.ERROR.FILTER_APPOINTMENT_FAILED', error);
    }
  }

  @Get('/:appointmentId')
  async findOne(@Param('appointmentId') appointmentId: string) {
    try {
      const Appointment = await this.appointmentsService.findOne({ _id: appointmentId });

      if (Appointment) {
        return new ResponseSuccess('APPOINTMENT.FIND', Appointment);
      } else {
        return new ResponseError('APPOINTMENT.ERROR.FIND_APPOINTMENT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('APPOINTMENT.ERROR.FIND_APPOINTMENT_FAILED', error);
    }
  }

  @Patch('/:appointmentId')
  async update(@Param('appointmentId') appointmentId: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const Appointment = await this.appointmentsService.updateAppointment(appointmentId, updateAppointmentDto);

      if (Appointment) {
        return new ResponseSuccess('APPOINTMENT.UPDATE', Appointment);
      } else {
        return new ResponseError('APPOINTMENT.ERROR.UPDATE_APPOINTMENT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('APPOINTMENT.ERROR.UPDATE_APPOINTMENT_FAILED', error);
    }
  }

  @Delete('/:appointmentId')
  async remove(@Param('appointmentId') appointmentId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Appointment;
      await session.withTransaction(async () => {
        removedItem = await this.appointmentsService.softDelete(appointmentId, session);
      });
      return new ResponseSuccess('APPOINTMENT.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('APPOINTMENT.ERROR.DELETE_APPOINTMENT_FAILED', error);
    }
  }
}
