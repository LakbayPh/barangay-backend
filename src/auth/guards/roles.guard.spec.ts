import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  let guard: RolesGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new RolesGuard(reflector);
  });

  it('should allow requests when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(createContext(UserRole.STAFF))).toBe(true);
  });

  it('should allow a user with a required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext(UserRole.ADMIN))).toBe(true);
  });

  it('should reject a user without a required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext(UserRole.STAFF))).toBe(false);
  });
});

function createContext(role: UserRole): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          sub: '1',
          role,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}
