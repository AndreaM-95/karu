import { IsEnum, IsNumber } from 'class-validator';
import { Trip } from 'src/modules/trips/entities/trip.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  idPayment: number;

  @OneToOne(() => Trip, (trip) => trip.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  amount: number;

  @Column({ type: 'enum', enum: ['cash', 'card', 'transfer'] })
  @IsEnum(['cash', 'card', 'transfer'])
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  paymentStatus: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
}
