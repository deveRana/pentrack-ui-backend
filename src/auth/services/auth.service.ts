// src/auth/services/auth.service.ts

import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { OTPService } from './otp.service';
import { SessionService } from './session.service';
import { PrismaService } from '@core/database/prisma.service';
import { User, AccountStatus, UserRole, OTPType } from '@prisma/client';
import { AppLogger } from '@core/logger/logger.service';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { formatUserResponse } from '../utils/auth.utils';

/**
 * Auth Service
 * Main authentication service for PenTrack
 * 
 * Supports:
 * - OTP-based login (Admin, Client, Partner)
 * - OAuth login (R-Admin, Pentester via Google)
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly otpService: OTPService,
        private readonly sessionService: SessionService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly logger: AppLogger,
    ) { }

    // ============================================
    // OTP LOGIN FLOW
    // ============================================

    /**
     * Step 1: Request OTP (send OTP to email)
     * Used by: Admin, Client, Partner
     */
    async requestOTP(email: string): Promise<{ message: string; expiresIn: number }> {
        // Find user by email
        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'No account found with this email address.',
            });
        }

        // Check if user role is allowed to use OTP login
        if (user.role === UserRole.R_ADMIN || user.role === UserRole.PENTESTER) {
            throw new BadRequestException({
                code: 'OTP_NOT_ALLOWED_FOR_ROLE',
                message: 'R-Admin and Pentester must use Google OAuth to login.',
            });
        }

        // Check account status
        if (user.status === AccountStatus.SUSPENDED) {
            throw new UnauthorizedException(ErrorCodes.ACCOUNT_SUSPENDED);
        }

        if (user.status === AccountStatus.DELETED) {
            throw new UnauthorizedException(ErrorCodes.ACCOUNT_DELETED);
        }

        // Send OTP
        await this.otpService.sendOTP(email, OTPType.LOGIN);

        this.logger.log(`OTP requested for ${email}`, 'AuthService');

        return {
            message: 'OTP sent to your email. It will expire in 10 minutes.',
            expiresIn: 600, // 10 minutes in seconds
        };
    }

    /**
     * Step 2: Verify OTP and login
     * Used by: Admin, Client, Partner
     */
    async verifyOTPAndLogin(
        email: string,
        code: string,
        ipAddress: string,
        userAgent: string,
    ): Promise<{
        user: any;
        sessionToken: string;
    }> {
        // Verify OTP
        const userId = await this.otpService.verifyOTP(email, code, OTPType.LOGIN);

        if (!userId) {
            throw new UnauthorizedException({
                code: ErrorCodes.OTP_INVALID,
                message: 'Invalid OTP code.',
            });
        }

        // Get user
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException(ErrorCodes.USER_NOT_FOUND);
        }

        // Check account status
        if (user.status !== AccountStatus.ACTIVE) {
            throw new UnauthorizedException(ErrorCodes.ACCOUNT_SUSPENDED);
        }

        // Update last login
        await this.authRepository.updateLastLogin(user.id, ipAddress);

        // Create session
        const sessionToken = await this.sessionService.createSession(
            user.id,
            false, // No "remember me" for OTP login
            userAgent,
            ipAddress,
        );

        this.logger.log(`User logged in via OTP: ${user.email}`, 'AuthService');

        return {
            user: formatUserResponse(user),
            sessionToken,
        };
    }

    // ============================================
    // SESSION VALIDATION
    // ============================================

    /**
     * Validate session token and return user
     */
    async validateSession(sessionToken: string): Promise<User> {
        const session = await this.authRepository.findSessionByToken(sessionToken);

        if (!session) {
            throw new UnauthorizedException(ErrorCodes.SESSION_INVALID);
        }

        // Check if session is expired
        if (new Date() > session.expiresAt) {
            await this.authRepository.deleteSession(sessionToken);
            throw new UnauthorizedException(ErrorCodes.SESSION_EXPIRED);
        }

        // Check if user account is active
        if (session.user.status !== AccountStatus.ACTIVE) {
            throw new UnauthorizedException(ErrorCodes.ACCOUNT_SUSPENDED);
        }

        // Update last activity (rolling session)
        await this.authRepository.updateSessionActivity(session.id);

        return session.user;
    }

    // ============================================
    // GET CURRENT USER
    // ============================================

    /**
     * Get current authenticated user with relations
     */
    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                clientProfile: true,
                partnerProfile: true,
                pentesterProfile: true,
            },
        });

        if (!user) {
            throw new NotFoundException(ErrorCodes.USER_NOT_FOUND);
        }

        return formatUserResponse(user);
    }

    // ============================================
    // LOGOUT
    // ============================================

    /**
     * Logout user and delete session
     */
    async logout(sessionToken: string) {
        await this.authRepository.deleteSession(sessionToken);

        return {
            message: 'Logout successful',
        };
    }

    /**
     * Logout from all devices
     */
    async logoutFromAllDevices(userId: string) {
        await this.authRepository.deleteAllUserSessions(userId);

        return {
            message: 'Logged out from all devices successfully',
        };
    }
}