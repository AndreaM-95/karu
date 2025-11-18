import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, Gender } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

/**
 * Service responsible for handling authentication operations
 * including user registration, login, password management, and profile retrieval
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new passenger user
   * Only female users are allowed to register as passengers
   * 
   * @param dto - Registration data including email, password, phone, and gender
   * @returns Login response with access token and user information
   * @throws BadRequestException if user is not female
   * @throws ConflictException if email or phone already exists
   */
  async register(dto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    // Validate gender requirement
    if (dto.gender !== Gender.FEMALE) {
      this.logger.warn(`Registration rejected: Non-female user attempted to register (${dto.email})`);
      throw new BadRequestException('Only female users are allowed to register.');
    }

    // Check if email already exists
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      this.logger.warn(`Registration failed: Email already registered (${dto.email})`);
      throw new ConflictException('The email is already registered.');
    }

    // Check if phone already exists
    const existsPhone = await this.usersRepo.findOne({ 
      where: { phone: dto.phone } 
    });

    if (existsPhone) {
      this.logger.warn(`Registration failed: Phone already registered (${dto.phone})`);
      throw new ConflictException('The phone number is already registered.');
    }

    // Create new user
    const user = this.usersRepo.create({
      ...dto,
      role: UserRole.PASSENGER,
      active: true,
    });

    // Hash password
    user.password = await bcrypt.hash(dto.password, 10);

    await this.usersRepo.save(user);

    this.logger.log(`User registered successfully: ${user.email} (ID: ${user.idUser})`);

    return this.login(user);
  }





}
