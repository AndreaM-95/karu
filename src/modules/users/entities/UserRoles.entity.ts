import { Entity, PrimaryGeneratedColumn, Column, JoinColumn }

@Entity('userRoles')
@Unique(['userId', 'role'])
export class UserRole {
  @PrimaryGeneratedColumn()
  idUserRole!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ 
    type: 'enum', 
    enum: ['admin', 'owner', 'driver', 'passenger'] 
  })
  role!: 'admin' | 'owner' | 'driver' | 'passenger';

  // Relations
  @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}