import {
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../decorators/match.decorator';

/**
 * Data Transfer Object for password change requests
 * Requires current password for security verification
 * Enforces strong password requirements for new password
 */
export class ChangePasswordDTO {
  @ApiProperty({
    description: 'Current password of the user for verification',
    example: 'OldPassword123!',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description:
      'New password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'NewPassword456@',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of new password (must match newPassword exactly)',
    example: 'NewPassword456@',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}