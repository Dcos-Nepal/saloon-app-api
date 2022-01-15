import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { JobSchema } from './schemas/jobs.schema';
import { JobsController } from './jobs.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Jobs', schema: JobSchema }])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(JobsController);
  }
}
