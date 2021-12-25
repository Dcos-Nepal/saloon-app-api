import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';

import { JWTService } from './passport/jwt.service';
import { ConfigService } from 'src/configs/config.service';

import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/interfaces/user.interface';
import { EmailVerification } from './interfaces/email-verification.interface';
import { ForgotPassword } from './interfaces/forgot-password.interface';
import { ConsentRegistry } from './interfaces/consent-registry.interface';
import { ConsentType } from './schemas/consent-registry.schema';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(@InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('EmailVerification') private readonly emailVerificationModel: Model<EmailVerification>,
    @InjectModel('ForgotPassword') private readonly forgotPasswordModel: Model<ForgotPassword>,
    @InjectModel('ConsentRegistry') private readonly consentRegistryModel: Model<ConsentRegistry>,
    private readonly jwtService: JWTService,
    private readonly configService: ConfigService) { }

  /**
   * Validates Login using email and password
   * 
   * @param email string
   * @param password string
   * @returns Object
   */
  async validateLogin(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email: email });

    if (!userFromDb){ 
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (!userFromDb.auth.email.valid){
      throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
    }

    const isValidPass = await bcrypt.compare(password, userFromDb.password);

    if (isValidPass) {
      const tokenDetails = await this.jwtService.createToken(userFromDb._id, email, userFromDb.roles);
      return { user: new UserDto(userFromDb), token: {...tokenDetails} }
    } else {
      throw new HttpException('LOGIN.ERROR', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Creates email verification token
   * 
   * @param email string
   * @returns Promise<boolean>
   */
  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({ email: email });

    if (emailVerification && ((new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 < 15)) {
      throw new HttpException('LOGIN.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.emailVerificationModel.findOneAndUpdate(
      { email: email },
      {
        email: email,
        emailToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString(), //Generate 7 digits number
        timestamp: new Date()
      },
      { upsert: true }
    );

    return true;
  }

  /**
   * Records User's Consent 
   * 
   * @param userId Types.ObjectId
   * @param consentType ConsentType
   * @param isAccepted Boolean
   * 
   * @returns Promise<ConsentRegistry>
   */
  async saveUserConsent(userId: Types.ObjectId, consentType: ConsentType, isAccepted: boolean): Promise<ConsentRegistry> {
    try {
      const http = new HttpService();
      const consent = new this.consentRegistryModel();

      consent.user = userId;
      consent.type = consentType;
  
      if (consentType === ConsentType.PRIVACY_POLICY) {
        const privacyPolicyResponse: any = await http.get("https://www.XXXXXX.com/api/privacy-policy").toPromise()
        consent.content = privacyPolicyResponse.data.content;
      }
      
      if (consentType === ConsentType.COOKIES_POLICY) {
        const cookiePolicyResponse: any = await http.get("https://www.XXXXXX.com/api/cookie-policy").toPromise()
        consent.content = cookiePolicyResponse.data.content;
      }

      if (consentType === ConsentType.TERMS_N_CONDITIONS) {
        const termsAndCondResponse: any = await http.get("https://www.XXXXXX.com/api/terms-and-conditions").toPromise()
        consent.content = termsAndCondResponse.data.content;
      }

      consent.isAccepted = isAccepted;
      consent.date = new Date();

      if (consent.content) {
        this.logger.log("Consent: Saving the user consent.")
        return await consent.save();
      }

      return Promise.resolve(consent);
    } catch (error) {
      this.logger.error("Error: ", error);
      this.logger.error("Error in saving user's consent.");
      throw new HttpException('CONSENT.ERROR.GENERIC_ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async createForgotPasswordToken(email: string): Promise<ForgotPassword> {
    const forgotPassword = await this.forgotPasswordModel.findOne({ email: email });
    if (forgotPassword && ((new Date().getTime() - forgotPassword.timestamp.getTime()) / 60000 < 15)) {
      throw new HttpException('RESET_PASSWORD.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const forgotPasswordModel = await this.forgotPasswordModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          newPasswordToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString(), //Generate 7 digits number,
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );
      if (forgotPasswordModel) {
        return forgotPasswordModel;
      } else {
        throw new HttpException('LOGIN.ERROR.GENERIC_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * 
   * @param token 
   * @returns 
   */
  async verifyEmail(token: string): Promise<boolean> {
    const emailVerif = await this.emailVerificationModel.findOne({ emailToken: token });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.userModel.findOne({ email: emailVerif.email });
      if (userFromDb) {
        userFromDb.auth.email.valid = true;
        const savedUser = await userFromDb.save();
        await emailVerif.remove();
        return !!savedUser;
      }
    } else {
      throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
    }
  }

  async getForgotPasswordModel(newPasswordToken: string): Promise<ForgotPassword> {
    return await this.forgotPasswordModel.findOne({ newPasswordToken: newPasswordToken });
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email: email });

    if (model && model.emailToken) {
      const transporter = nodemailer.createTransport({
        host: this.configService.get("MAIL_HOST"),
        port: this.configService.get("MAIL_PORT"),
        secure: parseInt(this.configService.get("MAIL_SECURE")), // true for 465, false for other ports
        auth: {
          user: this.configService.get("MAIL_USER"),
          pass: this.configService.get("MAIL_PASS")
        }
      });

      const mailOptions = {
        from: '"Orange Cleaning (AU)" <' + this.configService.get("MAIL_USER") + '>',
        to: email, // list of receivers (separated by ,)
        subject: 'Verify Email',
        text: 'Verify Email',
        html: 'Hi! <br><br> Thanks for your registration<br><br>' +
          '<a href=' + this.configService.get("API_SERVER_URL") + ':' + this.configService.get("SERVER_PORT") + '/auth/email/verify/' + model.emailToken + '>Click here to activate your account</a>'  // html body
      };

      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      })

      return sent;
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await bcrypt.compare(password, userFromDb.password);
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgotPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      let transporter = nodemailer.createTransport({
        host: this.configService.get('MAIL_HOST'),
        port: this.configService.get("MAIL_PORT"),
        secure: parseInt(this.configService.get("MAIL_SECURE")), // true for 465, false for other ports
        auth: {
          user: this.configService.get("MAIL_USER"),
          pass: this.configService.get("MAIL_PASS")
        }
      });

      let mailOptions = {
        from: '"Orange Cleaning (AU)" <' + this.configService.get("MAIL_USER") + '>',
        to: email, // list of receivers (separated by ,)
        subject: 'Frogotten Password',
        text: 'Forgot Password',
        html: 'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href=' + this.configService.get("API_SERVER_URL") + ':' + this.configService.get("SERVER_PORT") + '/auth/email/reset-password/' + tokenModel.newPasswordToken + '>Click here</a>'  // html body
      };

      const sended = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      })

      return sended;
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }
}
