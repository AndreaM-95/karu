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


}