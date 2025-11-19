import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * JWT Authentication Strategy
 * Validates JWT tokens and retrieves user information
 * Implements Passport JWT strategy for token-based authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    const secret = configService.get<string>('JWT_SECRET_KEY');

    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log('JWT Strategy initialized successfully');
  }

  /**
   * Validates the JWT payload and retrieves user information
   * Called automatically by Passport after token signature verification
   * 
   * @param payload - Decoded JWT payload containing user information
   * @returns User object with essential fields for the request context
   * @throws UnauthorizedException if user not found or inactive
   */
  async validate(payload: any) {
    this.logger.log(`Validating JWT token for user ID: ${payload.sub}`);

    const user = await this.userRepo.findOne({
      where: { idUser: payload.sub },
      select: ['idUser', 'name', 'email', 'role', 'phone', 'gender', 'active', 'driverStatus'],
    });

    if (!user) {
      this.logger.warn(`JWT validation failed: User not found (ID: ${payload.sub})`);
      throw new UnauthorizedException('User not found');
    }

    if (!user.active) {
      this.logger.warn(`JWT validation failed: Inactive user (ID: ${user.idUser}, Email: ${user.email})`);
      throw new UnauthorizedException('User is inactive');
    }

    this.logger.log(`JWT validation successful for user: ${user.email} (ID: ${user.idUser})`);

    return {
      idUser: user.idUser,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      driverStatus: user.driverStatus,
    };
  }
}