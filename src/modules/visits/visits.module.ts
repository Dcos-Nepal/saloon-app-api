import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { VisitSchema } from './schemas/visits.schema';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { UserDevicesModule } from '../devices/devices.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Visits', schema: VisitSchema }]), UserDevicesModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService]
})
export class VisitsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(VisitsController);
  }
}
