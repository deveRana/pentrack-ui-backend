// src/auth/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * Marks a route as publicly accessible (no authentication required)
 * 
 * Usage:
 * @Public()
 * @Get('health')
 * async healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);