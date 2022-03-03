import { MongooseModule } from '@nestjs/mongoose';
import { JobRequestService } from './job-request.service';
import { JobRequestSchema } from './schemas/job-request.schema';
import { JobRequestController } from './job-request.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { UserDevicesModule } from '../devices/devices.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'JobRequest', schema: JobRequestSchema }]), UserDevicesModule],
  controllers: [JobRequestController],
  providers: [JobRequestService],
  exports: [JobRequestService]
})
export class JobRequestModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobRequestController);
  }
}
