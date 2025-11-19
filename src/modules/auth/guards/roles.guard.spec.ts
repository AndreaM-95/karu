import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any, requiredRoles: string[] = []): ExecutionContext => {
    mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          method: 'GET',
          url: '/api/test',
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate - No roles required', () => {
    it('should allow access when no roles are required', () => {
      const context = createMockExecutionContext(null, []);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should allow access when requiredRoles is null', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      const mockUser = {
        idUser: 1,
        email: 'test@example.com',
        role: UserRole.PASSENGER,
      };
      
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockUser,
            method: 'GET',
            url: '/api/test',
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when requiredRoles is undefined', () => {
      const mockUser = {
        idUser: 1,
        email: 'test@example.com',
        role: UserRole.PASSENGER,
      };
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext(mockUser);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - Authentication checks', () => {
    it('should throw UnauthorizedException if user is not authenticated', () => {
      const context = createMockExecutionContext(null, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('User is not authenticated');
    });

    it('should throw UnauthorizedException if user is undefined', () => {
      const context = createMockExecutionContext(undefined, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });

  describe('canActivate - Role validation', () => {
    it('should throw ForbiddenException if user has no role assigned', () => {
      const userWithoutRole = {
        idUser: 1,
        email: 'test@example.com',
        role: null,
      };

      const context = createMockExecutionContext(userWithoutRole, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User does not have a role assigned');
    });

    it('should allow access when user has the required role (exact match)', () => {
      const adminUser = {
        idUser: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const context = createMockExecutionContext(adminUser, [UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Access granted'),
      );
    });

    it('should allow access when user role matches one of multiple required roles', () => {
      const driverUser = {
        idUser: 2,
        email: 'driver@example.com',
        role: UserRole.DRIVER,
      };

      const context = createMockExecutionContext(driverUser, [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user role does not match required roles', () => {
      const passengerUser = {
        idUser: 3,
        email: 'passenger@example.com',
        role: UserRole.PASSENGER,
      };

      const context = createMockExecutionContext(passengerUser, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Your role (passenger) is not authorized to access this resource',
      );
    });

    it('should perform case-insensitive role comparison', () => {
      const userWithUppercaseRole = {
        idUser: 1,
        email: 'test@example.com',
        role: 'ADMIN',
      };

      const context = createMockExecutionContext(userWithUppercaseRole, ['admin']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle mixed case roles correctly', () => {
      const user = {
        idUser: 1,
        email: 'test@example.com',
        role: 'DrIvEr',
      };

      const context = createMockExecutionContext(user, ['DRIVER']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - Logging', () => {
    it('should log access denied when user is not authenticated', () => {
      const context = createMockExecutionContext(null, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Access denied: User not authenticated',
      );
    });

    it('should log access denied when user has no role', () => {
      const user = {
        idUser: 1,
        email: 'test@example.com',
        role: null,
      };

      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(() => guard.canActivate(context)).toThrow();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Access denied: User 1 has no role assigned',
      );
    });

    it('should log access denied with detailed info when role does not match', () => {
      const user = {
        idUser: 5,
        email: 'passenger@example.com',
        role: UserRole.PASSENGER,
      };

      const context = createMockExecutionContext(user, [UserRole.ADMIN, UserRole.DRIVER]);

      expect(() => guard.canActivate(context)).toThrow();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('Access denied: User passenger@example.com'),
      );
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('with role "passenger"'),
      );
    });

    it('should log access granted with user details', () => {
      const user = {
        idUser: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      guard.canActivate(context);

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Access granted: User admin@example.com (ID: 1)'),
      );
    });
  });

  describe('canActivate - Multiple roles scenarios', () => {
    it('should allow access for admin when multiple roles include admin', () => {
      const adminUser = {
        idUser: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const context = createMockExecutionContext(adminUser, [
        UserRole.ADMIN,
        UserRole.OWNER,
        UserRole.DRIVER,
      ]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access for driver when multiple roles include driver', () => {
      const driverUser = {
        idUser: 2,
        email: 'driver@example.com',
        role: UserRole.DRIVER,
      };

      const context = createMockExecutionContext(driverUser, [
        UserRole.DRIVER,
        UserRole.OWNER,
      ]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user role is not in the list', () => {
      const passengerUser = {
        idUser: 3,
        email: 'passenger@example.com',
        role: UserRole.PASSENGER,
      };

      const context = createMockExecutionContext(passengerUser, [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Guard definition', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should have reflector injected', () => {
      expect(reflector).toBeDefined();
    });
  });
});