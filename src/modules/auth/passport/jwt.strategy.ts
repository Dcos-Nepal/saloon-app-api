import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JWTService) {
    super({
      passReqToCallback: true,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  /**
   *
   * @param payload
   * @param req
   * @param done
   * @returns
   */
  public async validate(payload: any, req: any, done: any) {
    const user = await this.jwtService.validateUser(req);

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    done(null, user);
  }
}
