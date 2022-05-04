import { HttpModule } from '@nestjs/axios';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { ConfigModule } from 'src/configs/config.module';
import { LoggerMiddleware } from '../../common/middlewares/middleware';
import { PropertiesService } from '../properties/properties.service';
import { PropertySchema } from '../properties/schemas/property.schema';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';
import { VerifyEmailModule } from '../verify-email/verify-email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Property', schema: PropertySchema }
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    ConfigModule,
    VerifyEmailModule
  ],
  controllers: [UsersController],
  providers: [UsersService, PropertiesService, PublicFilesService],
  exports: [UsersService]
})
export class UsersModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(UsersController);
  }
}
