import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateCustomerDto, CustomerQueryDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, ICustomer } from './interfaces/customer.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class CustomersService extends BaseService<Customer, ICustomer> {
  private logger: Logger;

  constructor(@InjectModel('Customer') private readonly customerModel: Model<Customer>) {
    super(customerModel);
    this.logger = new Logger(CustomersService.name);
  }

  /**
   * Create Customer
   *
   * @param createDto CreateCustomerDto
   * @returns Customer
   */
  async create(createDto: CreateCustomerDto) {
    this.logger.log(`Create: Create Customer `);

    const CustomerData = new this.customerModel(createDto);
    const Customer = await CustomerData.save();

    this.logger.log(`Create: Created Customer of ${Customer._id} successfully `);

    return Customer;
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

  private getCustomerWithAppointmentsFilter(shopId: string, query: CustomerQueryDto) {
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

  /**
   * Filter Customers based on the query strings
   *
   * @param shopId
   * @param query CustomerQueryDto
   * @returns Customer[]
   */
  async filterCustomersWithAppointments(shopId: string, query: CustomerQueryDto) {
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

  /**
   * Update Customer with given update info
   *
   * @param id String
   * @param updateCustomerDto UpdateCustomerDto
   * @returns Customer
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    this.logger.log(`Update: Update Customer of id: ${id}`);
    const existingCustomer = await this.customerModel.findById(id);
    const updatedCus = await this.customerModel.findOneAndUpdate({ _id: id }, { ...updateCustomerDto }, { new: true }).exec();

    // Let's delete the previous file if the photo is changed
    if (updateCustomerDto.photo && updateCustomerDto.photo !== existingCustomer.photo) {
      const dirPath = path.join(__dirname, '..', '..', '..', '/uploads/');
      const filePath = dirPath + existingCustomer.photo;

      if (fs.existsSync(filePath)) {
        await fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }

    if (!updatedCus) {
      throw new NotFoundException(`Customer with ${id} is not found`);
    }
    this.logger.log(`Update: updated Customer of id ${id} successfully`);

    return updatedCus;
  }

  /**
   * Delete Client's File
   * @param id String
   * @param fileId String
   * @param updateCustomerDto UpdateCustomerDto
   * @returns UpdateCustomerDto
   */
  async deleteClientFile(id: string, fileId: string, updateCustomerDto: UpdateCustomerDto) {
    this.logger.log(`Delete: Update customer of id: ${id}`);
    const updatedCus = await this.customerModel.updateOne({ _id: id }, { ...updateCustomerDto }, { new: true }).exec();

    // Let's delete the file if the file exists
    if (fileId) {
      const dirPath = path.join(__dirname, '..', '..', '..', '/uploads/');
      const filePath = dirPath + fileId;

      if (fs.existsSync(filePath)) {
        await fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }

    this.logger.log(`Update: Removed Client's file of id ${id} successfully`);

    return updatedCus;
  }
}
