import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards, Type, Sse, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Notification } from './interfaces/notification.interface';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';

@Controller({
  path: '/notifications',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  private logger: Logger;

  constructor(private readonly notificationService: NotificationService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(NotificationController.name);
  }

  @Post()
  async create(@Body() createServiceDto: CreateNotificationDto) {
    try {
      const Notification = await this.notificationService.create(createServiceDto);

      if (Notification) {
        return new ResponseSuccess('NOTIFICATION.CREATE', Notification);
      } else {
        return new ResponseError('NOTIFICATION.ERROR.CREATE_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.CREATE_SERVICE_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: NotificationQueryDto) {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { title: { $regex: query.q, $options: 'i' } };
      }

      const ServicesResponse = await this.notificationService.findAll(filter, { query });

      if (ServicesResponse) {
        return new ResponseSuccess('NOTIFICATION.FILTER', ServicesResponse);
      } else {
        return new ResponseError('NOTIFICATION.ERROR.FILTER_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.FILTER_SERVICE_FAILED', error);
    }
  }

  @Get('/:notifyId')
  async findOne(@Param('notifyId') notifyId: string) {
    try {
      const Notification = await this.notificationService.findOne({ _id: notifyId });

      if (Notification) {
        return new ResponseSuccess('NOTIFICATION.FIND', Notification);
      } else {
        return new ResponseError('NOTIFICATION.ERROR.FIND_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.FIND_SERVICE_FAILED', error);
    }
  }

  @Patch('/:notifyId')
  async update(@Param('notifyId') notifyId: string, @Body() updateServiceDto: UpdateNotificationDto) {
    try {
      const Notification = await this.notificationService.update(notifyId, updateServiceDto);

      if (Notification) {
        return new ResponseSuccess('NOTIFICATION.UPDATE', Notification);
      } else {
        return new ResponseError('NOTIFICATION.ERROR.UPDATE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.UPDATE_FAILED', error);
    }
  }

  @Delete('/:notifyId')
  async remove(@Param('notifyId') notifyId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Notification;
      await session.withTransaction(async () => {
        removedItem = await this.notificationService.softDelete(notifyId, session);
      });
      session.endSession();
      return new ResponseSuccess('NOTIFICATION.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.DELETE_SERVICE_FAILED', error);
    }
  }

  @Put('/mark-as-read')
  async markNotificationAsRead(@CurrentUser() authUser: User) {
    try {
      let updatedNotifications: any;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        updatedNotifications = await this.notificationService.updateMany({ receiver: authUser._id }, { isRead: true }, session);
      });
      session.endSession();

      if (!!updatedNotifications) {
        return new ResponseSuccess('NOTIFICATION.UPDATE', Notification);
      } else {
        return new ResponseError('NOTIFICATION.ERROR.UPDATE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('NOTIFICATION.ERROR.UPDATE_FAILED', error);
    }
  }

  @Sse('/events/:receiver')
  async sse(@Param('receiver') receiver): Promise<Observable<MessageEvent<any>>> {
    const filter: mongoose.FilterQuery<Type> = {
      isRead: false
    };

    if (receiver) {
      filter.receiver = { $eq: receiver };
    }

    const start = new Date();
    filter.createdAt = { $lte: start };

    const data = await this.notificationService.findAll(filter);

    return interval(30000).pipe(map(() => ({ data: JSON.stringify(data) } as MessageEvent)));
  }
}
