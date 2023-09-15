import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Booking, IBooking } from './interfaces/booking.interface';
import { Status } from './dto/status.dto';

@Injectable()
export class BookingsService extends BaseService<Booking, IBooking> {
  logger: Logger;

  constructor(@InjectModel('Booking') private readonly visitModel: Model<Booking>) {
    super(visitModel);
    this.logger = new Logger(BookingsService.name);
  }

  async findAllBookings(query: any, shopId: string) {
    const filter = { isDeleted: false, shopId: { $eq: shopId } };

    if (query.q) {
      const nameFilter = { $regex: query.q, $options: 'i' };
      filter['$or'] = [{ 'customer.fullName': nameFilter }, { fullName: nameFilter }];
    }

    if (query.status) {
      filter['status.status'] = query.status;
    }

    if (query.type) {
      filter['type'] = query.type;
    }

    const dateFilter = {};

    if (query.minDate) {
      dateFilter['$gte'] = new Date(query.minDate);
    }

    if (query.maxDate) {
      const maxDate = new Date(query.maxDate);
      maxDate.setDate(maxDate.getDate() + 1);
      dateFilter['$lt'] = maxDate;
    }

    if (!!Object.keys(dateFilter).length) {
      filter['status.date'] = dateFilter;
    }

    const limit = parseInt(query['limit'] || 10);
    const page = parseInt(query['page'] || 1);
    const skip = (page - 1) * limit;

    const sortOptions = query.sortBy || '-createdAt';

    const pipeline = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const customersPromise = this.visitModel.aggregate(pipeline).match(filter).limit(limit).skip(skip).sort(sortOptions);
    const countPromise = this.visitModel.aggregate(pipeline).match(filter).count('count');

    const [rows, totalCount] = await Promise.all([customersPromise, countPromise]);

    return { rows, totalCount: totalCount[0]?.count || 0 };
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
    visit.status = {
      status: status.status,
      date: status.date || visit.status.date,
      reason: status.reason,
      updatedBy: authUser._id
    };

    return await this.update(visitId, visit, session, { authUser });
  }
}
