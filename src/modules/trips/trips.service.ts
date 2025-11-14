import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Locations } from './entities/locations.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { User, UserRole } from '../users/entities/User.entity';
import { Vehicle } from '../vehicles/entities/Vehicle.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async findAllZones(locality: string) {
    const cleanLocality = locality.trim();

    const location = await this.locationRepository.findOneBy({
      locality: cleanLocality,
    });
    if (!location)
      throw new CustomHttpException(
        'Location not found.',
        HttpStatus.NOT_FOUND,
      );

    return this.locationRepository.find({
      where: { locality: cleanLocality },
      select: ['idLocation', 'zone'],
    });
  }

  async getUserTripHistory(userId: number) {
    const user = await this.userRepository.findOneBy({ idUser: userId });
    if (!user) throw new CustomHttpException('User not found.', HttpStatus.NOT_FOUND);

    const trips = await this.tripRepository.find({
      where: { user: { idUser: userId } },
      relations: ['user', 'vehicle', 'locations'],
    });

    return {
      passengerTrips: user.role === UserRole.PASSENGER ? trips : [],
      driverTrips: user.role === UserRole.DRIVER ? trips : [],
    };
  }
}
