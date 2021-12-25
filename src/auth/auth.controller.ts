import { Controller, Post, HttpStatus, HttpCode, Get, Body, Param, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login } from './interfaces/login.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { User } from 'src/users/interfaces/user.interface';

@Controller({
  path: '/auth',
  version: '1.0.0',
})
export class AuthController {
  private logger: Logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService, private readonly userService: UsersService) { }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() login: Login): Promise<IResponse> {
    try {
      const response = await this.authService.validateLogin(login.email, login.password);
      return new ResponseSuccess("LOGIN.SUCCESS", response);
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("LOGIN.ERROR", error);
    }
  }

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: CreateUserDto): Promise<IResponse> {
    try {
      const newUser = await this.userService.createNewUser(createUserDto);
      await this.authService.createEmailToken(newUser.email);

      const sent = await this.authService.sendEmailVerification(newUser.email);

      if (sent) {
        return new ResponseSuccess("REGISTRATION.USER_REGISTERED_SUCCESSFULLY");
      }

      return new ResponseError("REGISTRATION.ERROR.MAIL_NOT_SENT");
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("REGISTRATION.ERROR.GENERIC_ERROR", error);
    }
  }

  @Get('/verify/:token')
  public async verifyEmail(@Param() params): Promise<IResponse> {
    try {
      const isEmailVerified = await this.authService.verifyEmail(params.token);
      return new ResponseSuccess("LOGIN.EMAIL_VERIFIED", isEmailVerified);
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("LOGIN.ERROR", error);
    }
  }

  @Post('/resend-verification')
  public async sendEmailVerification(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<IResponse> {
    try {
      await this.authService.createEmailToken(forgotPasswordDto.email);
      const isEmailSent = await this.authService.sendEmailVerification(forgotPasswordDto.email);

      if (isEmailSent) {
        return new ResponseSuccess("LOGIN.EMAIL_RESENT", null);
      } else {
        return new ResponseError("REGISTRATION.ERROR.MAIL_NOT_SENT");
      }
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("LOGIN.ERROR.SEND_EMAIL", error);
    }
  }

  @Post('/forgot-password')
  public async sendEmailForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<IResponse> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(forgotPasswordDto.email);

      if (isEmailSent) {
        return new ResponseSuccess("LOGIN.EMAIL_RESENT", null);
      } else {
        return new ResponseError("REGISTRATION.ERROR.MAIL_NOT_SENT");
      }
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("LOGIN.ERROR.SEND_EMAIL", error);
    }
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  public async setNewPassord(@Body() resetPassword: ResetPasswordDto): Promise<IResponse> {
    try {
      let isNewPasswordChanged: boolean = false;

      if (resetPassword.email && resetPassword.currentPassword) {
        const isValidPassword = await this.authService.checkPassword(resetPassword.email, resetPassword.currentPassword);

        if (isValidPassword) {
          isNewPasswordChanged = await this.userService.setPassword(resetPassword.email, resetPassword.newPassword);
        } else {
          return new ResponseError("RESET_PASSWORD.WRONG_CURRENT_PASSWORD");
        }
      } else if (resetPassword.newPasswordToken) {
        const forgottenPasswordModel = await this.authService.getForgotPasswordModel(resetPassword.newPasswordToken);
        isNewPasswordChanged = await this.userService.setPassword(forgottenPasswordModel.email, resetPassword.newPassword);
        if (isNewPasswordChanged) await forgottenPasswordModel.remove();
      } else {
        return new ResponseError("RESET_PASSWORD.CHANGE_PASSWORD_ERROR");
      }
      return new ResponseSuccess("RESET_PASSWORD.PASSWORD_CHANGED", isNewPasswordChanged);
    } catch (error) {
      this.logger.error("Error: ", error);
      return new ResponseError("RESET_PASSWORD.CHANGE_PASSWORD_ERROR", error);
    }
  }
}
