import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BaseService from 'src/base/base-service';
import { IUserDevice, UserDevice } from './interfaces/device.interface';

import { messaging } from 'firebase-admin';
import { Dictionary } from 'code-config/dist/types';
import { DeviceType } from './schemas/devices.schema';
import { WebNotificationService } from 'src/common/modules/notification/service/web-notification.service';
import { MobileNotificationService } from 'src/common/modules/notification/service/mobile-notification.service';
import { IFindAll } from 'src/common/interfaces';

export interface NotificationPayload {
  notification: messaging.NotificationMessagePayload;
  webData: Dictionary;
  mobileData: Dictionary;
}

@Injectable()
export class UserDeviceService extends BaseService<UserDevice, IUserDevice> {
  private logger: Logger = new Logger('UserDeviceService');

  constructor(
    @InjectModel('UserDevice') private readonly userDevice: Model<UserDevice>,
    private webNotificationService: WebNotificationService,
    private mobileNotificationService: MobileNotificationService
  ) {
    super(userDevice);
  }

  /**
   * Sends Push or Web push notification based on Users logged in devices.
   *
   * @param userId String
   * @param payload Partial<NotificationPayload>
   * @returns Void
   */
  async sendNotification(userId: string, payload: Partial<NotificationPayload>) {
    const subscriptions: IFindAll<UserDevice> = await this.findAll({ id: userId });

    for (const subscription of subscriptions.rows) {
      switch (subscription.deviceType) {
        case DeviceType.WEB:
          this.webNotificationService
            .sendNotification(subscription.deviceToken, {
              notification: payload.notification,
              data: payload.webData
            })
            .catch((e) => this.logger.debug(`${subscription.deviceType} ${e}`));
          break;

        case DeviceType.IOS:
        case DeviceType.ANDROID:
          this.mobileNotificationService
            .sendNotification(subscription.deviceToken, {
              notification: payload.notification,
              data: payload.mobileData
            })
            .catch((e) => this.logger.debug(`${subscription.deviceType} ${e}`));
          break;
        default:
          break;
      }
    }
  }
}
