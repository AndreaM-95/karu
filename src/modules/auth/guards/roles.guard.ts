import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Authorization Guard
 * Verifies if an authenticated user has the required roles to access a protected route
 * Works in combination with the @Roles() decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Validates if the user has the required roles to access the route
   * 
   * @param context - Execution context containing request and route metadata
   * @returns True if user has required roles, throws exception otherwise
   * @throws UnauthorizedException if user is not authenticated
   * @throws ForbiddenException if user lacks required roles
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verify user is authenticated
    if (!user) {
      this.logger.warn('Access denied: User not authenticated');
      throw new UnauthorizedException('User is not authenticated');
    }

    // Verify user has a role assigned
    if (!user.role) {
      this.logger.warn(`Access denied: User ${user.idUser} has no role assigned`);
      throw new ForbiddenException('User does not have a role assigned');
    }

    // Normalize roles to lowercase for case-insensitive comparison
    const normalizedRequiredRoles = requiredRoles.map((role) =>
      String(role).toLowerCase(),
    );
    const normalizedUserRole = String(user.role).toLowerCase();

    // Check if user's role is in the allowed roles
    const hasRole = normalizedRequiredRoles.includes(normalizedUserRole);

    if (!hasRole) {
      this.logger.warn(
        `Access denied: User ${user.email} (ID: ${user.idUser}) with role "${user.role}" ` +
        `attempted to access resource requiring roles: [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Your role (${user.role}) is not authorized to access this resource. ` +
        `Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    this.logger.log(
      `Access granted: User ${user.email} (ID: ${user.idUser}) with role "${user.role}" ` +
      `accessing endpoint: ${request.method} ${request.url}`,
    );

    return true;
  }
}