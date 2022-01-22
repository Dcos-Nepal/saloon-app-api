import { MongooseModule } from '@nestjs/mongoose';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { PropertySchema } from './schemas/property.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService]
})
export class PropertiesModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(PropertiesController);
  }
}
