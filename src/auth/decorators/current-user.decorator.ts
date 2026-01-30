// src/auth/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Current User Decorator
 * Extracts user from request object (attached by AuthGuard)
 * 
 * Usage:
 * @Get('me')
 * @UseGuards(AuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * @Get('email')
 * @UseGuards(AuthGuard)
 * async getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // If no specific field requested, return entire user
        if (!data) {
            return user;
        }

        // If specific field requested (like 'id'), return ONLY that field
        return user?.[data];
    },
);