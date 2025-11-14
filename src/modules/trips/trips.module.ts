import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Locations } from './entities/locations.entity';
import { Vehicle } from '../vehicles/entities/Vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Locations, Vehicle])],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
