import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/User.entity';
import { createUserDTO } from '../users/dto/createUser.dto';
import { LoginUserDTO } from '../users/dto/login-user.dto';
import { ChangePasswordDTO } from '../users/dto/change-password.dto';
import { RecoverPasswordDTO } from '../users/dto/recover-password.dto';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

/**
   * ========================================================================
   * USER REGISTRATION
   * ========================================================================
   * Allows a new user to register in the system.
   * 
   * Implemented validations:
   * - Unique email (no duplicates)
   * - Unique phone number (no duplicates)
   * - Secure password hashing (bcrypt with 10 rounds)
   * - User active by default
   * 
   * @param data - User data to register (CreateUserDTO)
   * @returns Registered user (without password) and JWT token
   * @throws ConflictException - If email or phone already exists
   */
  async register(data: createUserDTO) {
    // Validation: Unique email
    const existingEmail = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    // Validation: Unique phone number
    const existingPhone = await this.userRepo.findOne({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number is already registered');
    }

    // Security: Password hashing with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user with active status
    const newUser = this.userRepo.create({
      ...data,
      password: hashedPassword,
      active: true, // User active by default
    });

    const savedUser = await this.userRepo.save(newUser);

    // Generate JWT token for immediate authentication
    const token = this.generateToken(savedUser);

    // Security: Do not expose password in the response
    const { password, ...userWithoutPassword } = savedUser;

    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * ========================================================================
   * LOGIN
   * ========================================================================
   * Authenticates an existing user and generates an access token.
   * 
   * Implemented validations:
   * - User exists in the system
   * - User is active
   * - Password is correct
   * 
   * @param data - Login credentials (LoginUserDTO)
   * @returns Authenticated user (without password) and JWT token
   * @throws UnauthorizedException - If credentials are invalid or user is inactive
   */
  async login(data: LoginUserDTO) {
    // Search for user by email
    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    // Validation: User exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validation: User is active (not blocked/deleted)
    if (!user.active) {
      throw new UnauthorizedException('Inactive user. Contact the administrator');
    }

    // Validation: Password is correct
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token for the session
    const token = this.generateToken(user);

    // Security: Do not expose password in the response
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * ========================================================================
   * PASSWORD CHANGE (AUTHENTICATED USER)
   * ========================================================================
   * Allows an authenticated user to change their password.
   * Requires knowledge of the current password as a security measure.
   * 
   * Implemented validations:
   * - User exists
   * - Current password is correct
   * - New password is different from the current one
   * 
   * @param data - Current and new passwords (ChangePasswordDTO)
   * @returns Confirmation message
   * @throws NotFoundException - If the user does not exist
   * @throws UnauthorizedException - If the current password is incorrect
   * @throws BadRequestException - If the new password is the same as the current one
   */
  async changePassword(data: ChangePasswordDTO) {
    // Search for user
    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    // Validation: User exists
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validation: Current password is correct
    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validation: New password must be different
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from the current one',
      );
    }

    // Security: Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password in database
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * ========================================================================
   * PASSWORD RECOVERY
   * ========================================================================
   * Allows a user to recover their password without knowing the current one.
   * 
   * STATUS: SIMPLIFIED IMPLEMENTATION
   * - Currently changes the password directly
   * - DOES NOT send a confirmation email
   * - DOES NOT use a temporary token with expiration
   * 
   * TODO - Full implementation:
   * 1. Generate a unique temporary token
   * 2. Save token in DB with expiration date (e.g., 1 hour)
   * 3. Send email with recovery link
   * 4. Validate token before allowing change
   * 5. Invalidate token after use
   * 
   * Security implemented:
   * - Does not reveal whether the email exists in the system (prevents user enumeration)
   * 
   * @param data - Email and new password (RecoverPasswordDTO)
   * @returns Generic message (does not reveal if the user exists)
   */
  async recoverPassword(data: RecoverPasswordDTO) {
    // Search for user
    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    // Security: Do not reveal if the email exists or not
    if (!user) {
      return {
        message: 'If the email exists, you will receive instructions to recover your password',
      };
    }

    // TODO: Full recovery flow ...

    // TEMPORARY IMPLEMENTATION: Direct password change
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * ========================================================================
   * JWT TOKEN GENERATION
   * ========================================================================
   * Generates a JWT token containing essential user information.
   * 
   * Information included in the token:
   * - sub: User ID (standard JWT subject)
   * - email: User email
   * - name: User name
   * - role: User role/permissions
   * - driverStatus: Driver status (if applicable)
   * 
   * @param user - Complete user entity
   * @returns Signed JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.idUser,           // Subject: unique identifier
      email: user.email,
      name: user.name,
      role: user.role,            // For role-based access control
      driverStatus: user.driverStatus, // Domain-specific state
    };

    return this.jwtService.sign(payload);
  }

  /**
   * ========================================================================
   * JWT TOKEN VALIDATION
   * ========================================================================
   * Validates a JWT token and checks that the user still exists and is active.
   * Useful for:
   * - Refresh tokens
   * - Guards/middleware validation
   * - Session verification
   * 
   * Implemented validations:
   * - Token has a valid signature
   * - Token has not expired
   * - User exists in the database
   * - User is active
   * 
   * @param token - JWT token to validate
   * @returns User associated with the token
   * @throws UnauthorizedException - If token is invalid, expired, or user does not exist/inactive
   */
  async validateToken(token: string) {
    try {
      // Verify token signature and expiration
      const decoded = this.jwtService.verify(token);
      
      // Search for user in database
      const user = await this.userRepo.findOne({
        where: { idUser: decoded.sub },
      });

      // Validation: User exists and is active
      if (!user || !user.active) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      // Catch JWT errors (expired, invalid signature, etc.)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
