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

}