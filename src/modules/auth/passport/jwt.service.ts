import { Model, ObjectId } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../../users/interfaces/user.interface';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class JWTService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>, private readonly configService: ConfigService) {}

  /**
   * Generates Access and Refresh Token
   *
   * @param id ObjectId | string
   * @param email string
   * @param roles string[]
   * @param tenant string[]
   * @returns Object
   */
  async createToken(id: ObjectId | string, email: string, roles: string[], tenant: string = null) {
    const accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    const refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    const accessTokenExpiresIn = this.configService.get('ACCESS_TOKEN_EXPIRATION');
    const refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRATION');

    const userInfo = { id, email: email, roles: roles, shopId: tenant };
    const accessToken = jwt.sign(userInfo, accessTokenSecret, { expiresIn: accessTokenExpiresIn });
    const refreshToken = jwt.sign(userInfo, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   *
   * @param signedUser
   * @returns
   */
  async validateUser(signedUser): Promise<User> {
    const userFromDb = await this.userModel.findOne({ email: signedUser.email });

    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }
}
