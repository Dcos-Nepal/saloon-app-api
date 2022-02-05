import * as webPush from 'web-push';
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user';
import { generateHash } from 'src/common/utils';
import { User } from '../users/interfaces/user.interface';
import { UserDeviceService } from './devices.service';

import { ResponseSuccess } from 'src/common/dto/response.dto';

@Controller('/subscriptions')
export class SubscriptionController {
  subscriptions = {};
  constructor(private readonly deviceService: UserDeviceService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'))
  async subscribeForPushNotification(@Req() req) {
    const subscriptionRequest = req.body;
    const subscriptionId = generateHash(JSON.stringify(subscriptionRequest));

    this.subscriptions[subscriptionId] = subscriptionRequest;

    return new ResponseSuccess('Subscription Successful!', { id: subscriptionId });
  }

  // TODO Might be needed later
  // @Get('/:id')
  // @UseGuards(AuthGuard('jwt'))
  // async sendPushNotification(@Req() req) {
  //   const subscriptionId = req.params.id;
  //   const pushSubscription = this.subscriptions[subscriptionId];

  //   webPush
  //     .sendNotification(
  //       pushSubscription,
  //       JSON.stringify({
  //         title: 'New Product Available ',
  //         text: 'HEY! Take a look at this brand new t-shirt!',
  //         image: '/images/jason-leung-HM6TMmevbZQ-unsplash.jpg',
  //         tag: 'new-product',
  //         url: '/new-product-jason-leung-HM6TMmevbZQ-unsplash.html'
  //       })
  //     )
  //     .catch((err) => {
  //       console.log(err);
  //     });

  //   return new ResponseSuccess('Subscription send complete!', { id: subscriptionId });
  // }

  // @Get('/send')
  // @UseGuards(AuthGuard('jwt'))
  // async sendNotification(@CurrentUser() user: User) {
  //   this.deviceService.sendNotification(user.id, {
  //     notification: {
  //       title: 'New Product Available ',
  //       text: 'HEY! Take a look at this brand new t-shirt!',
  //       image: '/images/jason-leung-HM6TMmevbZQ-unsplash.jpg',
  //       tag: 'new-product',
  //       url: '/new-product-jason-leung-HM6TMmevbZQ-unsplash.html'
  //     },
  //     webData: {
  //       onActionClick: {
  //         default: {
  //           operation: 'navigateLastFocusedOrOpen',
  //           url: `http://direct-message/${user.firstName}`
  //         }
  //       }
  //     }
  //   });
  // }
}
