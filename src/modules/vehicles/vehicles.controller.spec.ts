import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Logger } from '@nestjs/common';
import { VehicleStatus, VehicleType } from './entities/vehicle.entity';
import { UserRole } from '../users/entities/user.entity';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let service: VehiclesService;

  const mockVehiclesService = {
    createVehicle: jest.fn(),
    assignDriver: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByOwner: jest.fn(),
    findByDriver: jest.fn(),
    getTripsByVehicle: jest.fn(),
    getVehicleStats: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
    service = module.get<VehiclesService>(VehiclesService);

    // Mock Logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const dto = {
        plate: 'ABC123',
        brand: 'Chevrolet',
        model: 'Spark GT',
        vehicleType: VehicleType.CARRO,
      };

      const mockRequest = {
        user: {
          idUser: 1,
          email: 'owner@example.com',
          role: UserRole.OWNER,
        },
      };

      const expectedResult = {
        idVehicle: 1,
        ...dto,
        statusVehicle: VehicleStatus.ACTIVE,
      };

      mockVehiclesService.createVehicle.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.createVehicle).toHaveBeenCalledWith(dto, mockRequest.user);
    });
  });

  describe('assignDriver', () => {
    it('should assign driver to vehicle successfully', async () => {
      const dto = { vehicleId: 1, driverId: 2 };
      const expectedResult = { idVehicle: 1, drivers: [{ idUser: 2 }] };

      mockVehiclesService.assignDriver.mockResolvedValue(expectedResult);

      const result = await controller.assignDriver(dto);

      expect(result).toEqual(expectedResult);
      expect(service.assignDriver).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles with filters', async () => {
      const query = { brand: 'Chevrolet' };
      const expectedResult = [
        {
          idVehicle: 1,
          plate: 'ABC123',
          brand: 'Chevrolet',
        },
      ];

      mockVehiclesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return vehicle by ID', async () => {
      const mockRequest = { user: { idUser: 1 } };
      const expectedResult = {
        idVehicle: 1,
        plate: 'ABC123',
        brand: 'Chevrolet',
      };

      mockVehiclesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByOwner', () => {
    it('should return vehicles by owner ID', async () => {
      const expectedResult = [
        {
          idVehicle: 1,
          plate: 'ABC123',
          owner: { idUser: 1, name: 'OWNER' },
        },
      ];

      mockVehiclesService.findByOwner.mockResolvedValue(expectedResult);

      const result = await controller.findByOwner(1);

      expect(result).toEqual(expectedResult);
      expect(service.findByOwner).toHaveBeenCalledWith(1);
    });
  });

  describe('findByDriver', () => {
    it('should return vehicles by driver ID', async () => {
      const expectedResult = [
        {
          idVehicle: 1,
          plate: 'ABC123',
        },
      ];

      mockVehiclesService.findByDriver.mockResolvedValue(expectedResult);

      const result = await controller.findByDriver(2);

      expect(result).toEqual(expectedResult);
      expect(service.findByDriver).toHaveBeenCalledWith(2);
    });
  });

  describe('getTrips', () => {
    it('should return trips for vehicle', async () => {
      const expectedResult = [
        {
          idTrip: 1,
          distanceKm: '10.50',
        },
      ];

      mockVehiclesService.getTripsByVehicle.mockResolvedValue(expectedResult);

      const result = await controller.getTrips(1);

      expect(result).toEqual(expectedResult);
      expect(service.getTripsByVehicle).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should return vehicle statistics', async () => {
      const expectedResult = {
        totalTrips: 5,
        totalDistance: '50.00',
        lastTrip: { idTrip: 5 },
      };

      mockVehiclesService.getVehicleStats.mockResolvedValue(expectedResult);

      const result = await controller.getStats(1);

      expect(result).toEqual(expectedResult);
      expect(service.getVehicleStats).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStatus', () => {
    it('should update vehicle status successfully', async () => {
      const expectedResult = {
        idVehicle: 1,
        statusVehicle: VehicleStatus.INACTIVE,
      };

      mockVehiclesService.updateStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateStatus(1, 'inactive');

      expect(result).toEqual(expectedResult);
      expect(service.updateStatus).toHaveBeenCalledWith(1, 'inactive');
    });
  });

  describe('Controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have vehiclesService injected', () => {
      expect(service).toBeDefined();
    });
  });
});
