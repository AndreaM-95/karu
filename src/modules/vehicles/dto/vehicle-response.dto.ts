import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for vehicle information
 * Contains complete vehicle data including owner, drivers, and trips
 * Used in GET endpoints that return vehicle details
 */
export class VehicleResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the vehicle',
    example: 1,
    type: Number,
  })
  idVehicle: number;

  @ApiProperty({
    description: 'Vehicle license plate number (unique)',
    example: 'ABC123',
    type: String,
  })
  plate: string;

  @ApiPropertyOptional({
    description: 'Vehicle brand/manufacturer',
    example: 'Chevrolet',
    type: String,
  })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Vehicle model',
    example: 'Chevrolet Spark GT',
    type: String,
  })
  model?: string;

  @ApiPropertyOptional({
    description: 'Type of vehicle',
    example: 'carro',
    enum: ['carro', 'moto'],
    type: String,
  })
  vehicleType?: string;

  @ApiProperty({
    description: 'Current operational status of the vehicle',
    example: 'active',
    enum: ['active', 'inactive'],
    type: String,
  })
  statusVehicle: string;

  @ApiProperty({
    description: 'Owner information',
    type: 'object',
    properties: {
      idUser: {
        type: 'number',
        description: 'Owner user ID',
        example: 1,
      },
      name: {
        type: 'string',
        description: 'Owner full name',
        example: 'MARIA GARCIA',
      },
    },
  })
  owner: {
    idUser: number;
    name: string;
  };

  @ApiProperty({
    description: 'List of drivers assigned to this vehicle',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        idUser: {
          type: 'number',
          description: 'Driver user ID',
          example: 2,
        },
        name: {
          type: 'string',
          description: 'Driver full name',
          example: 'ANDREA LOPEZ',
        },
      },
    },
  })
  drivers: Array<{
    idUser: number;
    name: string;
  }>;

  @ApiProperty({
    description: 'List of trips made by this vehicle',
    type: 'array',
    isArray: true,
  })
  trips: any[];
}

/**
 * Owner information nested in vehicle response
 */
export class VehicleOwnerDto {
  @ApiProperty({
    description: 'Owner user ID',
    example: 1,
  })
  idUser: number;

  @ApiProperty({
    description: 'Owner full name',
    example: 'MARIA GARCIA',
  })
  name: string;
}

/**
 * Driver information nested in vehicle response
 */
export class VehicleDriverDto {
  @ApiProperty({
    description: 'Driver user ID',
    example: 2,
  })
  idUser: number;

  @ApiProperty({
    description: 'Driver full name',
    example: 'ANDREA LOPEZ',
  })
  name: string;
}