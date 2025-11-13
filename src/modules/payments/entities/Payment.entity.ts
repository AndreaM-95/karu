import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn, 
  Index 
} from 'typeorm';

import { RoadTrip } from 'src/modules/trips/entities/RoadTrip.entity';              // 🔹 Importa la entidad del viaje
import { DistributionPayment } from './DistributionPayment.entity';

@Entity('payment')
@Index(['tripId'])
@Index(['paymentStatus'])
export class Payment {
  @PrimaryGeneratedColumn()
  idPayment!: number;

  @Column({ type: 'int' })
  tripId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ 
    type: 'enum', 
    enum: ['cash', 'card', 'transfer'] 
  })
  paymentMethod!: 'cash' | 'card' | 'transfer';

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  })
  paymentStatus!: 'pending' | 'completed' | 'failed';

  @CreateDateColumn({ type: 'timestamp' })
  paymentDate!: Date;

  // Relations
  @ManyToOne(() => RoadTrip, (trip) => trip.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip!: RoadTrip;

  @OneToMany(() => DistributionPayment, (dist) => dist.payment)
  distribution?: DistributionPayment[];
}