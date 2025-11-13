@Entity('roadTrip')
@Index(['statusTrip'])
@Index(['passengerId'])
@Index(['driverId'])
export class RoadTrip {
  @PrimaryGeneratedColumn()
  idTrip!: number;

  @Column({ type: 'int' })
  passengerId!: number;

  @Column({ type: 'int' })
  vehicleId!: number;

  @Column({ type: 'int' })
  driverId!: number;

  // Ubicación Origen
  @Column({ type: 'varchar', length: 100, nullable: true })
  originLocality?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  originNeighborhood?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  originLatitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  originLongitude?: number;

  // Ubicación Destino
  @Column({ type: 'varchar', length: 100, nullable: true })
  destinationLocality?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  destinationNeighborhood?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  destinationLatitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  destinationLongitude?: number;

  // Cálculos
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  // Estado y tiempos
  @Column({ 
    type: 'enum', 
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'canceled'],
    default: 'pending'
  })
  statusTrip!: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'canceled';

  @CreateDateColumn({ type: 'timestamp' })
  requestedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', nullable: true })
  canceledBy?: number;

  @Column({ type: 'text', nullable: true })
  cancelationReason?: string;

  // Relations
  @ManyToOne(() => User, (user) => user.tripsAsPassenger, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'passengerId' })
  passenger!: User;

  @ManyToOne(() => User, (user) => user.tripsAsDriver, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driverId' })
  driver!: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: Vehicle;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'canceledBy' })
  canceler?: User;

  @OneToMany(() => Payment, (payment) => payment.trip)
  payments?: Payment[];

  @OneToMany(() => Rating, (rating) => rating.trip)
  ratings?: Rating[];

  @OneToMany(() => Location, (location) => location.trip)
  locations?: Location[];
}