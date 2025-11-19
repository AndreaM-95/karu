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

  /**
   * Generates JWT token and returns authentication response
   * 
   * @param user - User entity to generate token for
   * @returns Object containing access token and user information
   */
  async login(user: User) {
    this.logger.log(`Generating token for user: ${user.email} (ID: ${user.idUser})`);

    const payload:any = {
      sub: user.idUser,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    if (user.role === UserRole.DRIVER) {
      payload.driverStatus = user.driverStatus;
    }

    const token = this.jwtService.sign(payload);

    this.logger.log(`Token generated successfully for user: ${user.email}`);

    const userResponse: any = {
      idUser: user.idUser,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    };

    if (user.role === UserRole.DRIVER) {
      userResponse.driverStatus = user.driverStatus;
    }

    return {
      access_token: token,
      user: userResponse,
    };
  }

  /**
   * Validates user credentials for local authentication strategy
   * 
   * @param email - User's email address
   * @param pass - User's plain text password
   * @returns User entity if credentials are valid, null otherwise
   */
  async validateUser(email: string, pass: string) {
    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.usersRepo.findOne({
      where: { email },
      select: ['idUser', 'email', 'password', 'role', 'active', 'name', 'driverStatus'],
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found (${email})`);
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      this.logger.warn(`Login failed: Invalid password for user (${email})`);
      return null;
    }

    this.logger.log(`User validated successfully: ${email} (ID: ${user.idUser})`);
    return user;
  }

  /**
   * Changes the password for an authenticated user
   * Validates current password before allowing the change
   * 
   * @param dto - Password change data including current and new password
   * @param user - Authenticated user requesting password change
   * @returns Success message
   * @throws NotFoundException if user not found
   * @throws UnauthorizedException if current password is incorrect
   * @throws BadRequestException if new password is same as current or user has no password
   */
  async changePassword(dto: ChangePasswordDTO, user: any) {
    this.logger.log(`Password change request for user ID: ${user.idUser}`);

    const foundUser = await this.usersRepo.findOne({
      where: { idUser: user.idUser },
      select: ['idUser', 'email', 'password'],
    });

    if (!foundUser) {
      this.logger.error(`Password change failed: User not found (ID: ${user.idUser})`);
      throw new NotFoundException('User not found');
    }

    if (!foundUser.password) {
      this.logger.error(`Password change failed: User has no password set (${foundUser.email})`);
      throw new BadRequestException('User has no password set');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(dto.currentPassword, foundUser.password);

    if (!isMatch) {
      this.logger.warn(`Password change failed: Incorrect current password (${foundUser.email})`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Ensure new password is different
    const isSamePassword = await bcrypt.compare(dto.newPassword, foundUser.password);

    if (isSamePassword) {
      this.logger.warn(`Password change failed: New password same as current (${foundUser.email})`);
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(dto.newPassword, 12);
    foundUser.password = newHash;
    await this.usersRepo.save(foundUser);

    this.logger.log(`Password changed successfully for user: ${foundUser.email}`);

    return {
      message: 'Password updated successfully',
      success: true,
    };
  }

  /**
   * Retrieves the profile information for a user
   * 
   * @param userId - ID of the user to retrieve profile for
   * @returns User profile data
   * @throws NotFoundException if user not found
   */
  async getProfile(userId: number) {
    this.logger.log(`Profile request for user ID: ${userId}`);

    const user = await this.usersRepo.findOne({
      where: { idUser: userId },
      select: {
        idUser: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        driverStatus: true,
      },
    });

    if (!user) {
      this.logger.warn(`Profile not found for user ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Profile retrieved successfully for user: ${user.email}`);
    return user;
  }



}
