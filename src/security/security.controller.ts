import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { PublicFormAction } from './public-form.decorator';
import { PublicFormProtectionService } from './public-form-protection.service';
import { Throttle } from '@nestjs/throttler';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly publicFormProtectionService: PublicFormProtectionService,
  ) {}

  @Get('public-form-token/:action')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  getPublicFormToken(
    @Param('action') action: PublicFormAction,
    @Req() request: Request,
  ) {
    if (!['quick-message', 'order'].includes(action)) {
      throw new ForbiddenException('Request rejected.');
    }

    const allowed = this.publicFormProtectionService.canIssueToken(
      request.header('origin'),
      request.header('referer'),
    );

    if (!allowed) {
      throw new ForbiddenException('Request rejected.');
    }

    return {
      token: this.publicFormProtectionService.createFormToken(action),
    };
  }
}
