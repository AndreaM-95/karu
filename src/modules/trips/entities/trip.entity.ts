import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Locations } from './locations.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Rating } from '../../ratings/entities/Rating.entity';

export enum TripStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  INPROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('trip')
export class Trip {
  @PrimaryGeneratedColumn()
  idTrip: number;

  @ManyToOne(() => User, (user) => user.passengerTrips, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'passengerId' })
  passenger: User;

  @ManyToOne(() => User, (user) => user.driverTrips, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => Locations, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'originLocationId' })
  originLocation: Locations;

  @ManyToOne(() => Locations, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'destinationLocationId' })
  destinationLocation: Locations;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  cost: number;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.INPROGRESS })
  statusTrip: TripStatus;

  @OneToOne(() => Payment, (payment) => payment.trip)
  payment: Payment;

  @OneToMany(() => Rating, (rating) => rating.tripId)
  rating: Rating[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;
}
