import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTripDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  passengerId: number;

  @ApiProperty({ example: 2, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  driverId: number;

  @ApiProperty({ example: 5, description: 'Location ID for the origin point' })
  @IsNotEmpty()
  @IsNumber()
  originLocationId: number;

  @ApiProperty({ example: 8, description: 'Location ID for the destination point' })
  @IsNotEmpty()
  @IsNumber()
  destinationLocationId: number;
}
