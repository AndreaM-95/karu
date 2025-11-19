import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Locations } from './entities/locations.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { DriverStatus, User, UserRole } from '../users/entities/user.entity';
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

  /**
   * @description Validates the passenger, driver, their roles, vehicle availability,
   * and the provided origin/destination locations. Ensures that the
   * passenger has no active trips, calculates distance and cost,
   * creates the trip, updates the driver's status, and returns a
   * simplified response with trip details.
   * @returns An object containing a success message and trip information.
 */
  async createTrip(userFromToken, dto: CreateTripDTO) {
    const passengerId = userFromToken.idUser;
    this.logger.log(`Creating the trip for the user with ID: ${passengerId}`);

    //Search for passenger and validate
    const passenger = await this.userRepository.findOneBy({ idUser: passengerId });
    if (!passenger) throw new CustomHttpException( 'Passenger not found.', HttpStatus.NOT_FOUND );
    if (!passenger.active) throw new CustomHttpException('Passenger is not active.');
    if (passenger.role !== UserRole.PASSENGER) throw new CustomHttpException('User is not a passenger.');

    //Find a female driver with vehicles
    const driver = await this.userRepository.findOne({
      where: { idUser: dto.driverId },
      relations: ['drivingVehicles']
    });

    if (!driver)
      throw new CustomHttpException('Driver not found.', HttpStatus.NOT_FOUND);

    if (!driver.active) throw new CustomHttpException('Driver is not active.');

    if (driver.role !== UserRole.DRIVER)
      throw new CustomHttpException('User is not a driver.');

    if (driver.driverStatus !== DriverStatus.AVAILABLE)
      throw new CustomHttpException('Driver is not available.');

    if (!driver.drivingVehicles || driver.drivingVehicles.length === 0)
      throw new CustomHttpException('This driver has no registered vehicles.');

    const vehicle = driver.drivingVehicles[0];

    //Validate locations
    const origin = await this.locationRepository.findOneBy({
      idLocation: dto.originLocationId,
    });
    const destination = await this.locationRepository.findOneBy({
      idLocation: dto.destinationLocationId,
    });

    if (!origin || !destination)
      throw new CustomHttpException('Invalid origin or destination.');

    if (origin.idLocation === destination.idLocation)
      throw new CustomHttpException('Origin and destination cannot be the same.');

    //Prevent the passenger from having another active trip
    const passengerActiveTrip = await this.tripRepository.findOne({
      where: {
        passenger: { idUser: passengerId },
        statusTrip: In([
          TripStatus.PENDING,
          TripStatus.ACCEPTED,
          TripStatus.INPROGRESS,
        ]),
      },
    });
    if (passengerActiveTrip) throw new CustomHttpException('Passenger already has an active trip.');
  
    const distanceKm = this.calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    );
    const cost = this.calculatePrice(distanceKm);

    const trip = this.tripRepository.create({
      passenger,
      driver,
      vehicle,
      originLocation: origin,
      destinationLocation: destination,
      distanceKm,
      cost,
      statusTrip: TripStatus.INPROGRESS,
    });
    const savedTrip = await this.tripRepository.save(trip);

    driver.driverStatus = DriverStatus.BUSY;
    await this.userRepository.save(driver);

    this.logger.log(`Trip created with ID: ${trip.idTrip}`);
    return {
      message: 'Trip successfully requested.',
      trip: {
        idTrip: savedTrip.idTrip,
        passenger: passenger.name,
        driver: driver.name,
        vehicle: vehicle.plate,
        origin: origin.zone,
        destination: destination.zone,
        distanceKm,
        price: `COP $ ${cost}`,
        status: savedTrip.statusTrip,
      },
    };
  }

  private calculatePrice(distanceKm: number): number {
    const pricePerKm = 3000;
    return Number((distanceKm * pricePerKm).toFixed(2));
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Number(distance.toFixed(2));
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  async completeTrip(tripId: number) {
    this.logger.debug(`Obtaining trip information with ID: ${tripId}`);

    const trip = await this.tripRepository.findOne({
      where: { idTrip: tripId },
      relations: ['driver', 'passenger'],
    });

    if (!trip)
      throw new CustomHttpException('Trip not found.', HttpStatus.NOT_FOUND);

    if (trip.statusTrip === TripStatus.CANCELED)
      throw new CustomHttpException('Trip already canceled.');

    if (trip.statusTrip === TripStatus.COMPLETED)
      throw new CustomHttpException('Trip already completed.');

    if (
      trip.statusTrip !== TripStatus.INPROGRESS &&
      trip.statusTrip !== TripStatus.ACCEPTED
    ) {
      throw new CustomHttpException('Trip cannot be completed at this stage.');
    }

    const distanceKm = trip.distanceKm;
    const cost = trip.cost;
    trip.statusTrip = TripStatus.COMPLETED;
    trip.driver.driverStatus = DriverStatus.AVAILABLE;
    await this.userRepository.save(trip.driver);
    await this.tripRepository.save(trip);

    this.logger.debug(`Trip completed, your current status is: ${trip.statusTrip}`);
    return {
      message: 'Trip successfully completed.',
      trip: {
        idTrip: trip.idTrip,
        distanceKm,
        price: `COP $ ${cost}`,
        driver: trip.driver.name,
        passenger: trip.passenger.name,
      },
    };
  }

  async cancelTrip(tripId: number) {
    this.logger.debug(`Obtaining trip information with ID: ${tripId}`);
    const trip = await this.tripRepository.findOne({
      where: { idTrip: tripId },
      relations: ['driver', 'passenger'],
    });

    if (!trip) throw new CustomHttpException('Trip not found.', HttpStatus.NOT_FOUND);
    if (trip.statusTrip === TripStatus.CANCELED) throw new CustomHttpException('Trip already canceled.');
    if (trip.statusTrip === TripStatus.COMPLETED) throw new CustomHttpException('A completed trip cannot be canceled.');

    trip.statusTrip = TripStatus.CANCELED;
    trip.driver.driverStatus = DriverStatus.AVAILABLE;
    await this.userRepository.save(trip.driver);
    await this.tripRepository.save(trip);

    this.logger.debug(`Trip cancelled, your current status is: ${trip.statusTrip}`);
    return {
      message: 'Trip has been canceled.',
      tripId: trip.idTrip,
      driverAvailable: trip.driver.name,
      cost: trip.cost,
    };
  }
}
