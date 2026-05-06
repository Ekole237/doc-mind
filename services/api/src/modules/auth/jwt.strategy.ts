import { JwtPayload } from '#auth/domain/services/token.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';

const cookieExtractor = (req: FastifyRequest): string | null => {
  const token = req.cookies?.access_token;
  return typeof token === 'string' && token.length > 0 ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Sécurité: on supporte cookie HttpOnly (prioritaire) et Bearer pour compat API.
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      role_level: payload.role_level,
      is_guest: payload.is_guest,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
