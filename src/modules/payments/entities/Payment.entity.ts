import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoadTrip } from 'src/modules/trips/entities/RoadTrip.entity';

export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  idPayment: number;

  // FK del viaje
  @Column()
  tripId: number;

  @ManyToOne(() => RoadTrip, (trip) => trip.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: RoadTrip;

  // Monto total del pago
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  paymentStatus: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
