import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  Gender,
  LicenseCategory,
  UserRole,
} from 'src/modules/users/entities/user.entity';
import { Transform } from 'class-transformer';
import { IsAdult } from 'src/common/validators/is-adult.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for admin user creation
 * Used by administrators to create driver or owner accounts
 * Contains validation rules for all required and optional fields
 */
export class AdminCreateUserDto {
  @ApiProperty({
    description: 'Full name of the user (will be converted to uppercase)',
    example: 'MARIA GARCIA',
    minLength: 5,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Length(5, 100, { message: 'Name must be between 5 and 100 characters' })
  @Transform(({ value }) => value.trim().toUpperCase())
  name: string;

  @ApiProperty({
    description: 'Gender of the user (only female allowed for drivers and owners)',
    example: 'female',
    enum: Gender,
    enumName: 'Gender',
  })
  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
  gender: Gender;

  @ApiProperty({
    description: 'Unique email address for user authentication',
    example: 'maria.garcia@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Phone number (exactly 10 digits)',
    example: '3001234567',
    minLength: 10,
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @Length(10, 10, { message: 'Phone number must have exactly 10 digits' })
  phone: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (user must be 18 years or older)',
    example: '1990-05-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsString()
  @IsAdult({ message: 'User must be at least 18 years old' })
  dateOfBirth: string;

  @ApiProperty({
    description:
      'Password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'SecurePass123!',
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

  @ApiProperty({
    description: 'Role to assign to the user (driver or owner)',
    example: 'driver',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Role must be admin, owner, driver or passenger' })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Driver license number (required only for drivers)',
    example: 12345678,
    type: 'integer',
  })
  @ValidateIf((us) => us.role === UserRole.DRIVER)
  @IsNotEmpty({ message: 'Driver license is required for drivers' })
  @IsInt({ message: 'Driver license must be a number' })
  driverLicense?: number;

  @ApiPropertyOptional({
    description: 'License category (required only for drivers)',
    example: 'b2',
    enum: LicenseCategory,
    enumName: 'LicenseCategory',
  })
  @ValidateIf((us) => us.role === UserRole.DRIVER)
  @IsNotEmpty({ message: 'License category is required for drivers' })
  @IsEnum(LicenseCategory, {
    message: 'License category must be a1, a2, b1, b2, or b3',
  })
  licenseCategory?: LicenseCategory;

  @ApiPropertyOptional({
    description: 'License expiration date in ISO 8601 format (required only for drivers)',
    example: '2026-12-31',
    format: 'date',
  })
  @ValidateIf((us) => us.role === UserRole.DRIVER)
  @IsNotEmpty({ message: 'License expiration date is required for drivers' })
  @IsString()
  licenseExpirationDate?: string;
}
 