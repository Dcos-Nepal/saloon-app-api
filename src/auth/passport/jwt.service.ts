import { Model, ObjectId } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../../users/interfaces/user.interface';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class JWTService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly configService: ConfigService
  ) { }

  /**
   * 
   * @param id ObjectId | string
   * @param email string
   * @param roles string[]
   * @returns Object
   */
  async createToken(id: ObjectId | string, email: string, roles: string[]) {
    const accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    const refressTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    const accessTokenExpiresIn = this.configService.get('ACCESS_TOKEN_EXPIRATION');
    const refressTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRATION');

    const userInfo = { id, email: email, roles: roles };
    const accessTtoken = jwt.sign(userInfo, accessTokenSecret, { expiresIn: accessTokenExpiresIn });
    const refressTtoken = jwt.sign(userInfo, refressTokenSecret, { expiresIn: refressTokenExpiresIn });

    return {
      access_token: accessTtoken,
      refress_token: refressTtoken,
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
