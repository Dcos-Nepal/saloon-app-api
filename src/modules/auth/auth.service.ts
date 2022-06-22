import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { ClientSession, Model, Types } from 'mongoose';

import { Token } from './guards/jwt-auth.guard';

import { ConsentType } from './schemas/consent-registry.schema';

import { UserDto } from '../users/dto/user.dto';
import { UserLoginDto } from './dto/user-login.dto';

import { IWorker, User } from '../users/interfaces/user.interface';
import { ForgotPassword } from './interfaces/forgot-password.interface';
import { ConsentRegistry } from './interfaces/consent-registry.interface';

import { JWTService } from './passport/jwt.service';
import { UserDeviceService } from '../devices/devices.service';
import { IUserDevice, UserDevice } from '../devices/interfaces/device.interface';
import { UserLogoutDto } from './dto/user-logout.dto';
import { IMailResponse } from 'src/common/interfaces/mail-interface';
import { MailService } from 'src/common/modules/mail/mail.service';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('ForgotPassword') private readonly forgotPasswordModel: Model<ForgotPassword>,
    @InjectModel('ConsentRegistry') private readonly consentRegistryModel: Model<ConsentRegistry>,
    private readonly configService: ConfigService,
    private readonly jwtService: JWTService,
    private readonly mailService: MailService,
    private readonly userDeviceService: UserDeviceService
  ) {}

  /**
   * Logs in user and generate access and refresh token.
   * @param userLogin
   */
  async loginUser(userLogin: UserLoginDto, session: ClientSession) {
    const authUser = await this.validateLogin(userLogin.email, userLogin.password);

    if (!authUser.user?._id) {
      throw new NotFoundException('User for given credentials is not found');
    }

    if (authUser.user?._id && userLogin?.deviceType !== 'WEB' && authUser?.user?.roles.includes('ADMIN')) {
      throw new NotFoundException('User for given credentials is not found');
    }

    const userDeviceDto: IUserDevice = {
      user: authUser.user?._id.toString(),
      deviceToken: userLogin.deviceToken,
      deviceType: userLogin.deviceType
    };

    this.logger.log('Now check if the device already exists in the db.');
    const userDevice: UserDevice = await this.userDeviceService.findOne(userDeviceDto);

    if (!userDevice) {
      this.logger.log('Registering new device for the user login');
      await this.userDeviceService.create(userDeviceDto, session);
    }

    this.logger.log('Returning login info for user');
    return authUser;
  }

  /**
   * Logout user and clear device from database.
   * @param userId
   * @param userLogout
   * @param session
   * @returns
   */
  async logoutUser(userId: string, userLogout: UserLogoutDto, session: ClientSession) {
    const userDeviceDto: IUserDevice = {
      user: userId,
      deviceToken: userLogout.deviceToken,
      deviceType: userLogout.deviceType
    };

    this.logger.log('Now check if the device already exists in the db.');
    const userDevice: UserDevice = await this.userDeviceService.findOne(userDeviceDto);

    if (userDevice?.id) {
      this.logger.log('Cleaning existing device for the user');
      await this.userDeviceService.remove(userDevice?.id, session);
    }

    this.logger.log('Returning the logout status of the user');
    return true;
  }

  /**
   * Validates Login using email and password
   *
   * @param email string
   * @param password string
   * @returns Object
   */
  async validateLogin(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email: email });

    if (!userFromDb) {
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (!userFromDb.auth.email.verified) {
      throw new HttpException('LOGIN.EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
    }

    if (userFromDb?.userData?.type === 'WORKER' && !(userFromDb?.userData as IWorker)?.isApproved) {
      throw new HttpException('LOGIN.USER_NOT_APPROVED', HttpStatus.FORBIDDEN);
    }

    const isValidPass = await bcrypt.compare(password, userFromDb.password);

    if (isValidPass) {
      const tokenDetails = await this.jwtService.createToken(userFromDb._id, email, userFromDb.roles);
      return { user: new UserDto(userFromDb), token: { ...tokenDetails } };
    } else {
      throw new HttpException('LOGIN.ERROR', HttpStatus.UNAUTHORIZED);
    }
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
        const privacyPolicyResponse: any = await http.get('https://www.XXXXXX.com/api/privacy-policy').toPromise();
        consent.content = privacyPolicyResponse.data.content;
      }

      if (consentType === ConsentType.COOKIES_POLICY) {
        const cookiePolicyResponse: any = await http.get('https://www.XXXXXX.com/api/cookie-policy').toPromise();
        consent.content = cookiePolicyResponse.data.content;
      }

      if (consentType === ConsentType.TERMS_N_CONDITIONS) {
        const termsAndCondResponse: any = await http.get('https://www.XXXXXX.com/api/terms-and-conditions').toPromise();
        consent.content = termsAndCondResponse.data.content;
      }

      consent.isAccepted = isAccepted;
      consent.date = new Date();

      if (consent.content) {
        this.logger.log('Consent: Saving the user consent.');
        return await consent.save();
      }

      return Promise.resolve(consent);
    } catch (error) {
      this.logger.error('Error: ', error);
      this.logger.error("Error in saving user's consent.");
      throw new HttpException('CONSENT.ERROR.GENERIC_ERROR', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Creates a forgot password token
   *
   * @param email String
   * @returns Promise<ForgotPassword>
   */
  private async createForgotPasswordToken(email: string): Promise<ForgotPassword> {
    const forgotPassword = await this.forgotPasswordModel.findOne({ email: email });
    if (forgotPassword && (new Date().getTime() - forgotPassword.timestamp.getTime()) / 60000 < 15) {
      throw new HttpException('RESET_PASSWORD.EMAIL_SENDED_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const forgotPasswordModel = await this.forgotPasswordModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          newPasswordToken: (Math.floor(Math.random() * 9000000) + 1000000).toString(), //Generate 7 digits number,
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
   * Gets Forget Password model
   *
   * @param newPasswordToken String
   * @returns Promise<ForgotPassword>
   */
  async getForgotPasswordModel(newPasswordToken: string): Promise<ForgotPassword> {
    return await this.forgotPasswordModel.findOne({ newPasswordToken: newPasswordToken });
  }

  /**
   * Checks Password using the email
   *
   * @param email String
   * @param password String
   * @returns String
   */
  async checkPassword(email: string, password: string): Promise<string> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await bcrypt.compare(password, userFromDb.password);
  }

  /**
   * Sends forgot password email
   *
   * @param email String
   * @returns Promise<boolean>
   */
  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgotPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      try {
        const mailResponse: IMailResponse = await this.mailService.sendEmail(
          'Password reset request',
          `"Orange Cleaning" <${this.configService.getMailConfig().MAIL_USER}>`,
          email,
          {
            template: 'forgot-password',
            context: {
              receiverName: userFromDb.fullName,
              linkToPasswordReset: `${this.configService.get('WEB_APP_URL')}/change-password/${tokenModel.newPasswordToken}`
            }
          }
        );
        return mailResponse?.messageId ? true : false;
      } catch (error) {
        this.logger.error('Error: ', JSON.stringify(error));
        throw new HttpException('REQUEST_PWD.ERROR.SEND_MAIL', HttpStatus.FORBIDDEN);
      }
    }
  }

  /**
   * Validate Refresh Token and generate new pair of Tokens
   *
   * @param token String
   * @returns Object
   */
  async refreshToken(token: string) {
    const decodedToken = jwt.decode(token) as Token;

    if (!decodedToken) {
      throw new BadRequestException('Unable to decode refresh Token');
    }

    if (Date.now() >= decodedToken.exp * 1000) {
      throw new BadRequestException('Refresh token expired');
    }

    try {
      // Verifying refresh token
      await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      const user = await this.userModel.findById(decodedToken.id);
      const tokenDetails = await this.jwtService.createToken(user._id, user.email, user.roles);

      return { ...tokenDetails };
    } catch (e) {
      throw new BadRequestException('Invalid Refresh token provided');
    }
  }
}
