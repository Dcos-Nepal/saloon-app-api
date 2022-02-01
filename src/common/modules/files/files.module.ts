import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { ConfigModule } from '@nestjs/config';

import { PublicFilesService } from './public-files.service';
import { FilesController } from './public-files.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [PublicFilesService],
  exports: [PublicFilesService]
})
export class FilesModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(FilesController);
  }
}
