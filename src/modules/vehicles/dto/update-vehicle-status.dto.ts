import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

/**
 * Data Transfer Object for updating vehicle status
 * Allows changing the operational status of a vehicle
 * Only administrators can update vehicle status
 */
export class UpdateVehicleStatusDto {
  @ApiProperty({
    description: 'New operational status for the vehicle',
    enum: VehicleStatus,
    enumName: 'VehicleStatus',
    example: VehicleStatus.ACTIVE,
    examples: {
      active: {
        value: 'active',
        description: 'Vehicle is operational and available for trips',
      },
      inactive: {
        value: 'inactive',
        description: 'Vehicle is not available for trips',
      },
    },
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(VehicleStatus, {
    message: 'Status must be active or inactive',
  })
  statusVehicle: VehicleStatus;
}