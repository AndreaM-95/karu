import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  Unique, 
  Index 
} from 'typeorm';
import { User } from './User.entity';

@Entity('userRoles')
@Unique(['userId', 'role'])
@Index(['role'])
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

  // 🔹 Relaciones
  @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
