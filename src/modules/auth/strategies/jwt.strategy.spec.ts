import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, Gender, DriverStatus } from '../../users/entities/user.entity';
import { UnauthorizedException, Logger } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepo: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Mock the JWT_SECRET_KEY before creating the module
    mockConfigService.get.mockReturnValue('test-secret-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize successfully with valid JWT_SECRET_KEY', () => {
      expect(strategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET_KEY');
    });

    it('should throw error if JWT_SECRET_KEY is not defined', () => {
      mockConfigService.get.mockReturnValueOnce(undefined);

      expect(() => {
        new JwtStrategy(configService, userRepo);
      }).toThrow('JWT_SECRET_KEY is not defined in environment variables');
    });
  });

  describe('validate', () => {
    const mockPayload = {
      sub: 1,
      email: 'test@example.com',
      name: 'TEST USER',
      role: UserRole.PASSENGER,
    };

    it('should validate and return user data for active passenger', async () => {
      const mockUser = {
        idUser: 1,
        name: 'MARIA GARCIA',
        email: 'maria@example.com',
        role: UserRole.PASSENGER,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: true,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        idUser: mockUser.idUser,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        gender: mockUser.gender,
        driverStatus: mockUser.driverStatus,
      });
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { idUser: mockPayload.sub },
        select: ['idUser', 'name', 'email', 'role', 'phone', 'gender', 'active', 'driverStatus'],
      });
    });

    it('should validate and return user data for active driver', async () => {
      const mockDriverUser = {
        idUser: 2,
        name: 'DRIVER MARIA',
        email: 'driver@example.com',
        role: UserRole.DRIVER,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: true,
        driverStatus: DriverStatus.AVAILABLE,
      };

      mockUserRepository.findOne.mockResolvedValue(mockDriverUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        idUser: mockDriverUser.idUser,
        name: mockDriverUser.name,
        email: mockDriverUser.email,
        role: mockDriverUser.role,
        phone: mockDriverUser.phone,
        gender: mockDriverUser.gender,
        driverStatus: mockDriverUser.driverStatus,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = {
        idUser: 1,
        name: 'INACTIVE USER',
        email: 'inactive@example.com',
        role: UserRole.PASSENGER,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: false,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'User is inactive',
      );
    });

    it('should call findOne with correct parameters', async () => {
      const mockUser = {
        idUser: 1,
        name: 'TEST USER',
        email: 'test@example.com',
        role: UserRole.PASSENGER,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: true,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await strategy.validate(mockPayload);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { idUser: mockPayload.sub },
        select: ['idUser', 'name', 'email', 'role', 'phone', 'gender', 'active', 'driverStatus'],
      });
    });

    it('should return all required user fields', async () => {
      const mockUser = {
        idUser: 1,
        name: 'TEST USER',
        email: 'test@example.com',
        role: UserRole.PASSENGER,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: true,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toHaveProperty('idUser');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('driverStatus');
    });

    it('should handle admin user correctly', async () => {
      const mockAdminUser = {
        idUser: 3,
        name: 'ADMIN USER',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        phone: '3001234567',
        gender: Gender.FEMALE,
        active: true,
        driverStatus: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await strategy.validate(mockPayload);

      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.driverStatus).toBeNull();
    });
  });

  describe('Strategy definition', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should have userRepo injected', () => {
      expect(userRepo).toBeDefined();
    });

    it('should have configService injected', () => {
      expect(configService).toBeDefined();
    });
  });
});