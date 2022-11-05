import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateCustomerDto, CustomerQueryDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ICustomer, Customer } from './interfaces/customer.interface';
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

  /**
   * Filter Customers based on the query strings
   *
   * @param query CustomerQueryDto
   * @returns Customer[]
   */
  async filterCustomers(query: CustomerQueryDto) {
    this.logger.log(`Filter: Fetch Customers, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Customers = await this.customerModel
      .find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched Customers successfully`);

    return Customers;
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
    const updatedCustomer = await this.customerModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...updateCustomerDto
        },
        { new: true }
      )
      .exec();

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

    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ${id} is not found`);
    }
    this.logger.log(`Update: updated Customer of id ${id} successfully`);

    return updatedCustomer;
  }
}
