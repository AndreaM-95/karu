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
   * Creates a new vehicle
   * Owners can only create vehicles for themselves
   * Admins can create vehicles for any owner
   *
   * @param dto - Vehicle creation data
   * @param loggedUser - The authenticated user creating the vehicle
   * @returns Created vehicle with owner information
   * @throws ForbiddenException if user is not authorized
   * @throws NotFoundException if owner not found
   * @throws BadRequestException if plate already exists or user is not an owner
   */
  async createVehicle(dto: CreateVehicleDto, loggedUser: User) {
    this.logger.log(
      `Vehicle creation attempt by user: ${loggedUser.email} (Role: ${loggedUser.role})`,
    );

    let ownerIdToAssign: number;

    if (loggedUser.role === UserRole.OWNER) {
      if (dto.ownerId && dto.ownerId !== loggedUser.idUser) {
        this.logger.warn(
          `Owner ${loggedUser.email} attempted to assign vehicle to another owner`,
        );
        throw new ForbiddenException('You cannot assign vehicles to other owners');
      }
      ownerIdToAssign = loggedUser.idUser;
    } else if (loggedUser.role === UserRole.ADMIN) {
      if (!dto.ownerId) {
        this.logger.warn('Admin attempted to create vehicle without specifying ownerId');
        throw new BadRequestException('ownerId is required for admin');
      }
      ownerIdToAssign = dto.ownerId;
    } else {
      this.logger.warn(
        `User ${loggedUser.email} with role ${loggedUser.role} attempted to create vehicle`,
      );
      throw new ForbiddenException('You are not allowed to create vehicles');
    }

    // Verify owner exists and has correct role
    const owner = await this.userRepo.findOne({
      where: { idUser: ownerIdToAssign },
    });

    if (!owner) {
      this.logger.warn(`Owner not found with ID: ${ownerIdToAssign}`);
      throw new NotFoundException('Owner not found');
    }

    if (owner.role !== UserRole.OWNER) {
      this.logger.warn(
        `User ${owner.email} (ID: ${owner.idUser}) is not an owner, cannot create vehicle`,
      );
      throw new BadRequestException('The user is not an owner');
    }

    // Check if plate already exists
    const exists = await this.vehicleRepo.findOne({
      where: { plate: dto.plate },
    });

    if (exists) {
      this.logger.warn(`Vehicle creation failed: Plate already registered (${dto.plate})`);
      throw new BadRequestException('This plate is already registered');
    }

    // Create vehicle
    const vehicle = this.vehicleRepo.create({
      plate: dto.plate,
      brand: dto.brand,
      model: dto.model,
      vehicleType: dto.vehicleType,
      owner,
      statusVehicle: VehicleStatus.ACTIVE,
    });

    const savedVehicle = await this.vehicleRepo.save(vehicle);

    this.logger.log(
      `Vehicle created successfully: ${savedVehicle.plate} (ID: ${savedVehicle.idVehicle}) for owner: ${owner.name}`,
    );

    return savedVehicle;
  }

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

   /**
   * Finds all vehicles owned by a specific owner
   *
   * @param ownerId - Owner user ID
   * @returns List of vehicles owned by the user
   * @throws NotFoundException if owner not found
   * @throws BadRequestException if user is not an owner
   */
  async findByOwner(ownerId: number) {
    this.logger.log(`Retrieving vehicles for owner ID: ${ownerId}`);

    const owner = await this.userRepo.findOne({
      where: { idUser: ownerId },
      select: ['idUser', 'role', 'name'],
    });

    if (!owner) {
      this.logger.warn(`Owner not found: ID ${ownerId}`);
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    if (owner.role !== UserRole.OWNER) {
      this.logger.warn(`User ${owner.name} (ID: ${ownerId}) is not an owner`);
      throw new BadRequestException(`User with ID ${ownerId} is not an owner`);
    }

    const vehicles = await this.vehicleRepo.find({
      where: { owner: { idUser: ownerId } },
      relations: ['drivers', 'owner'],
    });

    if (vehicles.length === 0) {
      this.logger.log(`Owner ${owner.name} has no vehicles registered`);
      return {
        message: `Owner ${owner.name} has no vehicles registered`,
        vehicles: [],
      };
    }

    this.logger.log(`Found ${vehicles.length} vehicles for owner: ${owner.name}`);

    return vehicles.map((vehicle) => ({
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
      drivers: vehicle.drivers.map((driver) => ({
        idUser: driver.idUser,
        name: driver.name,
        driverLicense: driver.driverLicense,
        licenseCategory: driver.licenseCategory,
        licenseExpirationDate: driver.licenseExpirationDate,
      })),
    }));
  }

  /**
   * Finds all vehicles assigned to a specific driver
   *
   * @param driverId - Driver user ID
   * @returns List of vehicles assigned to the driver
   * @throws NotFoundException if driver not found
   * @throws BadRequestException if user is not a driver
   */
  async findByDriver(driverId: number) {
    this.logger.log(`Retrieving vehicles for driver ID: ${driverId}`);

    const driver = await this.userRepo.findOne({
      where: { idUser: driverId },
      select: ['idUser', 'role', 'name'],
    });

    if (!driver) {
      this.logger.warn(`Driver not found: ID ${driverId}`);
      throw new NotFoundException(`User with ID ${driverId} not found`);
    }

    if (driver.role !== UserRole.DRIVER) {
      this.logger.warn(`User ${driver.name} (ID: ${driverId}) is not a driver`);
      throw new BadRequestException(`User with ID ${driverId} is not a driver`);
    }

    const vehicles = await this.vehicleRepo.find({
      where: { drivers: { idUser: driverId } },
      relations: ['owner', 'drivers'],
    });

    if (vehicles.length === 0) {
      this.logger.log(`Driver ${driver.name} has no vehicles assigned`);
      return {
        message: `Driver ${driver.name} has no vehicles assigned`,
        vehicles: [],
      };
    }

    this.logger.log(`Found ${vehicles.length} vehicles for driver: ${driver.name}`);

    return vehicles.map((vehicle) => ({
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
    }));
  }

  /**
   * Retrieves trip history for a specific vehicle
   *
   * @param vehicleId - Vehicle ID
   * @returns List of trips made by the vehicle
   * @throws NotFoundException if vehicle not found
   */
  async getTripsByVehicle(vehicleId: number) {
    this.logger.log(`Retrieving trips for vehicle ID: ${vehicleId}`);

    const vehicle = await this.vehicleRepo.findOne({
      where: { idVehicle: vehicleId },
    });

    if (!vehicle) {
      this.logger.warn(`Vehicle not found: ID ${vehicleId}`);
      throw new NotFoundException('Vehicle not found');
    }

    const trips = await this.tripRepo.find({
      where: { vehicle: { idVehicle: vehicleId } },
      relations: ['driver', 'originLocation', 'destinationLocation'],
    });

    this.logger.log(`Found ${trips.length} trips for vehicle: ${vehicle.plate}`);

    return trips;
  }

  /**
   * Calculates statistics for a specific vehicle
   * Includes total trips, total distance traveled, and last trip information
   *
   * @param vehicleId - Vehicle ID
   * @returns Vehicle statistics object
   */
  async getVehicleStats(vehicleId: number) {
    this.logger.log(`Calculating statistics for vehicle ID: ${vehicleId}`);

    const trips = await this.tripRepo.find({
      where: { vehicle: { idVehicle: vehicleId } },
      relations: ['originLocation', 'destinationLocation'],
      order: { requestedAt: 'ASC' },
    });

    const totalTrips = trips.length;

    // FIX: Convert string to number before summing
    const totalDistance = trips.reduce((sum, trip) => {
      const distance = Number(trip.distanceKm) || 0;
      return sum + distance;
    }, 0);

    // Format total distance to 2 decimal places
    const formattedTotalDistance = totalDistance.toFixed(2);

    const lastTrip = trips.length > 0 ? trips[trips.length - 1] : null;

    this.logger.log(
      `Vehicle stats calculated: ${totalTrips} trips, ${formattedTotalDistance} km total`,
    );

    return {
      totalTrips,
      totalDistance: formattedTotalDistance,
      lastTrip,
    };
  }

  /**
   * Updates the status of a vehicle
   *
   * @param vehicleId - Vehicle ID
   * @param status - New vehicle status
   * @returns Updated vehicle
   * @throws NotFoundException if vehicle not found
   * @throws BadRequestException if status is invalid
   */
  async updateStatus(vehicleId: number, status: string) {
    this.logger.log(`Updating status for vehicle ID: ${vehicleId} to ${status}`);

    const vehicle = await this.vehicleRepo.findOne({
      where: { idVehicle: vehicleId },
    });

    if (!vehicle) {
      this.logger.warn(`Vehicle not found: ID ${vehicleId}`);
      throw new NotFoundException('Vehicle not found');
    }

    // Validate status against enum
    if (!Object.values(VehicleStatus).includes(status as VehicleStatus)) {
      this.logger.warn(`Invalid vehicle status provided: ${status}`);
      throw new BadRequestException('Invalid vehicle status');
    }

    const oldStatus = vehicle.statusVehicle;
    vehicle.statusVehicle = status as VehicleStatus;

    const updatedVehicle = await this.vehicleRepo.save(vehicle);

    this.logger.log(
      `Vehicle ${vehicle.plate} status updated: ${oldStatus} → ${status}`,
    );

    return updatedVehicle;
  }


}

