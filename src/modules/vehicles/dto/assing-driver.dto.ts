import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

/**
 * Data Transfer Object for assigning a driver to a vehicle
 * Both vehicle and driver must exist and have appropriate roles
 */
export class AssignDriverDto {
  @ApiProperty({
    description: 'ID of the vehicle to assign the driver to',
    example: 4,
    type: Number,
  })
  @IsNotEmpty({ message: 'Vehicle ID is required' })
  @IsNumber({}, { message: 'Vehicle ID must be a number' })
  @IsPositive({ message: 'Vehicle ID must be a positive number' })
  vehicleId: number;

  @ApiProperty({
    description: 'ID of the driver to be assigned (user must have driver role)',
    example: 10,
    type: Number,
  })
  @IsNotEmpty({ message: 'Driver ID is required' })
  @IsNumber({}, { message: 'Driver ID must be a number' })
  @IsPositive({ message: 'Driver ID must be a positive number' })
  driverId: number;
}