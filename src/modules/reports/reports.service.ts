import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import BaseService from 'src/base/base-service';
import { ReportQueryDto } from './dto/reports.dto';
import { ICustomer } from '../customers/interfaces/customer.interface';
import { Appointment } from '../appointments/interfaces/appointment.interface';

@Injectable()
export class ReportsService extends BaseService<Appointment, ICustomer> {
  private logger: Logger;

  constructor(@InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>) {
    super(appointmentModel);
    this.logger = new Logger(ReportsService.name);
  }

  private getAppointmentsWithCustomerLookup(shopId, query, paginate = false) {
    const appointmentFilters = this.getAppointmentFilters(shopId, query);
    const defaultSort: Record<string, 1 | -1 | { $meta: 'textScore' }> = { appointmentDate: -1, appointmentTime: -1 };

    const sortQuery = {};
    const { sort, order } = query;

    if (sort) {
      sortQuery[sort] = order;
    }

    const paginationStage = [];

    if (paginate) {
      const limit = query.limit || 10;
      const page = parseInt(query['page'] || 1);
      const skip = (page - 1) * limit;

      paginationStage.push({ $skip: skip }, { $limit: limit });
    }

    return [
      {
        $match: appointmentFilters
      },
      { $sort: sort ? sortQuery : defaultSort },
      ...paginationStage,
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
          path: '$customer'
        }
      }
    ];
  }

  private getAppointmentFilters(shopId: string, query: ReportQueryDto) {
    const filter = { shopId: { $eq: shopId } };

    if (query.isNewCustomer === 'true') {
      filter['session'] = 0;
    }

    if (query.session) {
      filter['session'] = Number(query.session);
    }

    if (query.type) {
      filter['type'] = query.type;
    }

    if (query.appointmentStatus) {
      filter['status.name'] = query.appointmentStatus;
    }

    if (query.service) {
      filter['services'] = query.service;
    }

    if (query.minDate || query.maxDate) {
      const dateFilter = {};

      if (query.minDate) {
        dateFilter['$gte'] = query.minDate;
      }
      if (query.maxDate) {
        dateFilter['$lte'] = query.maxDate;
      }

      filter['appointmentDate'] = dateFilter;
    }

    return filter;
  }

  private getCustomerFilters(query: ReportQueryDto) {
    const filter = {};

    if (query.tags) {
      filter['customer.tags'] = query.tags;
    }
    if (query.q) {
      filter['$or'] = [
        { 'customer.fullName': { $regex: query.q, $options: 'i' } },
        {
          'customer.phoneNumber': {
            $regex: query.q,
            $options: 'i'
          }
        }
      ];
    } else {
      filter['$or'] = [{ 'customer.isDeleted': false }, { 'customer.isDeleted': null }, { 'customer.isDeleted': undefined }];
    }

    return filter;
  }

  async filterAppointmentsWithCustomer(shopId: string, query: ReportQueryDto) {
    this.logger.log(`Filter: Fetch report, set query payload `);

    const customerLookup = this.getAppointmentsWithCustomerLookup(shopId, query, true);
    const countLookup = this.getAppointmentsWithCustomerLookup(shopId, query);
    const customerFilters = this.getCustomerFilters(query);

    const appointments: Appointment[] = await this.appointmentModel.aggregate(customerLookup).match(customerFilters).exec();

    let totalCount = 0;
    const countPipeline = await this.appointmentModel.aggregate(countLookup).match(customerFilters).count('count').exec();

    countPipeline.forEach((doc) => {
      totalCount = doc.count;
    });

    this.logger.log(`Filter: Fetched report successfully`);

    return { rows: appointments, totalCount };
  }

  async getCustomersForReport(shopId: string, query: ReportQueryDto) {
    const lookup = this.getAppointmentsWithCustomerLookup(shopId, query);
    const customerFilters = this.getCustomerFilters(query);

    const appointments: any[] = await this.appointmentModel.aggregate(lookup).match(customerFilters).exec();

    return appointments;
  }

  async getStats(shopId: string, query: ReportQueryDto) {
    this.logger.log(`Get report stats`);
    type CountType = { _id: string; count: number };

    const lookup = this.getAppointmentsWithCustomerLookup(shopId, query);
    const customerFilters = this.getCustomerFilters(query);

    const tagsPromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .group({
        _id: '$customer.tags',
        count: {
          $sum: 1
        }
      })
      .exec();

    const typesPromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .group({
        _id: '$type',
        count: {
          $sum: 1
        }
      })
      .exec();

    const statusPromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .group({
        _id: '$status.name',
        count: {
          $sum: 1
        }
      })
      .exec();

    const servicePromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .unwind({
        path: '$services',
        preserveNullAndEmptyArrays: true
      })
      .group({
        _id: '$services',
        count: {
          $sum: 1
        }
      })
      .sort({ _id: 1 })
      .exec();

    const sessionPromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .group({
        _id: '$session',
        count: {
          $sum: 1
        }
      })
      .sort({ _id: 1 })
      .exec();

    const appointmentDatePromise = this.appointmentModel
      .aggregate(lookup)
      .match(customerFilters)
      .group({
        _id: '$appointmentDate',
        count: {
          $sum: 1
        }
      })
      .sort({ _id: 1 })
      .exec();

    const totalPromise = this.appointmentModel.aggregate(lookup).match(customerFilters).count('count').exec();

    const [countByTags, countByTypes, countByStatus, countByService, countBySession, countByAppointmentDate, countTotal]: CountType[][] = await Promise.all([
      tagsPromise,
      typesPromise,
      statusPromise,
      servicePromise,
      sessionPromise,
      appointmentDatePromise,
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
      const key = item._id === null ? 'Others' : item._id.split(' ')[0];

      services[key] = item.count;
    });

    const sessions = {};
    countBySession.forEach((item) => {
      const key = categorizeRange(item._id);

      if (sessions[key] === undefined) {
        sessions[key] = 0;
      }
      sessions[key] += item.count;
    });

    const appointmentDates = {};
    countByAppointmentDate.forEach((item) => {
      const key = item._id;

      if (appointmentDates[key] === undefined) {
        appointmentDates[key] = 0;
      }
      appointmentDates[key] += item.count;
    });

    let totalCount = 0;
    countTotal.forEach((doc) => {
      totalCount = doc.count;
    });

    this.logger.log(`Filter: Fetched stats successfully`);

    return { totalCount, tags, appointmentStatus, appointmentTypes, services, appointmentDates, sessions };
  }
}

function categorizeRange(num: string | null): string {
  if (num === null) {
    return 'None';
  }

  const numb = Number(num);

  if (numb === 0) {
    return '0';
  } else if (numb <= 3) {
    return '1-3';
  } else if (numb <= 6) {
    return '4-6';
  } else if (numb <= 9) {
    return '7-9';
  } else {
    return '10+';
  }
}
