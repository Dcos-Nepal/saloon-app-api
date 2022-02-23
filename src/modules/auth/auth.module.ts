import { MongooseModule } from '@nestjs/mongoose';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '../../common/middlewares/middleware';

import { JwtStrategy } from './passport/jwt.strategy';

import { UserSchema } from '../users/schemas/user.schema';
import { PropertySchema } from '../properties/schemas/property.schema';
import { ForgotPasswordSchema } from './schemas/forgot-password.schema';
import { ConsentRegistrySchema } from './schemas/consent-registry.schema';
import { UserDevicesSchema } from '../devices/schemas/devices.schema';

import { ConfigModule } from 'src/configs/config.module';
import { MailModule } from 'src/common/modules/mail/mail.module';

import { AuthService } from './auth.service';
import { JWTService } from './passport/jwt.service';
import { UsersService } from '../users/users.service';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PropertiesService } from '../properties/properties.service';
import { UserDeviceService } from '../devices/devices.service';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';

import { AuthController } from './auth.controller';
import { VerifyEmailModule } from '../verify-email/verify-email.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserDevice', schema: UserDevicesSchema },
      { name: 'ForgotPassword', schema: ForgotPasswordSchema },
      { name: 'ConsentRegistry', schema: ConsentRegistrySchema },
      { name: 'Property', schema: PropertySchema }
    ]),
    MailModule,
    VerifyEmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PropertiesService, JWTService, JwtStrategy, MailService, PublicFilesService, UserDeviceService],
  exports: [AuthService, UsersService, JWTService, JwtStrategy]
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
