import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import { AppSocketGateway } from './app.socket';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LineItemsModule } from './modules/line-items/line-items.module';
import { JobRequestModule } from './modules/job-request/job-request.module';
import { QuoteModule } from './modules/quotes/quotes.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { VisitsModule } from './modules/visits/visits.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AWSModule } from './common/modules/aws/aws.module';
import { FilesModule } from './common/modules/files/files.module';
import { UserDevicesModule } from './modules/devices/devices.module';
import { PushNotificationModule } from './common/modules/notification/push-notification.module';
import { VerifyEmailModule } from './modules/verify-email/verify-email.module';
import { ServicesModule } from './modules/services/service.module';
import { NotifyModule } from './modules/notifications/notification.module';

@Module({
  imports: [
    ConfigModule,

    // Schedule Modules
    ScheduleModule.forRoot(),

    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),

    // Common Modules
    AWSModule,
    FilesModule,
    PushNotificationModule,

    // Custom Modules
    UsersModule,
    AuthModule,
    ChatModule,
    JobsModule,
    QuoteModule,
    VisitsModule,
    InvoiceModule,
    LineItemsModule,
    JobRequestModule,
    PropertiesModule,
    UserDevicesModule,
    VerifyEmailModule,
    ServicesModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService, AppSocketGateway]
})
export class AppModule {}
