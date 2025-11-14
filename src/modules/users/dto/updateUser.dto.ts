import { PartialType } from "@nestjs/swagger";
import { createUserDTO } from "./createUser.dto";
import { DriverStatus } from "../entities/User.entity";
import { IsAlpha, IsEmpty, IsEnum, IsOptional } from "class-validator";

export class updateUserDTO extends PartialType (createUserDTO){

    @IsOptional()
    @IsEnum(DriverStatus, { message: 'Driver status must be available, busy or offline' })
    driverStatus?: DriverStatus
}