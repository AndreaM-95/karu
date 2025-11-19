import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum VehicleType {
  CARRO = 'carro',
  MOTO = 'moto',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  idVehicle: number;

  @Column({ unique: true })
  plate: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model?: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    nullable: true,
  })
  vehicleType?: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  statusVehicle: VehicleStatus;

  @ManyToOne(() => User, user => user.ownedVehicles, { nullable: false })
  owner: User;

  @ManyToMany(() => User, user => user.drivingVehicles)
  @JoinTable({
    name: 'vehicle_drivers',
    joinColumn: { name: 'vehicle_id', referencedColumnName: 'idVehicle' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'idUser' },
  })
  drivers: User[];

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
