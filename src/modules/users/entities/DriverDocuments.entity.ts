import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  Index 
} from 'typeorm';

import { User } from './User.entity';

@Entity('driverDocuments')
export class DriverDocument {
  @PrimaryGeneratedColumn()
  idDriverDoc!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 50 })
  driverLicense!: string;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.driverDocuments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
