import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

/**
 * Authentication Module
 * Handles user authentication, authorization, and JWT token management
 * 
 * Features:
 * - User registration and login
 * - JWT token generation and validation
 * - Password management
 * - Role-based access control
 * - Admin user creation
 * 
 * Dependencies:
 * - TypeORM for database operations
 * - Passport for authentication strategies
 * - JWT for token-based authentication
 */
@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({ isGlobal: true }),

    // Import User repository for database operations
    TypeOrmModule.forFeature([User]),

    // Configure Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configure JWT module asynchronously using environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // JWT secret key from environment variables
        secret: config.get<string>('JWT_SECRET_KEY'),
        // Token expiration time (default: 1 hour)
        signOptions: { expiresIn: config.get<number>('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  // Services provided by this module
  providers: [AuthService, JwtStrategy],
  // Controllers exposed by this module
  controllers: [AuthController],
})
export class AuthModule {}
