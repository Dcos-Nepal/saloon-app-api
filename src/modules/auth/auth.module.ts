import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { AuthController } from './auth.controller';
import { UserSchema } from '../users/schemas/user.schema';
import { EmailVerificationSchema } from './schemas/email-verification.schema';
import { ForgotPasswordSchema } from './schemas/forgot-password.schema';
import { ConsentRegistrySchema } from './schemas/consent-registry.schema';
import { UsersService } from '../users/users.service';
import { JWTService } from './passport/jwt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from '../../common/middlewares/logger.middleware';
import { ConfigModule } from 'src/configs/config.module';
import NodeMailerHelper from 'src/helpers/node-mailer-helper';
import { PropertiesService } from '../properties/properties.service';
import { PropertySchema } from '../properties/schemas/property.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'EmailVerification', schema: EmailVerificationSchema },
      { name: 'ForgotPassword', schema: ForgotPasswordSchema },
      { name: 'ConsentRegistry', schema: ConsentRegistrySchema },
      { name: 'Property', schema: PropertySchema }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PropertiesService, JWTService, JwtStrategy, { provide: 'NodeMailer', useClass: NodeMailerHelper }],
  exports: [AuthService, UsersService, JWTService, JwtStrategy]
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
