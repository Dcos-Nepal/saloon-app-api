import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateServiceDto, ServiceQueryDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { IService, Service } from './interfaces/service.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class ServiceService extends BaseService<Service, IService> {
  private logger: Logger;

  constructor(@InjectModel('Service') private readonly serviceModel: Model<Service>) {
    super(serviceModel);
    this.logger = new Logger(ServiceService.name);
  }

  /**
   * Create service
   *
   * @param createDto CreateServiceDto
   * @returns Service
   */
  async create(createDto: CreateServiceDto) {
    this.logger.log(`Create: Create service `);

    const ServiceData = new this.serviceModel(createDto);
    const Service = await ServiceData.save();

    this.logger.log(`Create: Created service of ${Service._id} successfully `);

    return Service;
  }

  /**
   * Filter services based on the query strings
   *
   * @param query ServiceQueryDto
   * @returns Service[]
   */
  async filterServices(query: ServiceQueryDto) {
    this.logger.log(`Filter: Fetch services, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Services = await this.serviceModel
      .find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched services successfully`);

    return Services;
  }

  /**
   * Update service with given update info
   *
   * @param id String
   * @param updateServiceDto UpdateServiceDto
   * @returns Service
   */
  async update(id: string, updateServiceDto: UpdateServiceDto) {
    this.logger.log(`Update: Update service of id: ${id}`);

    const updatedService = await this.serviceModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...updateServiceDto
        },
        { new: true }
      )
      .exec();

    if (!updatedService) {
      throw new NotFoundException(`service with ${id} is not found`);
    }
    this.logger.log(`Update: updated service of id ${id} successfully`);

    return updatedService;
  }
}
