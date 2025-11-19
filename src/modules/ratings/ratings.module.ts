import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from 'src/modules/ratings/entities/rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User, Trip])],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
