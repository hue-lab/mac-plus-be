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
import { getClientIp } from '../shared/client-ip';

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
        {
          message: 'Too many requests. Please try again later.',
          reason: block.reason,
          key: block.key,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    throw new ForbiddenException({
      message: 'Request rejected.',
      reason: block.reason,
    });
  }

  private getIp(request: Request): string {
    return getClientIp(request);
  }
}
