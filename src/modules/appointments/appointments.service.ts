import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateAppointmentDto, AppointmentQueryDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { IAppointment, Appointment } from './interfaces/appointment.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class AppointmentsService extends BaseService<Appointment, IAppointment> {
  private logger: Logger;

  constructor(@InjectModel('Appointment') private readonly AppointmentModel: Model<Appointment>) {
    super(AppointmentModel);
    this.logger = new Logger(AppointmentsService.name);
  }

  /**
   * Create Appointment
   *
   * @param createDto CreateAppointmentDto
   * @returns Appointment
   */
  async createAppointment(createDto: CreateAppointmentDto) {
    this.logger.log(`Create: Create Appointment `);

    const AppointmentData = new this.AppointmentModel(createDto);
    const Appointment = await AppointmentData.save();

    this.logger.log(`Create: Created Appointment of ${Appointment._id} successfully `);

    return Appointment;
  }

  /**
   * Filter Appointments based on the query strings
   *
   * @param query AppointmentQueryDto
   * @returns Appointment[]
   */
  async filterAppointments(query: AppointmentQueryDto) {
    this.logger.log(`Filter: Fetch Appointments, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Appointments = await this.AppointmentModel.find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched Appointments successfully`);

    return Appointments;
  }

  /**
   * Update Appointment with given update info
   *
   * @param id String
   * @param updateAppointmentDto UpdateAppointmentDto
   * @returns Appointment
   */
  async updateAppointment(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    this.logger.log(`Update: Update Appointment of id: ${id}`);

    const updatedAppointment = await this.AppointmentModel.findOneAndUpdate({ _id: id }, { ...updateAppointmentDto }, { new: true }).exec();

    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with ${id} is not found`);
    }
    this.logger.log(`Update: updated Appointment of id ${id} successfully`);

    return updatedAppointment;
  }
}
