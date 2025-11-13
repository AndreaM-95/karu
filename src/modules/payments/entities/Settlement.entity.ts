@Entity('settlement')
@Index(['userId'])
@Index(['periodStart', 'periodEnd'])
export class Settlement {
  @PrimaryGeneratedColumn()
  idSettlement!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'date' })
  periodStart!: Date;

  @Column({ type: 'date' })
  periodEnd!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalEarned!: number;

  @Column({ type: 'boolean', default: false })
  paid!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.settlements, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
