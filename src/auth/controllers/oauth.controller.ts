// src/auth/controllers/oauth.controller.ts

import {
    Controller,
    Get,
    Query,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleOAuthService } from '../services/oauth/google-oauth.service';
import { Public } from '../decorators/public.decorator';
import { CookieConfig } from '@config/cookie.config';
import { UserRole } from '@prisma/client';
import { sanitizeIpAddress } from '../utils/auth.utils';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppLogger } from '@core/logger/logger.service';

/**
 * OAuth Controller
 * Handles OAuth authentication flows (Google) for R-Admin and Pentester
 */
@Controller('auth')
export class OAuthController {
    constructor(
        private readonly googleOAuthService: GoogleOAuthService,
        private readonly logger: AppLogger,
    ) { }

    // ============================================
    // GOOGLE OAUTH
    // ============================================

    /**
     * Initiate Google OAuth flow
     * GET /auth/google?role=R_ADMIN
     * 
     * Response: { data: { url: "https://accounts.google.com/...", provider: "GOOGLE" } }
     */
    @Public()
    @Get('google')
    @HttpCode(HttpStatus.OK)
    async googleAuth(@Query('role') roleParam?: string) {
        try {
            // Parse role (must be R_ADMIN or PENTESTER)
            const role = this.parseRole(roleParam);

            // Generate authorization URL
            const { url } = await this.googleOAuthService.getAuthorizationUrl(role);

            this.logger.log(`Google OAuth URL generated for role: ${role}`, 'OAuthController');

            // Return JSON - frontend will open this URL in popup
            return {
                data: {
                    url,
                    provider: 'GOOGLE',
                },
                message: 'Google OAuth URL generated successfully',
            };
        } catch (error) {
            this.logger.error('Failed to generate Google OAuth URL', error.stack, 'OAuthController');

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException({
                code: ErrorCodes.OAUTH_INIT_FAILED,
                message: 'Failed to initialize Google OAuth. Please try again.',
            });
        }
    }

    /**
     * Google OAuth callback
     * GET /auth/google/callback?code=xxx&state=xxx
     */
    @Public()
    @Get('google/callback')
    async googleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // Validate parameters
        if (!code || !state) {
            this.logger.warn('Google OAuth callback: Missing code or state', 'OAuthController');
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            return res.redirect(`${appUrl}/login?error=oauth_params_missing`);
        }

        try {
            const ipAddress = sanitizeIpAddress(req.ip || req.socket.remoteAddress);

            // Handle OAuth callback
            const result = await this.googleOAuthService.handleCallback(
                code,
                state,
                ipAddress,
            );

            // Set session cookie
            res.cookie(
                CookieConfig.COOKIE_NAMES.SESSION,
                result.sessionToken,
                CookieConfig.getSessionCookieOptions(false),
            );

            this.logger.log(
                `Google OAuth successful for user: ${result.user.email}`,
                'OAuthController'
            );

            // Redirect to frontend callback page
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            return res.redirect(`${appUrl}/auth/callback`);
        } catch (error) {
            this.logger.error(
                `Google OAuth callback failed: ${error.message}`,
                error.stack,
                'OAuthController'
            );

            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            const errorCode = error.code || ErrorCodes.GOOGLE_AUTH_FAILED;
            return res.redirect(`${appUrl}/login?error=${errorCode}`);
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Parse and validate role parameter
     */
    private parseRole(roleParam?: string): UserRole {
        if (!roleParam) {
            throw new BadRequestException({
                code: 'OAUTH_ROLE_REQUIRED',
                message: 'Role parameter is required (R_ADMIN or PENTESTER)',
            });
        }

        const upperRole = roleParam.toUpperCase();

        // Only R_ADMIN and PENTESTER can use OAuth
        if (upperRole === 'R_ADMIN') {
            return UserRole.R_ADMIN;
        }

        if (upperRole === 'PENTESTER') {
            return UserRole.PENTESTER;
        }

        throw new BadRequestException({
            code: ErrorCodes.OAUTH_INVALID_ROLE,
            message: 'Invalid role. OAuth is only available for R_ADMIN and PENTESTER roles.',
        });
    }
}