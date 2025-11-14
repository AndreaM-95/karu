import { Exclude, Expose, Type } from 'class-transformer';

export class VehicleResponseDTO {
  @Expose()
  idVehicle: number;

  @Expose()
  licenseNumber: string;

  @Expose()
  cardProperty: string;

  @Expose()
  plate: string;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  color?: string;

  @Expose()
  vehicleType: string;

  @Expose()
  capacity: number;

  @Expose()
  statusVehicle: string;

  @Expose()
  @Type(() => OwnerResponseDto)
  owner: OwnerResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class OwnerResponseDto {
  @Expose()
  idUser: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;
}