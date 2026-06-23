import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
  PUBLIC_FORM_ACTION_KEY,
  PublicFormAction,
} from './public-form.decorator';
import { PublicFormProtectionService } from './public-form-protection.service';

@Injectable()
export class PublicFormProtectionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly protectionService: PublicFormProtectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<PublicFormAction>(
      PUBLIC_FORM_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!action) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const block = await this.protectionService.check({
      action,
      body: (request.body || {}) as Record<string, any>,
      ip: this.getIp(request),
      origin: request.header('origin'),
      referer: request.header('referer'),
    });

    if (!block) {
      return true;
    }

    if (block.reason === 'rate-limit') {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    throw new ForbiddenException('Request rejected.');
  }

  private getIp(request: Request): string {
    const cloudflareIp = request.header('cf-connecting-ip');
    if (cloudflareIp) {
      return cloudflareIp.trim();
    }

    const realIp = request.header('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }

    const forwardedFor = request.header('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const ip =
      request.ip ||
      request.socket?.remoteAddress ||
      request.connection?.remoteAddress ||
      'unknown';

    return ip.replace(/^::ffff:/, '');
  }
}
