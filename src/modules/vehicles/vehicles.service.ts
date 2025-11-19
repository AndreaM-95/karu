import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignDriverDto } from './dto/assing-driver.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

/**
 * Service responsible for handling vehicle operations
 * including creation, assignment, queries, and statistics
 */
@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) {}

  /**
   * Assigns a driver to a vehicle
   * Prevents duplicate assignments
   *
   * @param dto - Driver assignment data including vehicleId and driverId
   * @returns Updated vehicle with assigned drivers
   * @throws NotFoundException if vehicle or driver not found
   * @throws BadRequestException if user is not a driver or already assigned
   */
  async assignDriver(dto: AssignDriverDto) {
    this.logger.log(
      `Driver assignment attempt: Driver ID ${dto.driverId} to Vehicle ID ${dto.vehicleId}`,
    );

    const vehicle = await this.vehicleRepo.findOne({
      where: { idVehicle: dto.vehicleId },
      relations: ['drivers'],
    });

    if (!vehicle) {
      this.logger.warn(`Vehicle not found: ID ${dto.vehicleId}`);
      throw new NotFoundException('Vehicle not found');
    }

    const driver = await this.userRepo.findOne({
      where: { idUser: dto.driverId },
    });

    if (!driver) {
      this.logger.warn(`Driver not found: ID ${dto.driverId}`);
      throw new NotFoundException('Driver not found');
    }

    if (driver.role !== UserRole.DRIVER) {
      this.logger.warn(
        `User ${driver.email} (ID: ${driver.idUser}) is not a driver, cannot assign to vehicle`,
      );
      throw new BadRequestException('User is not a driver role');
    }

    // Prevent duplicate assignments
    const alreadyAssigned = vehicle.drivers?.some((d) => d.idUser === driver.idUser);

    if (alreadyAssigned) {
      this.logger.warn(
        `Driver ${driver.email} already assigned to vehicle ${vehicle.plate}`,
      );
      throw new BadRequestException('Driver is already assigned to this vehicle');
    }

    // Add driver to vehicle
    vehicle.drivers = [...(vehicle.drivers || []), driver];

    const updatedVehicle = await this.vehicleRepo.save(vehicle);

    this.logger.log(
      `Driver ${driver.name} assigned successfully to vehicle ${vehicle.plate}`,
    );

    return updatedVehicle;
  }

  /**
   * Finds all vehicles with optional filters
   * Supports filtering by brand, model, status, type, owner, driver, and plate
   *
   * @param query - Filter criteria
   * @returns List of vehicles with sanitized data
   */
  async findAll(query: QueryVehicleDto) {
    this.logger.log('Retrieving vehicles with filters');

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.owner', 'owner')
      .leftJoinAndSelect('vehicle.drivers', 'driver')
      .leftJoinAndSelect('vehicle.trips', 'trip');

    if (query.brand) {
      qb.andWhere('vehicle.brand ILIKE :brand', { brand: `%${query.brand}%` });
    }
    if (query.model) {
      qb.andWhere('vehicle.model ILIKE :model', { model: `%${query.model}%` });
    }
    if (query.statusVehicle) {
      qb.andWhere('vehicle.statusVehicle = :status', { status: query.statusVehicle });
    }
    if (query.vehicleType) {
      qb.andWhere('vehicle.vehicleType = :type', { type: query.vehicleType });
    }
    if (query.ownerId) {
      qb.andWhere('owner.idUser = :ownerId', { ownerId: query.ownerId });
    }
    if (query.driverId) {
      qb.andWhere('driver.idUser = :driverId', { driverId: query.driverId });
    }
    if (query.plate) {
      qb.andWhere('vehicle.plate ILIKE :plate', { plate: `%${query.plate}%` });
    }

    const vehicles = await qb.getMany();

    this.logger.log(`Found ${vehicles.length} vehicles matching criteria`);

    // Sanitize response data
    const sanitizedVehicles = vehicles.map((vehicle) => ({
      idVehicle: vehicle.idVehicle,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      statusVehicle: vehicle.statusVehicle,
      owner: {
        name: vehicle.owner.name,
        active: vehicle.owner.active,
      },
      drivers: vehicle.drivers.map((driver) => ({
        name: driver.name,
        active: driver.active,
        driverLicense: driver.driverLicense,
        licenseCategory: driver.licenseCategory,
        licenseExpirationDate: driver.licenseExpirationDate,
      })),
    }));

    return sanitizedVehicles;
  }

  /**
   * Finds a single vehicle by ID
   * Includes owner, drivers, and trips information
   *
   * @param id - Vehicle ID
   * @returns Vehicle with complete information
   * @throws NotFoundException if vehicle not found
   */
  async findOne(id: number) {
    this.logger.log(`Retrieving vehicle with ID: ${id}`);

    const vehicle = await this.vehicleRepo.findOne({
      where: { idVehicle: id },
      relations: ['owner', 'drivers', 'trips'],
    });

    if (!vehicle) {
      this.logger.warn(`Vehicle not found: ID ${id}`);
      throw new NotFoundException('Vehicle not found');
    }

    this.logger.log(`Vehicle retrieved successfully: ${vehicle.plate} (ID: ${id})`);

    return {
      idVehicle: vehicle.idVehicle,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      statusVehicle: vehicle.statusVehicle,
      owner: {
        idUser: vehicle.owner.idUser,
        name: vehicle.owner.name,
      },
      drivers: vehicle.drivers.map((d) => ({
        idUser: d.idUser,
        name: d.name,
      })),
      trips: vehicle.trips,
    };
  }
}

