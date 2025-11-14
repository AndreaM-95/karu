import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { IsInt, Max, Min } from 'class-validator';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/User.entity';

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn()
  idRating: number;

  @OneToOne(() => Trip, (trip) => trip.rating, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => User, (user) => user.givenRatings)
  @JoinColumn({ name: 'passengerId' })
  passenger: User;

  @ManyToOne(() => User, (user) => user.receivedRatings)
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @Column()
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @Column({ nullable: true })
  comments?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
