import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';

import { Token } from './guards/jwt-auth.guard';

import { UserDto } from '../users/dto/user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserLogoutDto } from './dto/user-logout.dto';

import { User } from '../users/interfaces/user.interface';
import { JWTService } from './passport/jwt.service';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(@InjectModel('User') private readonly userModel: Model<User>, private readonly jwtService: JWTService) {}

  /**
   * Logs in user and generate access and refresh token.
   * @param userLogin
   */
  async loginUser(userLogin: UserLoginDto) {
    const authUser = await this.validateLogin(userLogin.email, userLogin.password);

    if (!authUser.user?._id) {
      throw new NotFoundException('User for given credentials is not found');
    }

    if (authUser.user?._id && userLogin?.deviceType !== 'WEB' && authUser?.user?.roles.includes('ADMIN')) {
      throw new NotFoundException('User for given credentials is not found');
    }

    this.logger.log('Returning login info for user');
    return authUser;
  }

  /**
   * Validates Login using email and password
   *
   * @param email string
   * @param password string
   * @param tenant string
   * @returns Object
   */
  async validateLogin(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email, isDeleted: false });

    if (!userFromDb) {
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const isValidPass = await bcrypt.compare(password, userFromDb.password);

    if (isValidPass) {
      const tokenDetails = await this.jwtService.createToken(userFromDb._id, email, userFromDb.roles, userFromDb.shopId);
      return { user: new UserDto(userFromDb), token: { ...tokenDetails } };
    } else {
      throw new HttpException('LOGIN.ERROR', HttpStatus.UNAUTHORIZED);
    }
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
      const tokenDetails = await this.jwtService.createToken(user._id, user.email, user.roles, user.shopId);

      return { ...tokenDetails };
    } catch (e) {
      throw new BadRequestException('Invalid Refresh token provided');
    }
  }
}
