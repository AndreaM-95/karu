import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { VehicleStatus, VehicleType } from '../entities/vehicle.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for vehicle query filters
 * All fields are optional and can be combined for advanced filtering
 * Supports pagination with page and limit parameters
 */
export class QueryVehicleDto {
  @ApiPropertyOptional({
    description: 'Filter by vehicle brand (partial match, case-insensitive)',
    example: 'Toyota',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Brand must be a string' })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle model (partial match, case-insensitive)',
    example: 'Corolla 2020',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Model must be a string' })
  model?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle operational status',
    enum: VehicleStatus,
    enumName: 'VehicleStatus',
    example: 'active',
  })
  @IsOptional()
  @IsEnum(VehicleStatus, {
    message: 'Status must be active or inactive',
  })
  statusVehicle?: VehicleStatus;

  @ApiPropertyOptional({
    description: 'Filter by vehicle type',
    enum: VehicleType,
    enumName: 'VehicleType',
    example: 'carro',
  })
  @IsOptional()
  @IsEnum(VehicleType, {
    message: 'Vehicle type must be carro or moto',
  })
  vehicleType?: VehicleType;

  @ApiPropertyOptional({
    description: 'Filter by owner ID',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Owner ID must be an integer' })
  @Min(1, { message: 'Owner ID must be at least 1' })
  ownerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by assigned driver ID',
    example: 2,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Driver ID must be an integer' })
  @Min(1, { message: 'Driver ID must be at least 1' })
  driverId?: number;

  @ApiPropertyOptional({
    description: 'Filter by license plate (partial match, case-insensitive)',
    example: 'ABC123',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Plate must be a string' })
  plate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination (starts at 1)',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page for pagination',
    example: 10,
    type: Number,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;
}

