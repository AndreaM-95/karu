@Entity('activityLogs')
@Index(['userId'])
@Index(['action'])
@Index(['entity'])
@Index(['createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  idLog!: number;

  @Column({ type: 'int', nullable: true })
  userId?: number;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entity?: string;

  @Column({ type: 'int', nullable: true })
  entityId?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ 
    type: 'enum', 
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    nullable: true
  })
  requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint?: string;

  @Column({ type: 'int', nullable: true })
  statusCode?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;
}