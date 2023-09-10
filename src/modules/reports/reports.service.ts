import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import BaseService from 'src/base/base-service';
import { ReportQueryDto } from './dto/reports.dto';
import { Customer, ICustomer } from '../customers/interfaces/customer.interface';

@Injectable()
export class ReportsService extends BaseService<Customer, ICustomer> {
  private logger: Logger;

  constructor(@InjectModel('Customer') private readonly customerModel: Model<Customer>) {
    super(customerModel);
    this.logger = new Logger(ReportsService.name);
  }

  private getCustomerWithAppointmentsLookUp() {
    const sort: Record<string, 1 | -1 | { $meta: 'textScore' }> = { 'customer_appointments.createdAt': -1 };

    return [
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'customer',
          as: 'customer_appointments'
        }
      },
      {
        $unwind: {
          path: '$customer_appointments',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: sort
      },
      {
        $group: {
          _id: '$_id',
          session: { $max: '$customer_appointments.session' },
          customerData: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$customerData', { session: '$session' }]
          }
        }
      }
    ];
  }

  private getCustomerWithAppointmentsFilter(shopId: string, query: ReportQueryDto) {
    const filter = { shopId: { $eq: shopId } };
    if (query.tags) {
      filter['tags'] = query.tags;
    }
    if (query.q) {
      filter['$or'] = [
        { fullName: { $regex: query.q, $options: 'i' } },
        {
          phoneNumber: {
            $regex: query.q,
            $options: 'i'
          }
        }
      ];
    } else {
      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];
    }

    if (query.isNewCustomer === 'true') {
      filter['session'] = 0;
    }

    if (query.type) {
      filter['customer_appointments.type'] = query.type;
    }

    if (query.appointmentStatus) {
      filter['customer_appointments.status.name'] = query.appointmentStatus;
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
      filter['createdAt'] = dateFilter;
    }

    return filter;
  }

  async filterCustomersWithAppointments(shopId: string, query: ReportQueryDto) {
    this.logger.log(`Filter: Fetch Customers, set query payload `);
    const limit = query.limit || 10;
    const page = parseInt(query['page'] || 1);
    const skip = (page - 1) * limit;

    const sortQuery = {};
    const { sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    const filter = this.getCustomerWithAppointmentsFilter(shopId, query);

    const customers: Customer[] = await this.customerModel
      .aggregate(this.getCustomerWithAppointmentsLookUp())
      .match(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    let totalCount = 0;
    const countPipeline = await this.customerModel.aggregate(this.getCustomerWithAppointmentsLookUp()).match(filter).count('count').exec();

    countPipeline.forEach((doc) => {
      totalCount = doc.count;
    });

    this.logger.log(`Filter: Fetched Customers successfully`);

    return { rows: customers, totalCount };
  }

  async getStats(shopId: string, query: ReportQueryDto) {
    this.logger.log(`Get report `);
    type CountType = { _id: string; count: number };

    const filter = this.getCustomerWithAppointmentsFilter(shopId, query);

    const tagsPromise = this.customerModel
      .aggregate(this.getCustomerWithAppointmentsLookUp())
      .match(filter)
      .group({
        _id: '$tags',
        count: {
          $sum: 1
        }
      })
      .exec();

    const typesPromise = this.customerModel
      .aggregate(this.getCustomerWithAppointmentsLookUp())
      .match(filter)
      .group({
        _id: '$customer_appointments.type',
        count: {
          $sum: 1
        }
      })
      .exec();

    const statusPromise = this.customerModel
      .aggregate(this.getCustomerWithAppointmentsLookUp())
      .match(filter)
      .group({
        _id: '$customer_appointments.status.name',
        count: {
          $sum: 1
        }
      })
      .exec();

    const servicePromise = this.customerModel
      .aggregate(this.getCustomerWithAppointmentsLookUp())
      .match(filter)
      .unwind({
        path: '$customer_appointments.services',
        preserveNullAndEmptyArrays: true
      })
      .group({
        _id: '$customer_appointments.services',
        count: {
          $sum: 1
        }
      })
      .exec();

    const totalPromise = this.customerModel.aggregate(this.getCustomerWithAppointmentsLookUp()).match(filter).count('count').exec();

    const [countByTags, countByTypes, countByStatus, countByService, countTotal]: CountType[][] = await Promise.all([
      tagsPromise,
      typesPromise,
      statusPromise,
      servicePromise,
      totalPromise
    ]);

    const tags = {};
    countByTags.forEach((item) => {
      const key = item._id === '' ? 'OTHERS' : item._id;

      tags[key] = item.count;
    });

    const appointmentStatus = {};
    countByStatus.forEach((item) => {
      const key = item._id === null ? 'OTHERS' : item._id;

      appointmentStatus[key] = item.count;
    });

    const appointmentTypes = {};
    countByTypes.forEach((item) => {
      const key = item._id === null ? 'OTHERS' : item._id;

      appointmentTypes[key] = item.count;
    });

    const services = {};
    countByService.forEach((item) => {
      const key = item._id === null ? 'OTHERS' : item._id;

      services[key] = item.count;
    });

    let totalCount = 0;
    countTotal.forEach((doc) => {
      totalCount = doc.count;
    });

    this.logger.log(`Filter: Fetched Customers successfully`);

    return { totalCount, tags, appointmentStatus, appointmentTypes, services };
  }
}
