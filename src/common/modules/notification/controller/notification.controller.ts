import { Controller, Get } from '@nestjs/common';
import { notificationConfig } from '../config/notification.config';

@Controller('/notifications')
export class NotificationController {
  @Get('config/web-push')
  getConfig() {
    return { webPublicKey: notificationConfig.vapid.publicKey };
  }
}
