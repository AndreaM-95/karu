import {  HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rating, Status } from './entities/rating.entity';
import { LessThan, Repository } from 'typeorm';
import { DriverStatus, user, UserRole } from '../users/entities/user.entity';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { createRatingDTO } from './dto/createRating.dto';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);
  constructor(
    @InjectRepository(rating)
    private readonly ratingRepo: Repository<rating>, 
    @InjectRepository(user)
    private userRepo: Repository<user>, 
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>){}

/*UH-01: see all ratings
return: all ratings registrated
*/
  async adminGetAllRatings() {
    this.logger.debug('Admin requesting all ratings')

    const result = await this.ratingRepo.find({relations: ['author', 'target', 'tripId'], order: { createdAt: 'DESC'}})
    this.logger.debug(`Total ratings found: ${result.length}`)
    return result
  }

/*UH-02: see a rating by id
return: rating seached by id
*/
  async adminGetRatingById(idRating: number) {
    this.logger.debug(`Admin searching rating with ID: ${idRating}`)

    const rating = await this.ratingRepo.findOne({where: { idRating },
      relations: ['author', 'target', 'tripId']})

    if (!rating){
      this.logger.warn(`Rating ID ${idRating} not found`)
      throw new CustomHttpException('Rating not found', HttpStatus.NOT_FOUND)
    }
    this.logger.debug(`Rating ID ${idRating} successfully found`)
    return rating;
  }

/* calculate the average of the rating by user
* use target, and the status RATED
*/
  async calculateUserAverage(userId: number) {
    this.logger.debug(`Calculating average rating for user ID: ${userId}`)
    
    const ratings = await this.ratingRepo.find({where: {target:{ idUser: userId }, status: Status.RATED}})

    this.logger.debug(`Found ${ratings.length} ratings for user ${userId}`)

    if (ratings.length === 0){
    return 0
    } else {
    const sum = ratings.reduce((acm, rating) => acm + (rating.score || 0), 0) 
    const average= sum / ratings.length
    this.logger.debug(`User ${userId} average score: ${average.toFixed(2)}`)
    return average
    }
    
  }

/*UH-03: see rating own user
return: all rating by user
*/
  async getMyRatings(user: user) {
    this.logger.debug(`Fetching ratings received by user ID: ${user.idUser}`)
    
      if (user.role !== UserRole.DRIVER && user.role !== UserRole.PASSENGER) {
      this.logger.warn(`Forbidden access by user ID: ${user.idUser}`)
        throw new CustomHttpException('Only drivers and passengers can view ratings',HttpStatus.FORBIDDEN)
    }

    const ratings = await this.ratingRepo.find({where: { target: { idUser: user.idUser}, status: Status.RATED}, order: { createdAt: 'DESC'}})
    
    this.logger.debug(`User ${user.idUser} has ${ratings.length} ratings`)
    
    const average = await this.calculateUserAverage(user.idUser);

    const notSee = ratings.map((r) => ({
      idRating: r.idRating,
      score: r.score,
      comments: r.comments || 'Sin comentarios',
      createdAt: r.createdAt}))

    return {total: ratings.length,miAverage: average,ratings: notSee}
  }

/*validate if the trip exist
*/
    async validateTripExists(tripId: number): Promise<Trip> {
    this.logger.debug(`Validating existence of trip ID: ${tripId}`)
    const trip = await this.tripRepo.findOne({where: {idTrip: tripId },relations: ['driver', 'passenger']})

    if (!trip){
    this.logger.warn(`Trip ID ${tripId} not found`);
    throw new CustomHttpException('Trip not found', HttpStatus.NOT_FOUND)
    }
    this.logger.debug(`Trip ID ${tripId} found`)
    return trip;

  }
/*validate the trip status is complete or canceled
*/

    validateTripIsRateable(trip: Trip) {
    this.logger.debug(`Validating if trip ${trip.idTrip} is rateable. Status: ${trip.statusTrip}`)
    if (trip.statusTrip !== TripStatus.COMPLETED && trip.statusTrip !== TripStatus.CANCELED) {
      this.logger.warn(`Trip ${trip.idTrip} NOT rateable. Status: ${trip.statusTrip}`)
      throw new CustomHttpException('This trip cannot be rated. Only completed or canceled trips can be rated.',HttpStatus.BAD_REQUEST)
    }
  }

/*validate the trip just rated by passenger and driver
*/
    validateUser(user: user, trip: Trip) {
    this.logger.debug(`Validating if user ${user.idUser} participated in trip ${trip.idTrip}`)
    if (user.role !== UserRole.DRIVER && user.role !== UserRole.PASSENGER) {
      this.logger.warn(`Invalid role for rating: ${user.role}`)
      throw new CustomHttpException( 'Only drivers and passengers can rate trips.', HttpStatus.FORBIDDEN)
    }

    if (user.idUser !== trip.driver.idUser &&user.idUser !== trip.passenger.idUser) {
      this.logger.warn(`User ${user.idUser} is not part of trip ${trip.idTrip}`)
      throw new CustomHttpException('You are not a participant of this trip.',HttpStatus.FORBIDDEN)
    }

  }
/*validate the trip just rated 24 hours after the trip
*/
  validateTime(trip: Trip) {
    this.logger.debug(`Validating 24h rating window for trip ${trip.idTrip}`)
    const now = new Date();
    const tripDate = new Date(trip.requestedAt); // fecha en la que se realizó el viaje
    const hours24 = 24 * 60 * 60 * 1000; // 24 horas, 60  min, 60 seg * 1000 milisegundos

    if (now.getTime() - tripDate.getTime() > hours24) {
      this.logger.warn(`Trip ${trip.idTrip} exceeded rating window (24h)`)
      throw new CustomHttpException('You cannot rate this trip anymore. Rating window expired (24h)')
    }
  }

  async validateNoPreviousRating(tripId: number, userId: number) {
  this.logger.debug(`Checking if user ${userId} already rated trip ${tripId}`)
  
  const exists = await this.ratingRepo.findOne({where: {
      tripId: { idTrip: tripId },
      author: { idUser: userId }}})

    if (exists){
    this.logger.warn(`User ${userId} already rated trip ${tripId}`)
    throw new CustomHttpException('You already rated this trip')
    }
  }

/*block the user if user have 5 ratings "bad"
*/
  async blockUser(user: user) {
    this.logger.debug(`Checking if user ${user.idUser} needs to be blocked`)
    const lowRatings = await this.ratingRepo.count({where: {
        target: { idUser: user.idUser },
        score: LessThan(3)}}) // 1-2

    this.logger.debug(`User ${user.idUser} has ${lowRatings} low ratings`)
    
    if (lowRatings >= 5) {
      this.logger.warn(`User ${user.idUser} reached low rating threshold → blocking`)
      if (user.role === UserRole.DRIVER) {
        user.driverStatus = DriverStatus.OFFLINE
        await this.userRepo.save(user)
      } else if (user.role === UserRole.PASSENGER) {
        user.active = false
        await this.userRepo.save(user);
      }
      this.logger.log(`User ${user.idUser} successfully blocked`)
    }
  }

/*UH-04: create a rating
*/
  async createRating(dto: createRatingDTO, user: user) {
      this.logger.debug(`User ${user.idUser} creating rating for trip ${dto.tripId}`)
    const trip = await this.validateTripExists(dto.tripId);

    this.validateTripIsRateable(trip)
    this.validateUser(user, trip)
    this.validateTime(trip)

    await this.validateNoPreviousRating(trip.idTrip, user.idUser);

    const target = user.idUser === trip.driver.idUser ? trip.passenger : trip.driver; 

    this.logger.debug(`Rating target determined: user ${target.idUser}`)
    
    const rating = this.ratingRepo.create({ score: dto.score,comments: dto.comments ?? null,
      author: user,
      target: target,
      tripId: trip,
      status: Status.RATED})

    const saved = await this.ratingRepo.save(rating)

    this.logger.log(`Rating ${saved.idRating} created by user ${user.idUser} for user ${target.idUser}`)

    await this.blockUser(target);

    return { message: 'Rating successfully submitted',rating: {
      idRating: saved.idRating,
      score: saved.score,
      comments: saved.comments,
      targetUser: target.name}}

  }

}