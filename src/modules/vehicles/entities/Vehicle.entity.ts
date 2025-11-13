import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn, 
  CreateDateColumn, 
  Index 
} from 'typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { DriverVehicle } from './DriverVehicle.entity';
import { RoadTrip } from 'src/modules/trips/entities/RoadTrip.entity';

@Entity('vehicle')
@Index(['plate'])
@Index(['statusVehicle'])
@Index(['vehicleType'])
@Index(['exclusiveForWomen'])
export class Vehicle {
  @PrimaryGeneratedColumn()
  idVehicle!: number;

  @Column({ type: 'int' })
  ownerId!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  plate!: string;

  @Column({ type: 'varchar', length: 50 })
  brand!: string;

  @Column({ type: 'varchar', length: 50 })
  model!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  color?: string;

  @Column({ 
    type: 'enum', 
    enum: ['carro', 'moto'] 
  })
  vehicleType!: 'carro' | 'moto';

  @Column({ type: 'int', default: 4 })
  capacity!: number;

  @Column({ type: 'boolean', default: false })
  exclusiveForWomen!: boolean;

  @Column({ type: 'varchar', length: 50 })
  licenseNumber!: string;

  @Column({ type: 'varchar', length: 50 })
  cardProperty!: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  })
  statusVehicle!: 'active' | 'maintenance' | 'inactive';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  // 🔹 Relaciones
  @ManyToOne(() => User, (user) => user.ownedVehicles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => DriverVehicle, (dv) => dv.vehicle)
  driverRelations?: DriverVehicle[];

  @OneToMany(() => RoadTrip, (trip) => trip.vehicle)
  trips?: RoadTrip[];
}
