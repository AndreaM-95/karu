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

  
}

