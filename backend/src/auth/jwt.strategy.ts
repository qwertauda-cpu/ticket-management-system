import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_STRATEGY } from './auth.constants';
import type { AuthUser, JwtPayload } from './auth.types';
import { requireEnv } from './auth.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH_JWT_STRATEGY) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return {
      userId: payload.sub,
      sub: payload.sub,
      tenantId: payload.tenantId,
      tenantUserId: payload.tenantUserId,
      email: payload.email,
      name: payload.name,
      permissions: payload.permissions || [],
      isOwner: payload.isOwner || false,
    } as any;
  }
}


