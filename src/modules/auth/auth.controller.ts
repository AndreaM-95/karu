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

  /**
   * Admin creates a new driver or owner user
   * Restricted to administrators only
   * Allows creation of driver and owner accounts with specific privileges
   */
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Create driver or owner user (Admin only)',
    description: 'Allows administrators to create driver or owner accounts. ' +
                 'Only female users are allowed. Drivers require valid license information.',
  })
  @ApiBody({ type: AdminCreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully by admin. Returns access token and user information.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Only administrators can create users.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid role, data, or non-female user.',
  })
  @ApiConflictResponse({
    description: 'Email or driver license already registered.',
  })
  adminCreate(@Body() dto: AdminCreateUserDto, @Request() req) {
    this.logger.log(
      `POST /auth/admin/create - Admin ${req.user.email} creating user with role: ${dto.role}`,
    );
    return this.authService.adminCreate(dto, req.user);
  }

  /**
   * User login
   * Authenticates a user with email and password
   * Returns JWT token for subsequent authenticated requests
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user with email and password. Returns a JWT access token ' +
                 'that must be included in the Authorization header for protected endpoints.',
  })
  @ApiBody({ type: LoginUserDTO })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token and user information.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials (wrong email or password).',
  })
  @ApiBadRequestResponse({
    description: 'Missing or invalid email/password format.',
  })
  async login(@Body() dto: LoginUserDTO) {
    this.logger.log(`POST /auth/login - Login attempt for email: ${dto.email}`);

    const user = await this.authService.validateUser(dto.email, dto.password);

    if (!user) {
      this.logger.warn(`Login failed for email: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  /**
   * Change user password
   * Allows authenticated users to update their password
   * Requires current password for security verification
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change user password',
    description: 'Allows authenticated users to change their password. ' +
                 'Requires current password for verification. New password must be different from current.',
  })
  @ApiBody({ type: ChangePasswordDTO })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated, invalid token, or incorrect current password.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid password format, passwords do not match, or new password is same as current.',
  })
  async changePassword(@Body() dto: ChangePasswordDTO, @Request() req) {
    this.logger.log(`POST /auth/change-password - Password change request for user ID: ${req.user.idUser}`);
    return this.authService.changePassword(dto, req.user);
  }

  /**
   * Get current user profile
   * Retrieves profile information for the authenticated user
   * Includes personal details and role information
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile information of the authenticated user, ' +
                 'including name, email, phone, gender, role, and driver status (if applicable).',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid token.',
  })
  async getProfile(@Request() req) {
    this.logger.log(`GET /auth/me - Profile request for user ID: ${req.user.idUser}`);
    return this.authService.getProfile(req.user.idUser);
  }

}