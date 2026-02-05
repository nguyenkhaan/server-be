
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '@/bases/common/constants/app.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy , 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return {
        userID : payload.sub, 
        purpose: payload.purpose, 
        email : payload.email, 
        roles: payload.roles 
     };
  }
}
