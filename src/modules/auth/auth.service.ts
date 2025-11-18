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

  /**
   * Creates a new user (driver or owner) by an administrator
   * Only administrators can create new users through this endpoint
   * 
   * @param dto - User creation data including role and credentials
   * @param adminUser - The authenticated admin user making the request
   * @returns Login response with access token and user information
   * @throws ForbiddenException if requester is not an admin
   * @throws BadRequestException if user is not female
   * @throws ConflictException if email or driver license already exists
   */
  async adminCreate(dto: AdminCreateUserDto, adminUser: User) {
    this.logger.log(`Admin user creation attempt by: ${adminUser.email} for role: ${dto.role}`);

    // Verify admin role
    if (adminUser.role !== UserRole.ADMIN) {
      this.logger.warn(`Unauthorized admin creation attempt by user: ${adminUser.email}`);
      throw new ForbiddenException('Only the administrator can create users.');
    }

    // Validate gender requirement
    if (dto.gender !== Gender.FEMALE) {
      this.logger.warn(`Admin creation rejected: Non-female user attempted (${dto.email})`);
      throw new BadRequestException('Only female owners or drivers are allowed to register.');
    }

    // Check if email already exists
    const emailExists = await this.usersRepo.findOne({ 
      where: { email: dto.email } 
    });

    if (emailExists) {
      this.logger.warn(`Admin creation failed: Email already exists (${dto.email})`);
      throw new ConflictException('The email is already registered.');
    }

    // Check driver license for driver role
    if (dto.role === UserRole.DRIVER) {
      const licenseExists = await this.usersRepo.findOne({ 
        where: { driverLicense: dto.driverLicense } 
      });

      if (licenseExists) {
        this.logger.warn(`Admin creation failed: Driver license already exists (${dto.driverLicense})`);
        throw new ConflictException('The driver license number is already registered.');
      }
    }

    // Create new user with appropriate fields based on role
    const user = this.usersRepo.create({
      ...dto,
      driverLicense: dto.role === UserRole.DRIVER ? dto.driverLicense : null,
      licenseCategory: dto.role === UserRole.DRIVER ? dto.licenseCategory : null,
      licenseExpirationDate: dto.role === UserRole.DRIVER ? dto.licenseExpirationDate : null,
    });

    // Hash password
    user.password = await bcrypt.hash(dto.password, 10);

    await this.usersRepo.save(user);

    this.logger.log(`User created by admin successfully: ${user.email} (ID: ${user.idUser}, Role: ${user.role})`);

    return this.login(user);
  }





}
