import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  Unique, 
  Index 
} from 'typeorm';
import { Vehicle } from './Vehicle.entity';
import { User } from 'src/modules/users/entities/User.entity';

@Entity('driverVehicle')
@Unique(['vehicleId', 'userId', 'relationType'])
@Index(['userId'])
@Index(['vehicleId'])
export class DriverVehicle {
  @PrimaryGeneratedColumn()
  idDriverVehicle!: number;

  @Column({ type: 'int' })
  vehicleId!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ 
    type: 'enum', 
    enum: ['owner', 'driver'] 
  })
  relationType!: 'owner' | 'driver';

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // 🔹 Relaciones
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.driverRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: Vehicle;

  @ManyToOne(() => User, (user) => user.vehicleRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

