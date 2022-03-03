import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { JobSchema } from './schemas/jobs.schema';
import { JobsController } from './jobs.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VisitsService } from '../visits/visits.service';
import { VisitSchema } from '../visits/schemas/visits.schema';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';
import { UserDevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Jobs', schema: JobSchema },
      { name: 'Visits', schema: VisitSchema }
    ]),
    UserDevicesModule
  ],
  controllers: [JobsController],
  providers: [JobsService, VisitsService, PublicFilesService],
  exports: [JobsService, VisitsService]
})
export class JobsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobsController);
  }
}
