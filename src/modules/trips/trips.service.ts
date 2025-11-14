import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Locations } from './entities/locations.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { UserRole } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/Vehicle.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Locations)
    private locationRepository: Repository<Locations>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  findAllLocations() {
    return this.locationRepository.find();
  }
}
