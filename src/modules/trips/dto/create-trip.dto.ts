import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTripDTO {
  @ApiProperty({ example: 5, description: 'Location ID for the origin point' })
  @IsNotEmpty()
  @IsNumber()
  originLocationId: number;

  @ApiProperty({ example: 8, description: 'Location ID for the destination point' })
  @IsNotEmpty()
  @IsNumber()
  destinationLocationId: number;
}
