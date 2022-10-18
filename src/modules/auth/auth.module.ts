import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '../../common/middlewares/middleware';

import { JwtStrategy } from './passport/jwt.strategy';
import { UserSchema } from '../users/schemas/user.schema';
import { ConfigModule } from 'src/configs/config.module';

import { AuthService } from './auth.service';
import { JWTService } from './passport/jwt.service';
import { UsersService } from '../users/users.service';

import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JWTService, JwtStrategy],
  exports: [AuthService, UsersService, JWTService, JwtStrategy]
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
