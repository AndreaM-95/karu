import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to store roles information in route handlers
 * Used by RolesGuard to retrieve required roles for authorization
 */
export const ROLES_KEY = 'roles';

/**
 * Custom decorator to assign required roles to a controller or route handler
 * Works in combination with RolesGuard to restrict access based on user roles
 * 
 * @param roles - List of roles allowed to access the resource
 * 
 * @example
 * ```typescript
 * // Single role
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin/users')
 * getAllUsers() {
 *   // Only admins can access this endpoint
 * }
 * 
 * // Multiple roles
 * @Roles(UserRole.ADMIN, UserRole.DRIVER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('trips')
 * getTrips() {
 *   // Admins and drivers can access this endpoint
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
