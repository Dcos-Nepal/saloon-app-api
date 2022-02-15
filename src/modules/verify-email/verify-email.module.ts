import { MongooseModule } from '@nestjs/mongoose';
import { Global, Module } from '@nestjs/common';

import { UserSchema } from '../users/schemas/user.schema';
import { EmailVerificationSchema } from './schemas/verify-email.schema';

import { ConfigModule } from 'src/configs/config.module';
import { MailModule } from 'src/common/modules/mail/mail.module';

import { MailService } from 'src/common/modules/mail/mail.service';
import { VerifyEmailService } from './verify-email.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'EmailVerification', schema: EmailVerificationSchema }
    ]),
    MailModule
  ],
  providers: [VerifyEmailService, MailService],
  exports: [VerifyEmailService]
})
export class VerifyEmailModule {}
