import * as mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';

import { Controller, Post, HttpStatus, HttpCode, Get, Body, Logger, Put, UseGuards } from '@nestjs/common';

import { UserLoginDto } from './dto/user-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';

import { IResponse } from '../../common/interfaces/response.interface';

import { AuthService } from './auth.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import { UsersService } from '../users/users.service';

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
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerUserDto: any): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        await this.userService.registerUser(registerUserDto, session);
      });
      session.endSession();

      return new ResponseSuccess('User registered successfully!');
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() login: UserLoginDto): Promise<IResponse> {
    try {
      const response = await this.authService.loginUser(login);

      return new ResponseSuccess('LOGIN.SUCCESS', response);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  public async me(@CurrentUser() user): Promise<IResponse> {
    try {
      return new ResponseSuccess('ME.SUCCESS', user);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
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
