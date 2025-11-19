import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { rating } from 'src/modules/ratings/entities/rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from '../users/entities/user.entity';
import { trip } from '../trips/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([rating, user, trip])],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
