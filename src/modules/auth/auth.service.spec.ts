import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, Gender, DriverStatus } from '../users/entities/user.entity';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterDto: RegisterDto = {
      name: 'MARIA GARCIA',
      email: 'maria@example.com',
      password: 'Password123!',
      gender: Gender.FEMALE,
      phone: '3001234567',
      dateOfBirth: '1990-01-01',
    };

    it('should register a new female passenger successfully', async () => {
      const mockUser = {
        idUser: 1,
        ...validRegisterDto,
        role: UserRole.PASSENGER,
        active: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(validRegisterDto);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toHaveProperty('email', validRegisterDto.email);
      expect(result.user).toHaveProperty('role', UserRole.PASSENGER);
      expect(result.user).not.toHaveProperty('driverStatus');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // email and phone check
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not female', async () => {
      const maleUserDto = { ...validRegisterDto, gender: Gender.MALE };

      await expect(service.register(maleUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(maleUserDto)).rejects.toThrow(
        'Only female users are allowed to register.',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: validRegisterDto.email });

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce({ phone: validRegisterDto.phone }); // phone check fails

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('adminCreate', () => {
    const adminUser: User = {
      idUser: 1,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      name: 'ADMIN USER',
    } as User;

    const validAdminCreateDto: AdminCreateUserDto = {
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

    it('should create a new driver successfully by admin', async () => {
      const mockUser = {
        idUser: 2,
        ...validAdminCreateDto,
        active: true,
        driverStatus: DriverStatus.AVAILABLE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.adminCreate(validAdminCreateDto, adminUser);

      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('role', UserRole.DRIVER);
      expect(result.user).toHaveProperty('driverStatus');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not admin', async () => {
      const nonAdminUser = { ...adminUser, role: UserRole.PASSENGER };

      await expect(
        service.adminCreate(validAdminCreateDto, nonAdminUser as User),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.adminCreate(validAdminCreateDto, nonAdminUser as User),
      ).rejects.toThrow('Only the administrator can create users.');
    });

    it('should throw BadRequestException if user is not female', async () => {
      const maleDriverDto = { ...validAdminCreateDto, gender: Gender.MALE };

      await expect(service.adminCreate(maleDriverDto, adminUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.adminCreate(maleDriverDto, adminUser)).rejects.toThrow(
        'Only female owners or drivers are allowed to register.',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        email: validAdminCreateDto.email,
      });

      await expect(
        service.adminCreate(validAdminCreateDto, adminUser),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if driver license already exists', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce({ driverLicense: validAdminCreateDto.driverLicense }); // license check fails

      await expect(
        service.adminCreate(validAdminCreateDto, adminUser),
      ).rejects.toThrow(ConflictException);
    });

    it('should not include driver fields for non-driver roles', async () => {
      const ownerDto = {
        ...validAdminCreateDto,
        role: UserRole.OWNER,
        driverLicense: undefined,
        licenseCategory: undefined,
        licenseExpirationDate: undefined,
      };

      const mockUser = {
        idUser: 3,
        ...ownerDto,
        active: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      await service.adminCreate(ownerDto, adminUser);

      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.driverLicense).toBeNull();
      expect(createCall.licenseCategory).toBeNull();
      expect(createCall.licenseExpirationDate).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate token with driverStatus for driver users', async () => {
      const driverUser = {
        idUser: 1,
        email: 'driver@example.com',
        name: 'DRIVER MARIA',
        role: UserRole.DRIVER,
        active: true,
        driverStatus: DriverStatus.AVAILABLE,
      } as User;

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(driverUser);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toHaveProperty('driverStatus', DriverStatus.AVAILABLE);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: driverUser.idUser,
          email: driverUser.email,
          role: UserRole.DRIVER,
          driverStatus: DriverStatus.AVAILABLE,
        }),
      );
    });

    it('should generate token without driverStatus for passenger users', async () => {
      const passengerUser = {
        idUser: 2,
        email: 'passenger@example.com',
        name: 'PASSENGER MARIA',
        role: UserRole.PASSENGER,
        active: true,
      } as User;

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(passengerUser);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('driverStatus');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.not.objectContaining({
          driverStatus: expect.anything(),
        }),
      );
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'Password123!';

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDTO = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456@',
      confirmPassword: 'NewPassword456@',
    };

    const authenticatedUser = {
      idUser: 1,
      email: 'test@example.com',
    };

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(changePasswordDto, authenticatedUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.changePassword(changePasswordDto, authenticatedUser),
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException if user has no password', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        idUser: 1,
        email: 'test@example.com',
        password: null,
      });

      await expect(
        service.changePassword(changePasswordDto, authenticatedUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(changePasswordDto, authenticatedUser),
      ).rejects.toThrow('User has no password set');
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        idUser: 1,
        name: 'MARIA GARCIA',
        email: 'maria@example.com',
        phone: '3001234567',
        gender: Gender.FEMALE,
        role: UserRole.PASSENGER,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { idUser: 1 },
        select: {
          idUser: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          role: true,
          driverStatus: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
      await expect(service.getProfile(999)).rejects.toThrow('User not found');
    });
  });
});
