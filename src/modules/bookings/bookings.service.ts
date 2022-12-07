import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Booking, IBooking, BookingStatusType } from './interfaces/booking.interface';
import { Status } from './dto/status.dto';

@Injectable()
export class BookingsService extends BaseService<Booking, IBooking> {
  logger: Logger;

  constructor(@InjectModel('Booking') private readonly visitModel: Model<Booking>) {
    super(visitModel);
    this.logger = new Logger(BookingsService.name);
  }

  /**
   * Get Bookings based on the provided filters
   *
   * @param filter
   * @param options
   * @returns
   */
  async findAll(filter: any, options?: IServiceOptions) {
    if (filter.startDate || filter.endDate) {
      filter['$or'] = [];

      if (filter.startDate) filter['$or'].push({ startDate: { $lte: filter.startDate }, endDate: { $gte: filter.startDate } });
      if (filter.endDate) filter['$or'].push({ startDate: { $lte: filter.endDate }, endDate: { $gte: filter.endDate } });

      if (filter.startDate && filter.endDate) {
        filter['$or'].push({ startDate: { $gte: filter.startDate }, endDate: { $lte: filter.endDate } });
      }

      delete filter.startDate;
      delete filter.endDate;
    }

    return super.findAll(filter, options);
  }

  /**
   * Update Booking Info for given visit Id
   *
   * @param visitId String
   * @param statusType BookingStatusType
   * @param session ClientSession
   * @param param IServiceOptions
   * @returns Promise<Object>
   */
  async updateStatus(visitId: string, status: Status, session: ClientSession, { authUser }: IServiceOptions) {
    const visit = await this.findById(visitId);
    visit.statusHistory.push(visit.status);
    visit.status = { status: status.status, date: status.date || visit.status.date, reason: status.reason, updatedBy: authUser._id };

    return await this.update(visitId, visit, session, { authUser });
  }
}
