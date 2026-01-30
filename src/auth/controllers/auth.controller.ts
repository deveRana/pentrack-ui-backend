// src/auth/controllers/auth.controller.ts

import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '@common/services/token.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import type { User } from '@prisma/client';
import { CookieConfig } from '@config/cookie.config';
import { sanitizeIpAddress, sanitizeUserAgent } from '../utils/auth.utils';

/**
 * Auth Controller
 * Handles common auth endpoints (logout, get current user, etc.)
 */
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokenService,
    ) { }

    // ============================================
    // GET CURRENT USER
    // ============================================

    /**
     * Get current authenticated user
     * GET /auth/me
     */
    @Get('me')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCurrentUser(@CurrentUser() user: User) {
        return await this.authService.getCurrentUser(user.id);
    }

    // ============================================
    // GET WEBSOCKET TOKEN
    // ============================================

    /**
     * Get JWT token for WebSocket authentication
     * GET /auth/ws-token
     */
    @Get('ws-token')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getWebSocketToken(@CurrentUser() user: User) {
        // Generate JWT token for WebSocket authentication
        const wsToken = this.tokenService.createJwtToken(
            user.id,
            user.email,
            user.role,
        );

        return {
            token: wsToken,
            expiresIn: '7d',
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
    }

    // ============================================
    // LOGOUT
    // ============================================

    /**
     * Logout user from current device
     * POST /auth/logout
     */
    @Post('logout')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Get session token from cookie
        const sessionToken = req.cookies[CookieConfig.COOKIE_NAMES.SESSION];

        if (sessionToken) {
            // Delete session from database
            await this.authService.logout(sessionToken);
        }

        // Clear cookie
        res.clearCookie(
            CookieConfig.COOKIE_NAMES.SESSION,
            CookieConfig.getClearCookieOptions(),
        );

        return {
            message: 'Logout successful',
        };
    }

    // ============================================
    // LOGOUT FROM ALL DEVICES
    // ============================================

    /**
     * Logout user from all devices
     * POST /auth/logout-all
     */
    @Post('logout-all')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async logoutFromAllDevices(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Delete all sessions for this user
        await this.authService.logoutFromAllDevices(user.id);

        // Clear cookie
        res.clearCookie(
            CookieConfig.COOKIE_NAMES.SESSION,
            CookieConfig.getClearCookieOptions(),
        );

        return {
            message: 'Logged out from all devices successfully',
        };
    }
}