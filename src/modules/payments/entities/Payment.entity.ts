import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
}

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'idPayment' })
  idPayment: number;

  @OneToOne(() => Trip, (trip) => trip.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  adminShare: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  driverShare: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  ownerShare: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
  
}
