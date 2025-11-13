import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  Index, 
  CreateDateColumn 
} from 'typeorm';
import { UserRole } from './UserRoles.entity';
import { DriverVehicle } from 'src/modules/vehicles/entities/DriverVehicle.entity';
import { RoadTrip } from 'src/modules/trips/entities/RoadTrip.entity';
import { Rating } from 'src/modules/ratings/entities/Rating.entity';
import { Settlement } from 'src/modules/payments/entities/Settlement.entity';
import { ActivityLog } from 'src/shared/entities/ActivityLog';
import { DriverDocument } from './DriverDocuments.entity';
import { Vehicle } from 'src/modules/vehicles/entities/Vehicle.entity';

@Entity('users')
@Index(['nationalId'])
@Index(['phone'])
@Index(['gender'])
export class User {
  @PrimaryGeneratedColumn()
  idUser!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ 
    type: 'enum', 
    enum: ['male', 'female', 'other'] 
  })
  gender!: 'male' | 'female' | 'other';

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  nationalId!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;

  // 🔹 Relaciones
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles?: UserRole[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  ownedVehicles?: Vehicle[];

  @OneToMany(() => DriverDocument, (doc) => doc.user)
  driverDocuments?: DriverDocument[];

  @OneToMany(() => DriverVehicle, (dv) => dv.user)
  vehicleRelations?: DriverVehicle[];

  @OneToMany(() => RoadTrip, (trip) => trip.passenger)
  tripsAsPassenger?: RoadTrip[];

  @OneToMany(() => RoadTrip, (trip) => trip.driver)
  tripsAsDriver?: RoadTrip[];

  @OneToMany(() => Rating, (rating) => rating.passenger)
  ratingsGiven?: Rating[];

  @OneToMany(() => Rating, (rating) => rating.driver)
  ratingsReceived?: Rating[];

  @OneToMany(() => Settlement, (settlement) => settlement.user)
  settlements?: Settlement[];

  @OneToMany(() => ActivityLog, (log) => log.user)
  activityLogs?: ActivityLog[];
}
