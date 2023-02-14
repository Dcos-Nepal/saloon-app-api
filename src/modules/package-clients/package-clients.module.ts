import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { PackageClientSchema } from './schemas/package-client.schema';
import { PackageClientsController } from './package-clients.controller';
import { PackageClientsService } from './package-clients.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'PackageClient', schema: PackageClientSchema }])],
  controllers: [PackageClientsController],
  providers: [PackageClientsService],
  exports: [PackageClientsService]
})
export class PackageClientsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}
