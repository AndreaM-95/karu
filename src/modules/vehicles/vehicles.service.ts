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
}
