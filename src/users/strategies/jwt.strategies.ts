import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategies extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('SECRET_FOR_ACCESS'),
    });
  }

  async validate(payload: JwtPayload) {
    return await this.userService.validate(payload.email);
  }
}
