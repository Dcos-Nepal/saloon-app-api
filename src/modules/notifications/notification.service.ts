import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateNotificationDto, NotificationQueryDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { INotification, Notification } from './interfaces/notification.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class NotificationService extends BaseService<Notification, INotification> {
  private logger: Logger;

  constructor(@InjectModel('Notification') private readonly serviceModel: Model<Notification>) {
    super(serviceModel);
    this.logger = new Logger(NotificationService.name);
  }

  /**
   * Create notification
   *
   * @param createDto CreateNotificationDto
   * @returns Notification
   */
  async create(createDto: CreateNotificationDto) {
    this.logger.log(`Create: Create notification `);

    const serviceData = new this.serviceModel(createDto);
    const notification = await serviceData.save();

    this.logger.log(`Create: Created notification of ${notification._id} successfully `);

    return notification;
  }

  /**
   * Filter notifications based on the query strings
   *
   * @param query NotificationQueryDto
   * @returns Notification[]
   */
  async filterServices(query: NotificationQueryDto) {
    this.logger.log(`Filter: Fetch notifications, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isRead = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Services = await this.serviceModel
      .find({ ...dataQuery, isRead })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched notifications successfully`);

    return Services;
  }

  /**
   * Update notification with given update info
   *
   * @param id String
   * @param updateServiceDto UpdateNotificationDto
   * @returns Notification
   */
  async update(id: string, updateServiceDto: UpdateNotificationDto) {
    this.logger.log(`Update: Update notification of id: ${id}`);

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
      throw new NotFoundException(`notification with ${id} is not found`);
    }
    this.logger.log(`Update: updated notification of id ${id} successfully`);

    return updatedService;
  }
}
