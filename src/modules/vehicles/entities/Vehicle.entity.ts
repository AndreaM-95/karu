import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum VehicleType {
  CARRO = 'carro',
  MOTO = 'moto',
}

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  idVehicle: number;

  @ManyToOne(() => User, (user) => user.vehicles, { onDelete: 'CASCADE' })
  @IsNotEmpty()
  owner: User;

  @Column()
  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  cardProperty: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  plate: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  brand: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  model: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Column({ type: 'enum', enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @Column({ default: 4 })
  @IsInt()
  @Min(1)
  @Max(10)
  capacity: number;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  @IsEnum(VehicleStatus)
  statusVehicle: VehicleStatus;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];
}
