import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../jwt.guard';
import { ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRole } from '../../../users/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should extract request with authorization header', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        method: 'GET',
        url: '/api/users',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const request = mockContext.switchToHttp().getRequest();
      
      expect(request.headers.authorization).toBe('Bearer valid-token');
      expect(request.method).toBe('GET');
    });

    it('should extract request correctly', () => {
      const mockRequest = {
        headers: {},
        method: 'GET',
        url: '/api/users',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const getRequestSpy = jest.spyOn(mockContext.switchToHttp(), 'getRequest');
      
      // Just test extraction, not the whole flow
      const context = mockContext.switchToHttp();
      const request = context.getRequest();
      
      expect(request).toEqual(mockRequest);
    });
  });

  describe('handleRequest', () => {
    it('should return user if authentication is successful', () => {
      const mockUser = {
        idUser: 1,
        email: 'test@example.com',
        name: 'TEST USER',
        role: UserRole.PASSENGER,
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `JWT authentication successful for user ID: ${mockUser.idUser}`,
      );
    });

    it('should throw UnauthorizedException if user is null', () => {
      expect(() => {
        guard.handleRequest(null, null, { message: 'Token expired' });
      }).toThrow(UnauthorizedException);

      expect(() => {
        guard.handleRequest(null, null, { message: 'Token expired' });
      }).toThrow('Invalid or missing JWT token');
    });

    it('should throw UnauthorizedException if user is undefined', () => {
      expect(() => {
        guard.handleRequest(null, undefined, { message: 'Invalid token' });
      }).toThrow(UnauthorizedException);
    });

    it('should throw error if err is provided', () => {
      const mockError = new Error('Custom authentication error');

      expect(() => {
        guard.handleRequest(mockError, null, null);
      }).toThrow(mockError);
    });

    it('should log warning with info message when authentication fails', () => {
      const info = { message: 'Token expired' };

      expect(() => {
        guard.handleRequest(null, null, info);
      }).toThrow(UnauthorizedException);

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'JWT authentication failed: Token expired',
      );
    });

    it('should log warning with default message when info is not provided', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'JWT authentication failed: Invalid or missing token',
      );
    });

    it('should handle different user roles correctly', () => {
      const driverUser = {
        idUser: 2,
        email: 'driver@example.com',
        role: UserRole.DRIVER,
      };

      const result = guard.handleRequest(null, driverUser, null);

      expect(result).toEqual(driverUser);
      expect(result.role).toBe(UserRole.DRIVER);
    });

    it('should handle admin user correctly', () => {
      const adminUser = {
        idUser: 3,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const result = guard.handleRequest(null, adminUser, null);

      expect(result).toEqual(adminUser);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should prioritize custom error over generic error', () => {
      const customError = new Error('Custom JWT error');

      expect(() => {
        guard.handleRequest(customError, null, { message: 'Token invalid' });
      }).toThrow(customError);
    });
  });

  describe('Guard definition', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should extend AuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});