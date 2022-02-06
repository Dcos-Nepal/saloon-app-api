import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import * as webPush from 'web-push';

@Injectable()
export class WebNotificationService {
  /**
   * Send Web Push Notification to one or many devices using their tokens
   *
   * @param subscription PushSubscription
   * @param payload WebpushConfig
   * @returns void
   */
  sendNotification(subscription: webPush.PushSubscription, payload: messaging.WebpushConfig) {
    return webPush.sendNotification(
      subscription,
      JSON.stringify({
        ...payload,
        notification: { ...payload.notification, data: payload.data }
      })
    );
  }
}
