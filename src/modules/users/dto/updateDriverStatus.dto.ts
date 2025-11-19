import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { DriverStatus } from "src/modules/users/entities/user.entity";

export class updateDriverStatusDTO {

  @ApiProperty({description: 'New status for the driver', example: DriverStatus.AVAILABLE, enum: DriverStatus, enumName: 'DriverStatus'})
  @IsNotEmpty({ message: 'Driver status is required' })
  @IsEnum(DriverStatus, { message: 'Invalid driver status value' })
  driverStatus: DriverStatus;
}
