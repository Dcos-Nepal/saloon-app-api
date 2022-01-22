import { MongooseModule } from '@nestjs/mongoose';
import { VisitsService } from './visits.service';
import { VisitSchema } from './schemas/visits.schema';
import { VisitsController } from './visits.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Visits', schema: VisitSchema }])],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService]
})
export class VisitsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(VisitsController);
  }
}
