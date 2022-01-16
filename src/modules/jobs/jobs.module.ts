import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { JobSchema } from './schemas/jobs.schema';
import { JobsController } from './jobs.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { VisitsService } from '../visits/visits.service';
import { VisitSchema } from '../visits/schemas/visits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Jobs', schema: JobSchema },
      { name: 'Visits', schema: VisitSchema }
    ])
  ],
  controllers: [JobsController],
  providers: [JobsService, VisitsService],
  exports: [JobsService, VisitsService]
})
export class JobsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobsController);
  }
}
