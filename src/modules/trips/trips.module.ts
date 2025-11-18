import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Locations } from './entities/locations.entity';
import { User } from '../users/entities/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trip, Locations])],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
