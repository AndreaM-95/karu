@Entity('rating')
@Unique(['tripId', 'passengerId'])
@Index(['driverId'])
@Index(['score'])
export class Rating {
  @PrimaryGeneratedColumn()
  idRating!: number;

  @Column({ type: 'int' })
  tripId!: number;

  @Column({ type: 'int' })
  passengerId!: number;

  @Column({ type: 'int' })
  driverId!: number;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => RoadTrip, (trip) => trip.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip!: RoadTrip;

  @ManyToOne(() => User, (user) => user.ratingsGiven, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'passengerId' })
  passenger!: User;

  @ManyToOne(() => User, (user) => user.ratingsReceived, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver!: User;
}