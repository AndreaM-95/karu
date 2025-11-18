import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Locations } from './entities/locations.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { DriverStatus, User, UserRole } from '../users/entities/User.entity';
import { CreateTripDTO } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Locations)
    private locationRepository: Repository<Locations>
  ) {}

  /**
   * @description Selecting only `locality` and `zone`, and returns an object
   * where each locality contains its list of zones.
   * @returns A record mapping each locality to an array of zones.
  */
  async findAllLocations() {
    this.logger.debug('Fetching all locations');
    const locations = await this.locationRepository.find({
      select: ['locality', 'zone'],
    });

    const grouped: Record<string, string[]> = {};

    locations.forEach((loc) => {
      const locality = loc.locality.trim();
      if (!grouped[locality]) {
        grouped[locality] = [];
      }
      grouped[locality].push(loc.zone.trim());
    });

    return grouped;
  }

  async findAllNeighborhoods(locality: string) {
    this.logger.debug(`Searching for the location with name: ${locality}`);
    const cleanLocality = locality.trim();

    const location = await this.locationRepository.findOneBy({
      locality: cleanLocality,
    });
    if (!location)
      throw new CustomHttpException('Location not found.', HttpStatus.NOT_FOUND);

    this.logger.debug(`Locality called ${locality} found`)
    return this.locationRepository.find({
      where: { locality: cleanLocality },
      select: ['idLocation', 'zone'],
    });
  }

  /**
   * @description Retrieves the authenticated user's trip history.Returns the trip history based on
   * the user's role.
   * @param userFromToken - JWT payload containing the user ID.
   * @returns An object with the user's role, total trips, and trip list.
  */
  async getUserTripHistory(userFromToken) {
    this.logger.debug('Obtaining token information to list trips');

    const { idUser } = userFromToken;

    const user = await this.userRepository.findOne({
      where: { idUser },
      relations: ['passengerTrips', 'driverTrips'],
    });

    if (!user)
      throw new CustomHttpException('User not found.', HttpStatus.NOT_FOUND);

    if (user.role === UserRole.PASSENGER) {
      if (!user.passengerTrips || user.passengerTrips.length === 0) {
        throw new CustomHttpException( 'No trips have been made.', HttpStatus.NOT_FOUND);
      }

      return {
        role: 'PASSENGER',
        totalTrips: user.passengerTrips.length,
        trips: user.passengerTrips,
      };
    }

    if (user.role === UserRole.DRIVER) {
      if (!user.driverTrips || user.driverTrips.length === 0) {
        throw new CustomHttpException('No trips have been made.', HttpStatus.NOT_FOUND );
      }

      return {
        role: 'DRIVER',
        totalTrips: user.driverTrips.length,
        trips: user.driverTrips,
      };
    }
  }
}
