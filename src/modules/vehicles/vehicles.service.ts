import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDTO } from './dto/create-vehicle.dto';
import { UpdateVehicleDTO } from './dto/update-vehicle.dto';
import { QueryVehicleDTO } from './dto/query-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
 * ========================================================================
 * REGISTER VEHICLE
 * ========================================================================
 * Allows a driver/owner to register a new vehicle in the system.
 * 
 * Implemented validations:
 * - Unique license plate (there cannot be two vehicles with the same plate)
 * - Owner must exist in the database
 * - Valid relationship between the vehicle and the owner user
 */
  async create(createVehicleDto: CreateVehicleDTO): Promise<Vehicle> {
     //The license plate must be unique in the system.
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { plate: createVehicleDto.plate },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Ya existe un vehículo con la placa ${createVehicleDto.plate}`,
      );
    }

    try {
      // Create vehicle entity with relation to the owner
      const vehicle = this.vehicleRepository.create({
        ...createVehicleDto,
        owner: { idUser: createVehicleDto.ownerId } as any,
      });

      return await this.vehicleRepository.save(vehicle);
    } catch (error) {
      // Validation: Check that the owner exists (Foreign Key)
      if (error.code === '23503') {
        throw new BadRequestException(
          `El usuario con ID ${createVehicleDto.ownerId} no existe`,
        );
      }
      throw error;
    }
  }

  /**
 * ========================================================================
 * LIST VEHICLES WITH FILTERS AND PAGINATION
 * ========================================================================
 * Provides a paginated list of vehicles with multiple filtering options.
 * 
 * Available filters:
 * - vehicleType: Vehicle type (sedan, SUV, pickup, etc.)
 * - statusVehicle: Status (ACTIVE, INACTIVE, MAINTENANCE)
 * - ownerId: Owner ID
 * 
 * Pagination:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * 
 * @param queryDto - Query parameters with filters and pagination
 * @returns Object containing data, total, page, and limit
 */

   async findAll(queryDto: QueryVehicleDTO): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }> {
     // Pagination setup
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

     // Dynamic construction of WHERE filters
    const where: FindOptionsWhere<Vehicle> = {};

    // Filter: Vehicle type
    if (filters.vehicleType) {
      where.vehicleType = filters.vehicleType;
    }

    // Filter: Vehicle status
    if (filters.statusVehicle) {
      where.statusVehicle = filters.statusVehicle;
    }

    // Filter: Specific owner
    if (filters.ownerId) {
      where.owner = { idUser: filters.ownerId } as any;
    }

    // Execute query with pagination and filters
    const [data, total] = await this.vehicleRepository.findAndCount({
      where,
      relations: ['owner'], // Incluir información del propietario
      skip,
      take: limit,
      order: { createdAt: 'DESC' }, // Más recientes primero
    });

    // Return data with pagination metadata
    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
 * ========================================================================
 * VIEW VEHICLE DETAILS BY ID
 * ========================================================================
 * Retrieves complete information of a specific vehicle by its ID.
 * 
 * Includes:
 * - Full vehicle data
 * - Owner information
 * - History of trips made
 * 
 * @param id - Unique ID of the vehicle
 * @returns Vehicle with loaded relations
 * @throws NotFoundException - If the vehicle does not exist
 */

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { idVehicle: id },
      relations: ['owner', 'trips'], // Load owner and trips
    });

    // Validation: Vehicle exists
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehicle;
  }

  /**
 * ========================================================================
 * VIEW VEHICLE DETAILS BY PLATE
 * ========================================================================
 * Searches for a specific vehicle by its unique plate number.
 * Useful for administrative searches and verification processes.
 * 
 * @param plate - Vehicle plate number (unique identifier)
 * @returns The vehicle found, including owner information
 * @throws NotFoundException - If no vehicle exists with the provided plate
 */
async findByPlate(plate: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { plate },
      relations: ['owner'],
    });

    // Validación: Vehículo con esa placa existe
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con placa ${plate} no encontrado`);
    }

    return vehicle;
  }

  /**
 * ========================================================================
 * LIST VEHICLES BY OWNER
 * ========================================================================
 * Retrieves all vehicles registered by a specific driver.
 * Useful for drivers to manage their personal fleet.
 * 
 * @param ownerId - ID of the owner/driver
 * @returns Array of the owner's vehicles, ordered by date
 */
 async findByOwner(ownerId: number): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      where: { owner: { idUser: ownerId } as any },
      relations: ['owner'],
      order: { createdAt: 'DESC' }, // Más recientes primero
    });
  }

  /**
 * ========================================================================
 * UPDATE VEHICLE INFORMATION
 * ========================================================================
 * Allows partial updates to an existing vehicle’s data.
 * 
 * Features:
 * - Partial update (only the provided fields are modified)
 * - Validates the existence of the vehicle before updating
 * - Keeps all unspecified fields unchanged
 * @param id - ID of the vehicle to update
 * @param updateVehicleDto - Data to update (partial)
 * @returns Updated vehicle
 * @throws NotFoundException - If the vehicle does not exist
 */
 async update(id: number, updateVehicleDto: UpdateVehicleDTO): Promise<Vehicle> {
    // Validate that the vehicle exists
    const vehicle = await this.findOne(id);

    // Partial update: only modify the fields that were provided
    Object.assign(vehicle, updateVehicleDto);

    return await this.vehicleRepository.save(vehicle);
  }

  /**
 * ========================================================================
 * MANAGE VEHICLE STATUS
 * ========================================================================
 * Updates the operational status of a vehicle.
 * 
 * Possible statuses:
 * - ACTIVE: Vehicle available for trips
 * - INACTIVE: Vehicle not available
 * - MAINTENANCE: Vehicle under maintenance
 * 
 * Use cases:
 * - Temporarily deactivate a vehicle
 * - Mark a vehicle as under repair
 * - Reactivate a vehicle after maintenance
 * 
 * @param id - Vehicle ID
 * @param status - New status for the vehicle
 * @returns Vehicle with updated status
 * @throws NotFoundException - If the vehicle does not exist
 */
async updateStatus(id: number, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.statusVehicle = status;
    return await this.vehicleRepository.save(vehicle);
  }
/**
 * ========================================================================
 * HU-011: DELETE VEHICLE (PHYSICAL)
 * ========================================================================
 * Permanently deletes a vehicle from the database.
 * 
 * WARNING: This is an irreversible physical deletion.
 * Consider using softDelete() for logical deletion.
 */
  async remove(id: number): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }

  /**
 * ========================================================================
 * SOFT DELETE VEHICLE (LOGICAL DELETION)
 * ========================================================================
 * Deactivates a vehicle without physically removing it from the database.
 * 
 * Advantages:
 * - Preserves referential integrity
 * - Allows the vehicle to be restored later
 * - Keeps trip history and related records intact
 * 
 * Implementation: Changes the vehicle status to INACTIVE
 * 
 * @param id - ID of the vehicle to deactivate
 * @returns Vehicle with INACTIVE status
 * @throws NotFoundException - If the vehicle does not exist
 */
async softDelete(id: number): Promise<Vehicle> {
    return await this.updateStatus(id, VehicleStatus.INACTIVE);
  }
/**
 * ========================================================================
 * GET AVAILABLE VEHICLES
 * ========================================================================
 * Retrieves a list of all active vehicles available for trips.
 * 
 * Applied Filter:
 * - Only vehicles with ACTIVE status
 * 
 * Use Cases:
 * - Display available vehicles to users searching for a trip
 * - Availability dashboard
 * - Operational vehicle statistics
 * 
 * @returns Array of active vehicles with owner information
 */
async getAvailableVehicles(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      where: { statusVehicle: VehicleStatus.ACTIVE },
      relations: ['owner'],
    });
  }
/**
 * ========================================================================
 * HU-014: FILTER VEHICLES BY TYPE
 * ========================================================================
 * Filters vehicles by their category or type.
 * 
 * Common types:
 * - Sedan
 * - SUV
 * - Pickup Truck
 * - Compact
 * - Van
 * - Motorcycle
 * 
 * Use Cases:
 * - Specific search by vehicle type
 * - User preferences
 * - Passenger/cargo capacity requirements
 * 
 * @param type - Vehicle type to filter by
 * @returns Array of vehicles matching the specified type
 */
async getVehiclesByType(type: string): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      where: { vehicleType: type as any },
      relations: ['owner'],
    });
  }

 /**
 * ========================================================================
 * HU-015: COUNT VEHICLES BY OWNER
 * ========================================================================
 * Counts how many vehicles a driver has registered.
 * 
 * Use Cases:
 * - Validate vehicle limit per driver
 * - Platform statistics
 * - Driver dashboard
 * - Administrative reports
 * 
 * Example: Limit drivers to 5 registered vehicles
 * 
 * @param ownerId - ID of the vehicle owner
 * @returns Number of vehicles registered by the owner
 */
  async countVehiclesByOwner(ownerId: number): Promise<number> {
    return await this.vehicleRepository.count({
      where: { owner: { idUser: ownerId } as any },
    });
  }
}
