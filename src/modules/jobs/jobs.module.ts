import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { UserSchema } from '../users/schemas/user.schema';
import { JobSchema } from './schemas/jobs.schema';
import { VisitSchema } from '../visits/schemas/visits.schema';

import { JobsController } from './jobs.controller';

import { JobsService } from './jobs.service';
import { VisitsService } from '../visits/visits.service';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';

import { UserDevicesModule } from '../devices/devices.module';
import { MailModule } from 'src/common/modules/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Jobs', schema: JobSchema },
      { name: 'Visits', schema: VisitSchema }
    ]),
    MailModule,
    UserDevicesModule
  ],
  controllers: [JobsController],
  providers: [MailService, JobsService, VisitsService, PublicFilesService],
  exports: [JobsService, VisitsService]
})
export class JobsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobsController);
  }
}
