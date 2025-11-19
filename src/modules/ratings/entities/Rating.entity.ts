import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';

export enum Status {
  RATED = 'rated',
  NOTRATED = 'notRated'
}

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn()
  idRating: number;

  @Column({ type: 'int', width: 1, nullable: true })
  score: number | null;

  @Column({type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: 'enum', enum: Status, default: Status.NOTRATED})
  status: Status;

  @ManyToOne(() => Trip, (trip) => trip.rating, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  tripId: Trip;

 //quien califica
  @ManyToOne(() => User, user => user.ratingsGiven, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;  
  
  // a quien califica
  @ManyToOne(() => User, user => user.ratingsReceived, { eager: true })
  @JoinColumn({ name: 'targetId' })
  target: User;

}
