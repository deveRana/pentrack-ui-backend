// src/auth/guards/auth.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CookieConfig } from '@config/cookie.config';

/**
 * Auth Guard
 * Validates session token from cookie and attaches user to request
 */
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Get request object
        const request = context.switchToHttp().getRequest<Request>();

        // Extract session token from cookie
        const sessionToken = request.cookies[CookieConfig.COOKIE_NAMES.SESSION];

        if (!sessionToken) {
            throw new UnauthorizedException('No session token found. Please login.');
        }

        try {
            // Validate session and get user
            const user = await this.authService.validateSession(sessionToken);

            // Attach user to request object
            request['user'] = user;

            return true;
        } catch (error) {
            throw new UnauthorizedException(
                error.message || 'Invalid or expired session. Please login again.',
            );
        }
    }
}