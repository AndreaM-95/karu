import { IsNotEmpty, IsEnum, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDTO {
  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @IsNotEmpty()
  @IsString()
  cardProperty: string;

  @IsNotEmpty()
  @IsString()
  plate: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsInt()
  @Min(1)
  @Max(10)
  capacity: number;

  @IsNotEmpty()
  ownerId: number; // En el DTO usas el ID, no la entidad completa
}