import { Transform } from "class-transformer";
import {  Gender, UserRole } from "../entities/user.entity";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class updateUserAdminDTO {

  @ApiPropertyOptional({description: 'Full name of the user. Automatically transformed to uppercase.',example: 'JUAN PÉREZ'})
  @IsOptional()
  @IsString()
  @Length(5, 100, { message: 'Name must be between 5 and 100 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  name?: string;

  @ApiPropertyOptional({description: 'Gender of the user', enum: Gender, example: Gender.FEMALE})
  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Email address of the user', example: 'user@example.com'})
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({description: 'Phone number of the user (10 digits only)',example: '3104567890'})
  @IsOptional()
  @Matches(/^\d{10}$/, { message: "Phone number must have exactly 10 digits" })
  phone?: string;

  @ApiPropertyOptional({description: 'New password (6 to 10 characters)',example: 'secret12'})
  @IsOptional()
  @Length(6, 10, { message: 'Password must be between 6 and 10 characters' })
  password?: string;

  @ApiPropertyOptional({ description: 'User role within the system', enum: UserRole, example: UserRole.ADMIN})
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be admin, owner, driver or passenger'})
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Indicates if the user is active', example: true})
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean value' })
  active?: boolean;
}
