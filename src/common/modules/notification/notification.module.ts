import { forwardRef, Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { generateVAPIDKeys, setVapidDetails } from 'web-push';
import { notificationConfig } from './config/notification.config';
import { AuthModule } from 'src/modules/auth/auth.module';

import { ConfigService } from 'src/configs/config.service';
import { WebNotificationService } from './service/web-notification.service';
import { MobileNotificationService } from './service/mobile-notification.service';

import { NotificationController } from './controller/notification.controller';

@Global()
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [MobileNotificationService, WebNotificationService],
  exports: [MobileNotificationService, WebNotificationService]
})
export class NotificationModule implements OnModuleInit {
  private logger: Logger = new Logger('NotificationModule');

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.logger.log('Getting web-push keys form json file');
    const vapid = notificationConfig.vapid;

    this.logger.log('Getting web-push keys form .env file');
    const envVapid = this.configService.getWebPushConfig();

    this.logger.log('Initializing web-push keys');
    vapid.subject = envVapid.subject || vapid.subject;
    vapid.publicKey = envVapid.publicKey || vapid.publicKey;
    vapid.privateKey = envVapid.privateKey || vapid.privateKey;

    this.logger.log('Setting web-push keys for web push notification');
    if (vapid.publicKey && vapid.privateKey) {
      return setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
    }

    this.logger.log('Generating web-push keys if no keys are set before');
    const { privateKey, publicKey } = generateVAPIDKeys();

    notificationConfig.vapid = {
      ...vapid,
      privateKey,
      publicKey
    };

    this.logger.log('Saving/Caching web-push keys if for future use');
    notificationConfig.save();
  }
}
