import * as webPush from 'web-push';
import * as mongoose from 'mongoose';

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user';
import { generateHash } from 'src/common/utils';
import { User } from '../users/interfaces/user.interface';
import { UserDeviceService } from './devices.service';

import { ResponseSuccess } from 'src/common/dto/response.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { UserDevice } from './interfaces/device.interface';

@Controller('/subscriptions')
export class SubscriptionController {
  constructor(private readonly deviceService: UserDeviceService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Post('/subscribe')
  async subscribeForPushNotification(@Body() body, @CurrentUser() user: User) {
    const subscriptionRequest = body;
    const subscriptionId = generateHash(JSON.stringify(subscriptionRequest));

    const session = await this.connection.startSession();
    let newSubscription: UserDevice;
    await session.withTransaction(async () => {
      newSubscription = await this.deviceService.create(
        {
          user: user.id,
          deviceType: 'WEB',
          subscription: subscriptionRequest,
          deviceToken: subscriptionId
        },
        session
      );
    });
    session.endSession();

    return new ResponseSuccess('Subscription Successful!', { subscription: newSubscription });
  }

  @Get('/notify-web')
  @UseGuards(AuthGuard('jwt'))
  async sendWebNotification(@CurrentUser() user: User) {
    this.deviceService.sendNotification(user.id, {
      notification: {
        title: 'New Product Available ',
        text: 'HEY! Take a look at this brand new t-shirt!',
        image: '/images/jason-leung-HM6TMmevbZQ-unsplash.jpg',
        tag: 'new-product',
        url: '/new-product-jason-leung-HM6TMmevbZQ-unsplash.html'
      },
      webData: {
        onActionClick: {
          default: {
            operation: 'navigateLastFocusedOrOpen',
            url: `http://direct-message/${user.firstName}`
          }
        }
      }
    });
  }

  @Get('/notify-mobile')
  @UseGuards(AuthGuard('jwt'))
  async sendMobileNotification(@CurrentUser() user: User) {
    this.deviceService.sendNotification(user.id, {
      notification: {
        title: user.fullName,
        body: 'Some Message'
      },
      mobileData: {
        type: 'Test',
        routeName: '/direct-message',
        username: user.firstName
      }
    });
  }
}
