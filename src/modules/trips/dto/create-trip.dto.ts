import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class CreateTripDTO {
  @IsNotEmpty()
  @IsNumber()
  passenger: number;

  @IsNotEmpty()
  @IsNumber()
  driver: number;

  @IsNotEmpty()
  @IsNumber()
  vehicle: number;

  @IsNotEmpty()
  @IsNumber()
  originLocation: number;

  @IsNotEmpty()
  @IsNumber()
  destinationLocation: number;

  @IsNotEmpty()
  @IsNumber()
  distanceKm: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cost: number;

  @IsEnum(TripStatus)
  statusTrip: TripStatus;

  @IsNotEmpty()
  payment: number;

  @IsOptional()
  @IsInt()
  rating?: number;
}
