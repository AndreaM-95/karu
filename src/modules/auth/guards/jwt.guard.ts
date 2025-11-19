import { 
  Injectable, 
  UnauthorizedException, 
  ExecutionContext,
  Logger 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Validates JWT tokens in the Authorization header
 * Extends Passport's JWT strategy authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  /**
   * Validates if the request can be activated
   * Checks for valid JWT token in Authorization header
   * 
   * @param context - Execution context containing request information
   * @returns Boolean indicating if request can proceed
   */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      this.logger.warn('Authentication attempt without Authorization header');
    } else {
      this.logger.log(`JWT authentication attempt for endpoint: ${request.method} ${request.url}`);
    }
    
    return super.canActivate(context);
  }

  /**
   * Handles the authentication result
   * Processes the validated user or throws appropriate errors
   * 
   * @param err - Error from passport strategy if any
   * @param user - Validated user object from JWT payload
   * @param info - Additional information from passport strategy
   * @returns Validated user object
   * @throws UnauthorizedException if token is invalid or missing
   */
  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.warn(`JWT authentication failed: ${info?.message || 'Invalid or missing token'}`);
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }

    this.logger.log(`JWT authentication successful for user ID: ${user.idUser}`);
    return user;
  }
}