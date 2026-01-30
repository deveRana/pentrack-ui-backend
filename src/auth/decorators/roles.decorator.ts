// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Roles Decorator
 * Restricts access to specific user roles
 * 
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * async adminOnlyEndpoint() {
 *   return { message: 'Admin only' };
 * }
 * 
 * @Roles(UserRole.R_ADMIN, UserRole.PENTESTER)
 * @Get('internal-only')
 * async internalEndpoint() {
 *   return { message: 'R-Admin or Pentester only' };
 * }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);