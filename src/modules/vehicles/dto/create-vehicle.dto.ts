import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsPositive,
  Length,
  Matches,
} from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for vehicle creation
 * Owners can create vehicles for themselves
 * Admins can create vehicles for any owner by specifying ownerId
 */
export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle license plate number (unique)',
    example: 'ABC123',
    minLength: 5,
    maxLength: 10,
  })
  @IsString({ message: 'Plate must be a string' })
  @IsNotEmpty({ message: 'Plate is required' })
  @Length(5, 10, { message: 'Plate must be between 5 and 10 characters' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Plate must contain only uppercase letters, numbers, and hyphens',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  plate: string;

  @ApiPropertyOptional({
    description: 'Vehicle brand/manufacturer',
    example: 'Chevrolet',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Brand must be a string' })
  @IsOptional()
  @Length(2, 50, { message: 'Brand must be between 2 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  brand?: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Chevrolet Spark GT',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Model must be a string' })
  @IsNotEmpty({ message: 'Model is required' })
  @Length(2, 50, { message: 'Model must be between 2 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  model: string;

  @ApiPropertyOptional({
    description: 'Type of vehicle',
    enum: VehicleType,
    enumName: 'VehicleType',
    example: 'carro',
  })
  @IsOptional()
  @IsEnum(VehicleType, { message: 'Vehicle type must be carro or moto' })
  vehicleType?: VehicleType;

  @ApiPropertyOptional({
    description:
      'ID of the owner (required for admins, ignored for owners as they can only create for themselves)',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Owner ID must be a number' })
  @IsPositive({ message: 'Owner ID must be a positive number' })
  ownerId?: number;
}
