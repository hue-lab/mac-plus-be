import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PublicFormProtectionGuard } from './public-form-protection.guard';

describe('PublicFormProtectionGuard', () => {
  const createContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          body: {},
          header: jest.fn(),
          ip: '127.0.0.1',
          socket: {},
          connection: {},
        })),
      })),
    }) as any;

  it('returns a captcha reason on captcha blocks', async () => {
    const guard = new PublicFormProtectionGuard(
      {
        getAllAndOverride: jest.fn(() => 'order'),
      } as unknown as Reflector,
      {
        check: jest.fn(async () => ({ reason: 'captcha' })),
      } as any,
    );

    await expect(guard.canActivate(createContext())).rejects.toMatchObject({
      response: {
        message: 'Request rejected.',
        reason: 'captcha',
      },
      status: 403,
    });
  });

  it('returns a rate-limit reason with 429 status', async () => {
    const guard = new PublicFormProtectionGuard(
      {
        getAllAndOverride: jest.fn(() => 'quick-message'),
      } as unknown as Reflector,
      {
        check: jest.fn(async () => ({ reason: 'rate-limit', key: 'ip:test' })),
      } as any,
    );

    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(
      HttpException,
    );
    await expect(guard.canActivate(createContext())).rejects.toMatchObject({
      response: {
        reason: 'rate-limit',
        key: 'ip:test',
      },
      status: 429,
    });
  });
});
