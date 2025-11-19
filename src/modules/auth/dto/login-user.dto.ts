import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user login
 * Contains credentials required for authentication
 */
export class LoginUserDTO {
  @ApiProperty({
    description: 'User email address for authentication',
    example: 'maria@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: 'Password123!',
    type: 'string',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}