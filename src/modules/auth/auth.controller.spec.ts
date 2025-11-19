import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { UserRole, Gender, DriverStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    adminCreate: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    changePassword: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'MARIA GARCIA',
      email: 'maria@example.com',
      password: 'Password123!',
      gender: Gender.FEMALE,
      phone: '3001234567',
      dateOfBirth: '1990-01-01',
    };

    it('should register a new passenger successfully', async () => {
      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          idUser: 1,
          name: 'MARIA GARCIA',
          email: 'maria@example.com',
          role: UserRole.PASSENGER,
          active: true,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should call authService.register with correct parameters', async () => {
      mockAuthService.register.mockResolvedValue({});

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('adminCreate', () => {
    const adminCreateDto: AdminCreateUserDto = {
      name: 'DRIVER MARIA',
      email: 'driver@example.com',
      password: 'Password123!',
      gender: Gender.FEMALE,
      phone: '3001234567',
      dateOfBirth: '1990-01-01',
      role: UserRole.DRIVER,
      driverLicense: 12345678,
      licenseCategory: 'b2' as any,
      licenseExpirationDate: '2026-12-31',
    };

    const mockRequest = {
      user: {
        idUser: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      },
    };

    it('should create a new driver successfully by admin', async () => {
      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          idUser: 2,
          name: 'DRIVER MARIA',
          email: 'driver@example.com',
          role: UserRole.DRIVER,
          active: true,
          driverStatus: DriverStatus.AVAILABLE,
        },
      };

      mockAuthService.adminCreate.mockResolvedValue(expectedResult);

      const result = await controller.adminCreate(adminCreateDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(authService.adminCreate).toHaveBeenCalledWith(
        adminCreateDto,
        mockRequest.user,
      );
      expect(authService.adminCreate).toHaveBeenCalledTimes(1);
    });

    it('should call authService.adminCreate with correct parameters', async () => {
      mockAuthService.adminCreate.mockResolvedValue({});

      await controller.adminCreate(adminCreateDto, mockRequest);

      expect(authService.adminCreate).toHaveBeenCalledWith(
        adminCreateDto,
        mockRequest.user,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDTO = {
      email: 'maria@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        idUser: 1,
        email: 'maria@example.com',
        name: 'MARIA GARCIA',
        role: UserRole.PASSENGER,
        active: true,
      };

      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          idUser: 1,
          name: 'MARIA GARCIA',
          email: 'maria@example.com',
          role: UserRole.PASSENGER,
          active: true,
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call validateUser before login', async () => {
      const mockUser = { idUser: 1, email: 'test@example.com' };
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({});

      await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDTO = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456@',
      confirmPassword: 'NewPassword456@',
    };

    const mockRequest = {
      user: {
        idUser: 1,
        email: 'test@example.com',
      },
    };

    it('should change password successfully', async () => {
      const expectedResult = {
        message: 'Password updated successfully',
        success: true,
      };

      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(changePasswordDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(authService.changePassword).toHaveBeenCalledWith(
        changePasswordDto,
        mockRequest.user,
      );
      expect(authService.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should call authService.changePassword with correct parameters', async () => {
      mockAuthService.changePassword.mockResolvedValue({
        message: 'Password updated successfully',
        success: true,
      });

      await controller.changePassword(changePasswordDto, mockRequest);

      expect(authService.changePassword).toHaveBeenCalledWith(
        changePasswordDto,
        mockRequest.user,
      );
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        idUser: 1,
        email: 'test@example.com',
      },
    };

    it('should return user profile successfully', async () => {
      const expectedProfile = {
        idUser: 1,
        name: 'MARIA GARCIA',
        email: 'maria@example.com',
        phone: '3001234567',
        gender: Gender.FEMALE,
        role: UserRole.PASSENGER,
        driverStatus: null,
      };

      mockAuthService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(expectedProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(mockRequest.user.idUser);
      expect(authService.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should call authService.getProfile with correct user ID', async () => {
      mockAuthService.getProfile.mockResolvedValue({});

      await controller.getProfile(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('Controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });
  });
});