// src/auth/guards/roles.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Roles Guard
 * Enforces role-based access control
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Get required roles from decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Get user from request (attached by AuthGuard)
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not found in request');
        }

        // Check if user has required role
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}