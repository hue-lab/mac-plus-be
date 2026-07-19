jest.mock('bcrypt', () => ({
  compare: jest.fn(async () => true),
}));

import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService refresh sessions', () => {
  const createModel = () => {
    const sessions: any[] = [];
    const model = {
      sessions,
      create: jest.fn(async (dto) => {
        const session = {
          ...dto,
          save: jest.fn(async function save() {
            return this;
          }),
        };
        sessions.push(session);
        return session;
      }),
      findOne: jest.fn((query) => ({
        exec: jest.fn(async () =>
          sessions.find((session) => session.tokenHash === query.tokenHash),
        ),
      })),
      updateMany: jest.fn((query, update) => ({
        exec: jest.fn(async () => {
          sessions
            .filter(
              (session) =>
                session.familyId === query.familyId && !session.revokedAt,
            )
            .forEach((session) => {
              session.revokedAt = update.$set.revokedAt;
            });
        }),
      })),
    };

    return model;
  };

  const createService = () => {
    const refreshSessionModel = createModel();
    const user = {
      _id: { toString: () => 'user-id' },
      username: 'admin',
      roles: ['user'],
    };
    const service = new AuthService(
      {
        getUserById: jest.fn(async () => user),
      } as any,
      {
        sign: jest.fn(() => 'access-token'),
      } as any,
      refreshSessionModel as any,
    );

    return { service, refreshSessionModel, user };
  };

  it('rotates refresh tokens', async () => {
    const { service, refreshSessionModel, user } = createService();

    const loginResult = await service.login(user);
    const refreshResult = await service.refresh(loginResult.refreshToken);

    expect(refreshResult.accessToken).toBe('access-token');
    expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);
    expect(refreshSessionModel.sessions).toHaveLength(2);
    expect(refreshSessionModel.sessions[0].usedAt).toBeInstanceOf(Date);
    expect(refreshSessionModel.sessions[0].revokedAt).toBeInstanceOf(Date);
    expect(refreshSessionModel.sessions[1].revokedAt).toBeUndefined();
  });

  it('revokes the session family when an old refresh token is reused', async () => {
    const { service, refreshSessionModel, user } = createService();

    const loginResult = await service.login(user);
    await service.refresh(loginResult.refreshToken);

    await expect(service.refresh(loginResult.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(
      refreshSessionModel.sessions.every((session) => session.revokedAt),
    ).toBe(true);
  });
});
