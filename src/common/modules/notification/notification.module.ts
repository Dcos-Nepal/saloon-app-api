import { forwardRef, Global, Module } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
import { MobileNotificationService } from './service/mobile-notification.service';

@Global()
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [],
  providers: [MobileNotificationService],
  exports: [MobileNotificationService]
})
export class NotificationModule {}
