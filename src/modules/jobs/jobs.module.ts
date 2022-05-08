import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { UserSchema } from '../users/schemas/user.schema';
import { JobSchema } from './schemas/jobs.schema';
import { VisitSchema } from '../visits/schemas/visits.schema';

import { JobsController } from './jobs.controller';

import { JobsService } from './jobs.service';
import { VisitsService } from '../visits/visits.service';
import SmsService from 'src/common/modules/sms/sms.service';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';

import { UserDevicesModule } from '../devices/devices.module';
import { MailModule } from 'src/common/modules/mail/mail.module';
import { SmsModule } from 'src/common/modules/sms/sms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Jobs', schema: JobSchema },
      { name: 'Visits', schema: VisitSchema }
    ]),
    SmsModule,
    MailModule,
    UserDevicesModule
  ],
  controllers: [JobsController],
  providers: [MailService, JobsService, VisitsService, PublicFilesService, SmsService],
  exports: [JobsService, VisitsService]
})
export class JobsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobsController);
  }
}
