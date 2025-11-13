import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Trip } from '../../trips/entities/trip.entity';
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  idUser: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.FEMALE})
  gender: Gender;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ unique: true })
  @Length(10, 20)
  phone: number;

  @Column()
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PASSENGER })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.OFFLINE,
    nullable: true,
  })
  driverStatus: DriverStatus;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  vehicles: Vehicle[];

  @OneToMany(() => Trip, (trip) => trip.passenger)
  passengerTrips: Trip[];

  @OneToMany(() => Trip, (trip) => trip.driver)
  driverTrips: Trip[];

  @OneToMany(() => Rating, (rating) => rating.passenger)
  givenRatings: Rating[];

  @OneToMany(() => Rating, (rating) => rating.driver)
  receivedRatings: Rating[];
}
