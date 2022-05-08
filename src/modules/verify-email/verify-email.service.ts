import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { ClientSession, Model } from 'mongoose';

import { User } from '../users/interfaces/user.interface';
import { IMailResponse } from 'src/common/interfaces/mail-interface';
import { EmailVerification } from './interfaces/verify-email.interface';

import { ConfigService } from 'src/configs/config.service';
import { MailService } from 'src/common/modules/mail/mail.service';

@Injectable()
export class VerifyEmailService {
  private logger: Logger = new Logger('VerifyEmailService');

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('EmailVerification') private readonly emailVerificationModel: Model<EmailVerification>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Creates email verification token
   *
   * @param email string
   * @returns Promise<boolean>
   */
  async createEmailToken(email: string, session: ClientSession): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({ email: email });

    if (emailVerification && (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 < 15) {
      throw new HttpException('LOGIN.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const emailVerifyToken = await this.emailVerificationModel.create(
      {
        email: email,
        emailToken: (Math.floor(Math.random() * 9000000) + 1000000).toString(),
        timestamp: new Date()
      },
      { session }
    );

    return !!emailVerifyToken;
  }

  /**
   * Verifies the email
   *
   * @param token String
   * @returns Promise<boolean>
   */
  async verifyEmail(token: string): Promise<boolean> {
    const emailVerify = await this.emailVerificationModel.findOne({ emailToken: token });

    if (emailVerify && emailVerify.email) {
      const userFromDb = await this.userModel.findOne({ email: emailVerify.email });

      if (userFromDb) {
        userFromDb.auth.email.verified = true;
        const savedUser = await userFromDb.save();

        await emailVerify.remove();

        return !!savedUser;
      }
    } else {
      throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Sends email verification mail
   *
   * @param email String
   * @returns Promise<boolean>
   */
  async sendEmailVerification(email: string, autoPass = false): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email: email });

    if (model && model.emailToken) {
      try {
        const mailResponse: IMailResponse = await this.mailService.sendEmail('No-reply: Verify your email', 'Orange Cleaning', email, {
          template: 'confirm-account',
          context: {
            autoPass,
            receiverName: email,
            linkToActivate: `${this.configService.get('WEB_APP_URL')}/verify-email/${model.emailToken}`
          }
        });
        return mailResponse?.messageId ? true : false;
      } catch (error) {
        this.logger.error('Error: ', JSON.stringify(error));
        throw new HttpException('REGISTER.ERROR.SEND_MAIL', HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }
}
