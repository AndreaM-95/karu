import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class updateUserSelfDTO {

  @ApiPropertyOptional({ description: 'User name', example: 'VALERIA GONZALEZ', minLength: 5, maxLength: 100, type: String})
  @IsOptional()
  @IsString()
  @Length(5, 100, { message: 'Name must be between 5 and 100 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  name?: string;

  @ApiPropertyOptional({description: 'Email of the user', example: 'example@mail.com', type: String})
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number (exactly 10 digits)', example: '3001234567', minLength: 10, maxLength: 10, type: String})
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: "Phone number must have exactly 10 digits" })
  phone?: string;

  @ApiPropertyOptional({description: 'New password', example: 'NewPass123', minLength: 6, maxLength: 20, type: String})
  @IsOptional()
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 10 characters' })
  password?: string;
  
}
