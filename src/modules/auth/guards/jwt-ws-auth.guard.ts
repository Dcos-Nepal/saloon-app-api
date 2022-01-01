import { BadRequestException, CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from 'src/configs/config.service';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/interfaces/user.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(@Inject(forwardRef(() => UsersService)) private userService: UsersService, private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;
    const jwtPayload = jwt.verify(authToken, this.configService.get('ACCESS_TOKEN_SECRET'));
    const user: User = await this.validate(jwtPayload);

    /**
     * Note if you need to access your user after the guard
     * Note: context.switchToWs().getData().user = user;
     */
    client.handshake.query.user = user.toObject();

    if (user && user?._id) {
      return true;
    } else {
      throw new BadRequestException('Invalid Authorization Token!');
    }
  }

  /**
   * Validate User
   * @param param0
   * @returns Promise<User>
   */
  private validate({ id }: any): Promise<User> {
    return this.userService.validateUserById(id);
  }
}
