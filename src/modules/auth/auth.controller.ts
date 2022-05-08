import * as mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, HttpStatus, HttpCode, Get, Body, Param, Logger, Put, UseGuards, Delete } from '@nestjs/common';

import { IResponse } from '../../common/interfaces/response.interface';

import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserLoginDto } from './dto/user-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user';
import { InjectConnection } from '@nestjs/mongoose';
import { UserLogoutDto } from './dto/user-logout.dto';
import { VerifyEmailService } from '../verify-email/verify-email.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

@ApiTags('Authentication')
@Controller({
  path: '/auth',
  version: '1'
})
export class AuthController {
  private logger: Logger = new Logger('AuthController');

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly verifyEmailService: VerifyEmailService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerUserDto: RegisterUserDto): Promise<IResponse> {
    try {
      let sent = false;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        const newUser = await this.userService.registerUser(registerUserDto, session);
        await this.verifyEmailService.createEmailToken(newUser.email, session);

        sent = await this.verifyEmailService.sendEmailVerification(newUser.email);
      });
      session.endSession();

      if (sent) {
        return new ResponseSuccess('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
      }

      return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() login: UserLoginDto): Promise<IResponse> {
    try {
      let response = null;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        response = await this.authService.loginUser(login, session);
      });
      session.endSession();

      return new ResponseSuccess('LOGIN.SUCCESS', response);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Delete('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  public async logout(@CurrentUser() user, @Body() logout: UserLogoutDto): Promise<IResponse> {
    try {
      let response = null;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        response = await this.authService.logoutUser(user?._id.toString(), logout, session);
      });
      session.endSession();

      return new ResponseSuccess('LOGOUT.SUCCESS', response);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Get('/verify/:token')
  public async verifyEmail(@Param() params): Promise<IResponse> {
    try {
      const isEmailVerified = await this.verifyEmailService.verifyEmail(params.token);
      return new ResponseSuccess('LOGIN.EMAIL_VERIFIED', isEmailVerified);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Post('/resend-verification')
  public async sendEmailVerification(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<IResponse> {
    try {
      let isEmailSent = false;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        await this.verifyEmailService.createEmailToken(forgotPasswordDto.email, session);
        isEmailSent = await this.verifyEmailService.sendEmailVerification(forgotPasswordDto.email);
      });
      session.endSession();

      if (isEmailSent) {
        return new ResponseSuccess('REGISTER.EMAIL_SENT_SUCCESSFULLY');
      }

      return new ResponseError('REGISTER.ERROR.MAIL_NOT_SENT');
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Post('/forgot-password')
  public async sendEmailForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<IResponse> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(forgotPasswordDto.email);

      if (isEmailSent) {
        return new ResponseSuccess('FORGOT.EMAIL_SENT', null);
      } else {
        return new ResponseError('FORGOT.ERROR.MAIL_NOT_SENT');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('FORGOT.ERROR.SEND_EMAIL', error);
    }
  }

  @Post('/reset-password')
  public async setNewPassword(@Body() resetPassword: ResetPasswordDto): Promise<IResponse> {
    try {
      let isNewPasswordChanged = false;

      if (resetPassword.email && resetPassword.currentPassword) {
        const isValidPassword = await this.authService.checkPassword(resetPassword.email, resetPassword.currentPassword);

        if (isValidPassword) {
          isNewPasswordChanged = await this.userService.setPassword(resetPassword.email, resetPassword.newPassword);
        } else {
          return new ResponseError('RESET_PASSWORD.WRONG_CURRENT_PASSWORD');
        }
      } else if (resetPassword.passwordToken) {
        const forgottenPasswordModel = await this.authService.getForgotPasswordModel(resetPassword.passwordToken);
        isNewPasswordChanged = await this.userService.setPassword(forgottenPasswordModel.email, resetPassword.newPassword);

        if (isNewPasswordChanged) {
          await forgottenPasswordModel.remove();
          // TODO [Good to have]
          // Send password reset successfully email
        }
      } else {
        return new ResponseError('RESET_PASSWORD.CHANGE_PASSWORD_ERROR');
      }
      return new ResponseSuccess('RESET_PASSWORD.PASSWORD_CHANGED', isNewPasswordChanged);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('RESET_PASSWORD.CHANGE_PASSWORD_ERROR', error);
    }
  }

  @Put('/refresh')
  public async refreshToken(@Body() refreshTokenReq: RefreshTokenDto): Promise<IResponse> {
    try {
      const token = await this.authService.refreshToken(refreshTokenReq.refreshToken);
      return new ResponseSuccess('GENERIC.TOKEN_REFRESHED', token);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }
}
