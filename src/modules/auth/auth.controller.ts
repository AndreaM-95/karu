import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UserRole } from '../users/entities/user.entity';

/**
 * Authentication Controller
 * Handles all authentication-related endpoints including registration,
 * login, password management, and user profile retrieval
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
/**
   * Register a new passenger user
   * Creates a new passenger account with email, password and personal information
   * Only female users are allowed to register as passengers
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new passenger user',
    description: 'Creates a new passenger account. Only female users are allowed to register. ' +
                 'Email and phone must be unique.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Returns access token and user information.',
  })
  @ApiConflictResponse({
    description: 'Email or phone number already registered.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or non-female user attempting registration.',
  })
  register(@Body() dto: RegisterDto) {
    this.logger.log(`POST /auth/register - Registration attempt for email: ${dto.email}`);
    return this.authService.register(dto);
  }


}