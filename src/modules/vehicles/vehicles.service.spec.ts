import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle, VehicleStatus, VehicleType } from './entities/vehicle.entity';
import { User, UserRole, Gender } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignDriverDto } from './dto/assing-driver.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepo: Repository<Vehicle>;
  let userRepo: Repository<User>;
  let tripRepo: Repository<Trip>;

  const mockVehicleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockTripRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: mockTripRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    vehicleRepo = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    tripRepo = module.get<Repository<Trip>>(getRepositoryToken(Trip));

    // Mock Logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    const ownerUser: User = {
      idUser: 1,
      email: 'owner@example.com',
      name: 'MARIA OWNER',
      role: UserRole.OWNER,
      gender: Gender.FEMALE,
    } as User;

    const adminUser: User = {
      idUser: 2,
      email: 'admin@example.com',
      name: 'ADMIN USER',
      role: UserRole.ADMIN,
      gender: Gender.FEMALE,
    } as User;

    it('should create vehicle successfully for owner', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        brand: 'Chevrolet',
        model: 'Spark GT',
        vehicleType: VehicleType.CARRO,
      };

      mockUserRepository.findOne.mockResolvedValue(ownerUser);
      mockVehicleRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.create.mockReturnValue(dto);
      mockVehicleRepository.save.mockResolvedValue({
        idVehicle: 1,
        ...dto,
        owner: ownerUser,
      });

      const result = await service.createVehicle(dto, ownerUser);

      expect(result).toHaveProperty('idVehicle');
      expect(result.plate).toBe('ABC123');
    });

    it('should create vehicle successfully for admin with ownerId', async () => {
      const dto: CreateVehicleDto = {
        plate: 'XYZ789',
        brand: 'Toyota',
        model: 'Corolla',
        ownerId: 1,
      };

      mockUserRepository.findOne.mockResolvedValue(ownerUser);
      mockVehicleRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.create.mockReturnValue(dto);
      mockVehicleRepository.save.mockResolvedValue({
        idVehicle: 2,
        ...dto,
        owner: ownerUser,
      });

      const result = await service.createVehicle(dto, adminUser);

      expect(result).toHaveProperty('idVehicle');
      expect(mockVehicleRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if owner tries to create for another owner', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
        ownerId: 999,
      };

      await expect(service.createVehicle(dto, ownerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if admin does not provide ownerId', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
      };

      await expect(service.createVehicle(dto, adminUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if user is passenger', async () => {
      const passenger = { ...ownerUser, role: UserRole.PASSENGER };
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
      };

      await expect(
        service.createVehicle(dto, passenger as User),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if owner not found', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
        ownerId: 999,
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createVehicle(dto, adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not an owner role', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
        ownerId: 1,
      };
      const nonOwner = { ...ownerUser, role: UserRole.DRIVER };
      mockUserRepository.findOne.mockResolvedValue(nonOwner);

      await expect(service.createVehicle(dto, adminUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if plate already exists', async () => {
      const dto: CreateVehicleDto = {
        plate: 'ABC123',
        model: 'Test',
      };

      mockUserRepository.findOne.mockResolvedValue(ownerUser);
      mockVehicleRepository.findOne.mockResolvedValue({ plate: 'ABC123' });

      await expect(service.createVehicle(dto, ownerUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('assignDriver', () => {
    const mockVehicle = {
      idVehicle: 1,
      plate: 'ABC123',
      drivers: [],
    };

    const mockDriver: User = {
      idUser: 2,
      email: 'driver@example.com',
      name: 'ANDREA DRIVER',
      role: UserRole.DRIVER,
    } as User;

    it('should assign driver successfully', async () => {
      const dto: AssignDriverDto = { vehicleId: 1, driverId: 2 };

      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);
      mockUserRepository.findOne.mockResolvedValue(mockDriver);
      mockVehicleRepository.save.mockResolvedValue({
        ...mockVehicle,
        drivers: [mockDriver],
      });

      await service.assignDriver(dto);

      expect(mockVehicleRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      const dto: AssignDriverDto = { vehicleId: 999, driverId: 2 };
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.assignDriver(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if driver not found', async () => {
      const dto: AssignDriverDto = { vehicleId: 1, driverId: 999 };
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.assignDriver(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not a driver', async () => {
      const dto: AssignDriverDto = { vehicleId: 1, driverId: 2 };
      const nonDriver = { ...mockDriver, role: UserRole.PASSENGER };
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);
      mockUserRepository.findOne.mockResolvedValue(nonDriver);

      await expect(service.assignDriver(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if driver already assigned', async () => {
      const dto: AssignDriverDto = { vehicleId: 1, driverId: 2 };
      const vehicleWithDriver = {
        ...mockVehicle,
        drivers: [mockDriver],
      };
      mockVehicleRepository.findOne.mockResolvedValue(vehicleWithDriver);
      mockUserRepository.findOne.mockResolvedValue(mockDriver);

      await expect(service.assignDriver(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      mockVehicleRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return all vehicles without filters', async () => {
      const mockVehicles = [
        {
          idVehicle: 1,
          plate: 'ABC123',
          brand: 'Chevrolet',
          model: 'Spark',
          vehicleType: VehicleType.CARRO,
          statusVehicle: VehicleStatus.ACTIVE,
          owner: { name: 'OWNER', active: true },
          drivers: [],
          trips: [],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockVehicles);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(result[0].brand).toBe('Chevrolet');
    });

    it('should filter vehicles by brand', async () => {
      const query: QueryVehicleDto = { brand: 'Chevrolet' };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by model', async () => {
      const query: QueryVehicleDto = { model: 'Corolla' };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by statusVehicle', async () => {
      const query: QueryVehicleDto = { statusVehicle: VehicleStatus.ACTIVE };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by vehicleType', async () => {
      const query: QueryVehicleDto = { vehicleType: VehicleType.CARRO };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by ownerId', async () => {
      const query: QueryVehicleDto = { ownerId: 1 };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by driverId', async () => {
      const query: QueryVehicleDto = { driverId: 2 };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter vehicles by plate', async () => {
      const query: QueryVehicleDto = { plate: 'ABC' };
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return vehicle by ID', async () => {
      const mockVehicle = {
        idVehicle: 1,
        plate: 'ABC123',
        brand: 'Chevrolet',
        model: 'Spark',
        vehicleType: VehicleType.CARRO,
        statusVehicle: VehicleStatus.ACTIVE,
        owner: { idUser: 1, name: 'OWNER' },
        drivers: [{ idUser: 2, name: 'DRIVER' }],
        trips: [],
      };

      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne(1);

      expect(result.idVehicle).toBe(1);
      expect(result.plate).toBe('ABC123');
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOwner', () => {
    const mockOwner = {
      idUser: 1,
      name: 'MARIA OWNER',
      role: UserRole.OWNER,
    };

    it('should return vehicles for owner', async () => {
      const mockVehicles = [
        {
          idVehicle: 1,
          plate: 'ABC123',
          brand: 'Chevrolet',
          model: 'Spark',
          vehicleType: VehicleType.CARRO,
          statusVehicle: VehicleStatus.ACTIVE,
          owner: mockOwner,
          drivers: [
            {
              idUser: 2,
              name: 'DRIVER',
              driverLicense: '12345',
              licenseCategory: 'B1',
              licenseExpirationDate: new Date('2025-12-31'),
            },
          ],
        },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockOwner);
      mockVehicleRepository.find.mockResolvedValue(mockVehicles);

      const result = await service.findByOwner(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].idVehicle).toBe(1);
    });

    it('should throw NotFoundException if owner not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findByOwner(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not an owner', async () => {
      const nonOwner = { ...mockOwner, role: UserRole.PASSENGER };
      mockUserRepository.findOne.mockResolvedValue(nonOwner);

      await expect(service.findByOwner(1)).rejects.toThrow(BadRequestException);
    });

    it('should return message if owner has no vehicles', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockOwner);
      mockVehicleRepository.find.mockResolvedValue([]);

      const result = await service.findByOwner(1);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('vehicles');
      if ('vehicles' in result) {
        expect(result.vehicles).toEqual([]);
      }
    });
  });

  describe('findByDriver', () => {
    const mockDriver = {
      idUser: 2,
      name: 'ANDREA DRIVER',
      role: UserRole.DRIVER,
    };

    it('should return vehicles for driver', async () => {
      const mockVehicles = [
        {
          idVehicle: 1,
          plate: 'ABC123',
          brand: 'Chevrolet',
          model: 'Spark',
          vehicleType: VehicleType.CARRO,
          statusVehicle: VehicleStatus.ACTIVE,
          owner: { idUser: 1, name: 'OWNER' },
          drivers: [mockDriver],
        },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockDriver);
      mockVehicleRepository.find.mockResolvedValue(mockVehicles);

      const result = await service.findByDriver(2);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].idVehicle).toBe(1);
    });

    it('should throw NotFoundException if driver not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findByDriver(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not a driver', async () => {
      const nonDriver = { ...mockDriver, role: UserRole.PASSENGER };
      mockUserRepository.findOne.mockResolvedValue(nonDriver);

      await expect(service.findByDriver(2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return message if driver has no vehicles', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockDriver);
      mockVehicleRepository.find.mockResolvedValue([]);

      const result = await service.findByDriver(2);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('vehicles');
      if ('vehicles' in result) {
        expect(result.vehicles).toEqual([]);
      }
    });
  });

  describe('getTripsByVehicle', () => {
    it('should return trips for vehicle', async () => {
      const mockVehicle = { idVehicle: 1, plate: 'ABC123' };
      const mockTrips = [
        {
          idTrip: 1,
          distanceKm: '10.50',
          driver: { name: 'DRIVER' },
          originLocation: { locality: 'Usaquén' },
          destinationLocation: { locality: 'Suba' },
        },
      ];

      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);
      mockTripRepository.find.mockResolvedValue(mockTrips);

      const result = await service.getTripsByVehicle(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.getTripsByVehicle(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVehicleStats', () => {
    it('should calculate statistics correctly', async () => {
      const mockTrips = [
        { distanceKm: '10.50', requestedAt: new Date() },
        { distanceKm: '20.00', requestedAt: new Date() },
        { distanceKm: '15.50', requestedAt: new Date() },
      ];

      mockTripRepository.find.mockResolvedValue(mockTrips);

      const result = await service.getVehicleStats(1);

      expect(result.totalTrips).toBe(3);
      expect(result.totalDistance).toBe('46.00');
    });

    it('should return zero stats for vehicle with no trips', async () => {
      mockTripRepository.find.mockResolvedValue([]);

      const result = await service.getVehicleStats(1);

      expect(result.totalTrips).toBe(0);
      expect(result.totalDistance).toBe('0.00');
      expect(result.lastTrip).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update vehicle status successfully', async () => {
      const mockVehicle = {
        idVehicle: 1,
        plate: 'ABC123',
        statusVehicle: VehicleStatus.ACTIVE,
      };

      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);
      mockVehicleRepository.save.mockResolvedValue({
        ...mockVehicle,
        statusVehicle: VehicleStatus.INACTIVE,
      });

      // Pass the string value of the enum, not the enum itself
      const result = await service.updateStatus(1, VehicleStatus.INACTIVE);

      expect(result.statusVehicle).toBe(VehicleStatus.INACTIVE);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(999, 'inactive')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      const mockVehicle = {
        idVehicle: 1,
        plate: 'ABC123',
        statusVehicle: VehicleStatus.ACTIVE,
      };
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.updateStatus(1, 'invalid_status')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Service definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
