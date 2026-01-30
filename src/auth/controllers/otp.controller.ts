// src/auth/controllers/otp.controller.ts

import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RequestOTPDto, VerifyOTPDto } from '../dto/login-otp.dto';
import { Public } from '../decorators/public.decorator';
import { CookieConfig } from '@config/cookie.config';
import { sanitizeIpAddress, sanitizeUserAgent } from '../utils/auth.utils';

/**
 * OTP Controller
 * Handles OTP-based authentication for Admin, Client, Partner
 */
@Controller('auth/otp')
export class OTPController {
    constructor(private readonly authService: AuthService) { }

    // ============================================
    // REQUEST OTP (Step 1)
    // ============================================

    /**
     * Request OTP to be sent to email
     * POST /auth/otp/request
     * 
     * Used by: Admin, Client, Partner
     */
    @Public()
    @Post('request')
    @HttpCode(HttpStatus.OK)
    async requestOTP(@Body() dto: RequestOTPDto) {
        return await this.authService.requestOTP(dto.email);
    }

    // ============================================
    // VERIFY OTP (Step 2)
    // ============================================

    /**
     * Verify OTP and login user
     * POST /auth/otp/verify
     * 
     * Used by: Admin, Client, Partner
     */
    @Public()
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyOTP(
        @Body() dto: VerifyOTPDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Sanitize IP address and user agent
        const ipAddress = sanitizeIpAddress(req.ip || req.socket.remoteAddress);
        const userAgent = sanitizeUserAgent(req.headers['user-agent']);

        // Verify OTP and login
        const result = await this.authService.verifyOTPAndLogin(
            dto.email,
            dto.code,
            ipAddress,
            userAgent,
        );

        // Set session token in HTTP-only cookie
        const cookieOptions = CookieConfig.getSessionCookieOptions(false);
        res.cookie(
            CookieConfig.COOKIE_NAMES.SESSION,
            result.sessionToken,
            cookieOptions,
        );

        // Return user data (no sessionToken in response body)
        return {
            data: result.user,
            message: 'Login successful',
        };
    }
}