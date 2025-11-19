import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Length,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from 'src/modules/users/entities/user.entity';
import { IsAdult } from 'src/common/validators/is-adult.decorator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for passenger user registration
 * Only female users can register as passengers through this endpoint
 * Enforces strong password and age requirements
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user (will be converted to uppercase)',
    example: 'CAMILA RAMIREZ',
    minLength: 5,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Length(5, 100, { message: 'Name must be between 5 and 100 characters' })
  @Transform(({ value }) => value.trim().toUpperCase())
  name: string;

  @ApiProperty({
    description: 'Gender of the user (only female allowed for passenger registration)',
    example: 'female',
    enum: Gender,
    enumName: 'Gender',
  })
  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
  gender: Gender;

  @ApiProperty({
    description: 'Unique email address for user authentication',
    example: 'camila@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Phone number (exactly 10 digits)',
    example: '3123456789',
    minLength: 10,
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @Length(10, 10, { message: 'Phone number must have exactly 10 digits' })
  phone: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (user must be 18 years or older)',
    example: '1990-05-20',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsString()
  @IsAdult({ message: 'User must be at least 18 years old' })
  dateOfBirth: string;

  @ApiProperty({
    description:
      'Password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'Password123!',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

