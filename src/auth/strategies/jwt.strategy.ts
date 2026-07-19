import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getJwtSecret } from '../auth.config';
import {
  RefreshTokenSession,
  RefreshTokenSessionDocument,
} from '../schema/refresh-token-session.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(RefreshTokenSession.name)
    private readonly refreshSessionModel: Model<RefreshTokenSessionDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || !payload?.familyId) {
      throw new UnauthorizedException();
    }

    const activeSession = await this.refreshSessionModel
      .exists({
        userId: payload.sub,
        familyId: payload.familyId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!activeSession) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles,
      familyId: payload.familyId,
      jti: payload.jti,
    };
  }
}
