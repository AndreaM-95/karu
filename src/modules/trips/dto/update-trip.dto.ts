import { PartialType } from '@nestjs/swagger';
import { CreateTripDTO } from './create-trip.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class UpdateTrip extends PartialType(CreateTripDTO) {
  @IsEnum(TripStatus)
  statusTrip: TripStatus;

  @IsNotEmpty()
  payment: number;
}
