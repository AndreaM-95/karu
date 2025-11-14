import { PartialType, OmitType } from '@nestjs/mapped-types';

export class UpdateVehicleDTO extends PartialType(
  OmitType(CreateVehicleDTO, ['ownerId', 'plate'] as const),
) {
  @ApiProperty({ enum: VehicleStatus, required: false })
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'Estado de vehículo inválido' })
  statusVehicle?: VehicleStatus;
}
