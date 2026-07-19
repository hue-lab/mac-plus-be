import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokenSession,
  RefreshTokenSessionDocument,
} from './schema/refresh-token-session.schema';

interface LoginAttempt {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, LoginAttempt>();
  private readonly dummyPasswordHash =
    '$2b$10$CwTycUXWue0Thq9StjUM0uJ8MyuOXDy4o1L1UyYgJ50fQvBW0sEcG';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshTokenSession.name)
    private readonly refreshSessionModel: Model<RefreshTokenSessionDocument>,
  ) {}

  async validateUser(
    username: string,
    password: string,
    request?: Request,
  ): Promise<any> {
    const ip = this.getIp(request);
    const attemptKey = this.getLoginAttemptKey(username, ip);
    if (this.isLoginBlocked(attemptKey)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let user;
    try {
      user = await this.userService.getUserByName(username);
    } catch (e) {
      await bcrypt.compare(password || '', this.dummyPasswordHash);
      this.registerFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password || '', user.password);
    if (!isPasswordMatch) {
      this.registerFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttempts.delete(attemptKey);
    return user;
  }

  async login(user: any, request?: Request) {
    const meta = this.getRequestMeta(request);
    const familyId = this.randomTokenPart(16);
    const refresh = await this.createRefreshSession(
      user._id.toString(),
      familyId,
      meta,
    );

    return this.createTokenPair(user, familyId, refresh.token);
  }

  async refresh(refreshToken: string, request?: Request) {
    const session = await this.refreshSessionModel
      .findOne({ tokenHash: this.hashToken(refreshToken) })
      .exec();

    if (!session) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    if (session.revokedAt || session.usedAt || session.expiresAt <= now) {
      await this.revokeFamily(session.familyId);
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userService.getUserById(session.userId);
    if (!user) {
      await this.revokeFamily(session.familyId);
      throw new UnauthorizedException('Invalid credentials');
    }

    const meta = this.getRequestMeta(request);
    const nextRefresh = await this.createRefreshSession(
      session.userId,
      session.familyId,
      meta,
    );

    session.usedAt = now;
    session.revokedAt = now;
    session.replacedByJti = nextRefresh.jti;
    await session.save();

    return this.createTokenPair(user, session.familyId, nextRefresh.token);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return { success: true };
    }

    const session = await this.refreshSessionModel
      .findOne({ tokenHash: this.hashToken(refreshToken) })
      .exec();

    if (session) {
      await this.revokeFamily(session.familyId);
    }

    return { success: true };
  }

  async getCurrentUser({ username, sub, userId, roles }) {
    return {
      sub: sub || userId,
      userId: sub || userId,
      username,
      roles,
    };
  }

  private async createRefreshSession(
    userId: string,
    familyId: string,
    meta: RequestMeta,
  ): Promise<{ token: string; jti: string }> {
    const jti = this.randomTokenPart(16);
    const secret = this.randomTokenPart(32);
    const token = `${jti}.${secret}`;
    const expiresAt = new Date(Date.now() + this.getRefreshTtlMs());

    await this.refreshSessionModel.create({
      userId,
      familyId,
      jti,
      tokenHash: this.hashToken(token),
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    });

    return { token, jti };
  }

  private createTokenPair(user: any, familyId: string, refreshToken: string) {
    const payload = {
      username: user.username,
      sub: user._id.toString(),
      roles: user.roles,
      familyId,
      jti: this.randomTokenPart(16),
    };

    return {
      username: payload.username,
      sub: payload.sub,
      roles: payload.roles,
      accessToken: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.refreshSessionModel
      .updateMany(
        { familyId, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token || '').digest('hex');
  }

  private randomTokenPart(bytes: number): string {
    return randomBytes(bytes).toString('hex');
  }

  private getRefreshTtlMs(): number {
    const value = process.env.JWT_REFRESH_TTL || '30d';
    const match = value.match(/^(\d+)(ms|s|m|h|d)?$/);
    if (!match) {
      return 30 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2] || 'ms';
    const multipliers = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  private getLoginAttemptKey(username: string, ip?: string): string {
    return `${(username || '').trim().toLowerCase()}:${ip || 'unknown'}`;
  }

  private isLoginBlocked(key: string): boolean {
    const attempt = this.loginAttempts.get(key);
    if (!attempt?.blockedUntil) {
      return false;
    }

    if (attempt.blockedUntil <= Date.now()) {
      this.loginAttempts.delete(key);
      return false;
    }

    return true;
  }

  private registerFailedLogin(key: string): void {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS || 5);
    const blockMs = Number(process.env.AUTH_LOGIN_BLOCK_MS || windowMs);
    const current = this.loginAttempts.get(key);
    const attempt =
      current && now - current.firstAttemptAt < windowMs
        ? current
        : { count: 0, firstAttemptAt: now };

    attempt.count += 1;
    if (attempt.count >= maxAttempts) {
      attempt.blockedUntil = now + blockMs;
    }

    this.loginAttempts.set(key, attempt);
  }

  private getRequestMeta(request?: Request): RequestMeta {
    return {
      ip: this.getIp(request),
      userAgent: request?.header('user-agent'),
    };
  }

  private getIp(request?: Request): string | undefined {
    const cloudflareIp = request?.header('cf-connecting-ip');
    if (cloudflareIp) {
      return cloudflareIp.trim();
    }

    const realIp = request?.header('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }

    const forwardedFor = request?.header('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return (
      request?.ip ||
      request?.socket?.remoteAddress ||
      request?.connection?.remoteAddress ||
      'unknown'
    )?.replace(/^::ffff:/, '');
  }
}
