@Entity('distributionPayment')
@Index(['driverId'])
@Index(['ownerId'])
export class DistributionPayment {
  @PrimaryGeneratedColumn()
  idDistribution!: number;

  @Column({ type: 'int', unique: true })
  paymentId!: number;

  @Column({ type: 'int' })
  driverId!: number;

  @Column({ type: 'int', nullable: true })
  ownerId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 70.00 })
  driverPercentage!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.00 })
  ownerPercentage!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  driverAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  ownerAmount!: number;

  @CreateDateColumn({ type: 'timestamp' })
  calculatedAt!: Date;

  // Relations
  @ManyToOne(() => Payment, (payment) => payment.distribution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paymentId' })
  payment!: Payment;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driverId' })
  driver!: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;
}

