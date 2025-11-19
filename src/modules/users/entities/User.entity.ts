import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Rating } from '../../ratings/entities/rating.entity';

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum LicenseCategory {
  A1 = 'a1',
  A2 = 'a2',
  B1 = 'b1',
  B2 = 'b2',
  B3 = 'b3',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  idUser: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.FEMALE })
  gender: Gender;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date|null;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PASSENGER })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    nullable: true,
    default: null,
  })
  driverStatus: DriverStatus | null;

  @Column({ type: 'int', nullable: true })
  driverLicense: number | null;

  @Column({
    type: 'enum',
    enum: LicenseCategory ,
    nullable: true,
  })
  licenseCategory: LicenseCategory  | null;

  @Column({ type: 'date', nullable: true })
  licenseExpirationDate: Date | null;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  vehicles: Vehicle[];

  @OneToMany(() => Trip, (trip) => trip.passenger)
  passengerTrips: Trip[];

  @OneToMany(() => Trip, (trip) => trip.driver)
  driverTrips: Trip[];

  @OneToMany(() => Rating, (rating) => rating.author)
  ratingsGiven: Rating[];

  @OneToMany(() => Rating, (rating) => rating.target)
  ratingsReceived: Rating[];

  @OneToMany(() => Vehicle, vehicle => vehicle.owner)
  ownedVehicles: Vehicle[];

  @ManyToMany(() => Vehicle, vehicle => vehicle.drivers)
  drivingVehicles: Vehicle[];
}
