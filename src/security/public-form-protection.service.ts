import { Injectable } from '@nestjs/common';
import * as https from 'https';

import { PublicFormAction } from './public-form.decorator';

interface RateRule {
  limit: number;
  windowMs: number;
}

interface PublicFormRules {
  global: RateRule;
  ip: RateRule;
  ipLong: RateRule;
  phone?: RateRule;
  duplicate?: RateRule;
}

export interface PublicFormCheck {
  body: Record<string, any>;
  ip: string;
  origin?: string;
  referer?: string;
  action: PublicFormAction;
}

export interface PublicFormBlock {
  reason: 'origin' | 'honeypot' | 'captcha' | 'rate-limit';
  key?: string;
}

@Injectable()
export class PublicFormProtectionService {
  private readonly buckets = new Map<string, number[]>();

  private readonly rules: Record<PublicFormAction, PublicFormRules> = {
    'quick-message': {
      global: { limit: 40, windowMs: 60 * 1000 },
      ip: { limit: 3, windowMs: 60 * 1000 },
      ipLong: { limit: 12, windowMs: 60 * 60 * 1000 },
      phone: { limit: 2, windowMs: 60 * 60 * 1000 },
      duplicate: { limit: 1, windowMs: 24 * 60 * 60 * 1000 },
    },
    order: {
      global: { limit: 30, windowMs: 60 * 1000 },
      ip: { limit: 4, windowMs: 5 * 60 * 1000 },
      ipLong: { limit: 10, windowMs: 60 * 60 * 1000 },
      phone: { limit: 3, windowMs: 60 * 60 * 1000 },
      duplicate: { limit: 1, windowMs: 30 * 60 * 1000 },
    },
  };

  async check(input: PublicFormCheck): Promise<PublicFormBlock | null> {
    if (!this.isAllowedOrigin(input.origin, input.referer)) {
      return { reason: 'origin' };
    }

    if (this.hasHoneypotValue(input.body)) {
      return { reason: 'honeypot' };
    }

    const captchaValid = await this.isCaptchaValid(input.body, input.ip);
    if (!captchaValid) {
      return { reason: 'captcha' };
    }

    const rules = this.rules[input.action];
    const phone = this.getPhone(input.body);
    const duplicateKey = this.getDuplicateKey(input.action, input.body, phone);

    const attempts: Array<[string, string, RateRule | undefined]> = [
      [input.action, 'global', rules.global],
      [input.action, `ip:${input.ip}`, rules.ip],
      [input.action, `ip-long:${input.ip}`, rules.ipLong],
      [input.action, phone ? `phone:${phone}` : '', rules.phone],
      [input.action, duplicateKey ? `duplicate:${duplicateKey}` : '', rules.duplicate],
    ];

    for (const [scope, key, rule] of attempts) {
      if (!key || !rule) {
        continue;
      }

      const accepted = this.addAttempt(`${scope}:${key}`, rule);
      if (!accepted) {
        return { reason: 'rate-limit', key };
      }
    }

    return null;
  }

  private addAttempt(key: string, rule: RateRule): boolean {
    const now = Date.now();
    const timestamps = (this.buckets.get(key) ?? []).filter(
      (timestamp) => now - timestamp < rule.windowMs,
    );

    if (timestamps.length >= rule.limit) {
      this.buckets.set(key, timestamps);
      return false;
    }

    timestamps.push(now);
    this.buckets.set(key, timestamps);
    return true;
  }

  private isAllowedOrigin(origin?: string, referer?: string): boolean {
    if (process.env.PUBLIC_FORM_DISABLE_ORIGIN_CHECK === 'true') {
      return true;
    }

    const requestOrigin = origin || this.getOriginFromReferer(referer);
    if (!requestOrigin) {
      return false;
    }

    return this.getAllowedOrigins().includes(requestOrigin);
  }

  private getAllowedOrigins(): string[] {
    const raw = process.env.PUBLIC_FORM_ALLOWED_ORIGINS;
    if (raw) {
      return raw
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    }

    const origins = ['https://macplus.by', 'https://www.macplus.by'];

    if (process.env.NODE_ENV !== 'prod') {
      origins.push(
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5001',
        'http://127.0.0.1:5001',
      );
    }

    return origins;
  }

  private getOriginFromReferer(referer?: string): string | undefined {
    if (!referer) {
      return undefined;
    }

    try {
      return new URL(referer).origin;
    } catch (e) {
      return undefined;
    }
  }

  private hasHoneypotValue(body: Record<string, any>): boolean {
    const honeypotFields = [
      '_gotcha',
      'company',
      'fax',
      'homepage',
      'url',
      'website',
    ];

    return honeypotFields.some((field) => {
      const value = body?.[field];
      return typeof value === 'string' && value.trim().length > 0;
    });
  }

  private async isCaptchaValid(
    body: Record<string, any>,
    ip: string,
  ): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return true;
    }

    const token =
      body?.turnstileToken ||
      body?.captchaToken ||
      body?.['cf-turnstile-response'];

    if (!token || typeof token !== 'string') {
      return false;
    }

    return this.verifyTurnstile(secret, token, ip);
  }

  private verifyTurnstile(
    secret: string,
    token: string,
    ip: string,
  ): Promise<boolean> {
    const payload = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }).toString();

    return new Promise((resolve) => {
      const request = https.request(
        {
          hostname: 'challenges.cloudflare.com',
          path: '/turnstile/v0/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 3000,
        },
        (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(Boolean(result.success));
            } catch (e) {
              resolve(false);
            }
          });
        },
      );

      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
      request.on('error', () => resolve(false));
      request.write(payload);
      request.end();
    });
  }

  private getPhone(body: Record<string, any>): string | undefined {
    const phone = body?.phone || body?.customer?.phone;
    if (typeof phone !== 'string') {
      return undefined;
    }

    const normalized = phone.replace(/[^\d+]/g, '');
    return normalized.length >= 7 ? normalized : undefined;
  }

  private getDuplicateKey(
    action: PublicFormAction,
    body: Record<string, any>,
    phone?: string,
  ): string | undefined {
    if (!phone) {
      return undefined;
    }

    const payload =
      action === 'quick-message'
        ? `${body?.name || ''}:${body?.message || ''}`
        : JSON.stringify(
            (body?.cartItems || []).map((item) => ({
              productId: item?.productId,
              count: item?.count,
            })),
          );

    return `${phone}:${this.hash(payload)}`;
  }

  private hash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    return String(hash);
  }
}
