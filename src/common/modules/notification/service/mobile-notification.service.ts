import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { fcm } from '../config/firebase.config';

@Injectable()
export class MobileNotificationService {
  /**
   * Send Push Notification to one or many devices using their tokens
   *
   * @param token String | String[]
   * @param payload MessagingPayload
   * @returns void
   */
  async sendNotification(token: string | string[], payload: messaging.MessagingPayload) {
    return fcm.sendToDevice(token, {
      ...payload,
      data: {
        ...payload.data,
        click_action: 'APP_NOTIFICATION_CLICK'
      }
    });
  }
}
