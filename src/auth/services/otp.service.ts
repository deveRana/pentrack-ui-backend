// src/auth/services/otp.service.ts

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@core/database/prisma.service';
import { MailService } from '@core/mail/mail.service';
import { HashService } from '@common/services/hash.service';
import { AppLogger } from '@core/logger/logger.service';
import { OTPType } from '@prisma/client';
import { ErrorCodes } from '@common/enums/error-codes.enum';

/**
 * OTP Service
 * Handles OTP generation, sending, and verification
 */
@Injectable()
export class OTPService {
    private readonly OTP_LENGTH = 6;
    private readonly OTP_EXPIRY_MINUTES = 10;
    private readonly MAX_ATTEMPTS = 3;
    private readonly RATE_LIMIT_WINDOW_MINUTES = 5;
    private readonly MAX_OTP_REQUESTS = 3;

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private readonly hashService: HashService,
        private readonly configService: ConfigService,
        private readonly logger: AppLogger,
    ) { }

    // ============================================
    // GENERATE OTP
    // ============================================

    /**
     * Generate a random 6-digit OTP code
     */
    private generateOTPCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ============================================
    // SEND OTP
    // ============================================

    /**
     * Send OTP to email
     * Creates OTP record and sends email
     */
    async sendOTP(email: string, type: OTPType): Promise<void> {
        // 1. Check rate limiting
        await this.checkRateLimit(email);

        // 2. Generate OTP code
        const code = this.generateOTPCode();
        const hashedCode = this.hashService.hashToken(code);

        // 3. Calculate expiry
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

        // 4. Get user if exists
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        // 5. Delete old OTP codes for this email
        await this.prisma.oTPCode.deleteMany({
            where: {
                email,
                type,
            },
        });

        // 6. Create OTP record
        await this.prisma.oTPCode.create({
            data: {
                email,
                code: hashedCode,
                type,
                expiresAt,
                userId: user?.id, // NULL if user doesn't exist yet
            },
        });

        // 7. Send OTP via email
        try {
            await this.mailService.sendOTPEmail(email, code);
            this.logger.log(`OTP sent to ${email}`, 'OTPService');
        } catch (error) {
            this.logger.error(`Failed to send OTP to ${email}`, error.stack, 'OTPService');
            throw new BadRequestException({
                code: ErrorCodes.EMAIL_SEND_FAILED,
                message: 'Failed to send OTP email. Please try again.',
            });
        }
    }

    // ============================================
    // VERIFY OTP
    // ============================================

    /**
     * Verify OTP code
     * Returns user ID if valid
     */
    async verifyOTP(email: string, code: string, type: OTPType): Promise<string | null> {
        // 1. Find OTP record
        const otpRecord = await this.prisma.oTPCode.findFirst({
            where: {
                email,
                type,
                usedAt: null, // Not used yet
            },
            orderBy: {
                createdAt: 'desc', // Get most recent
            },
        });

        if (!otpRecord) {
            throw new UnauthorizedException({
                code: ErrorCodes.OTP_INVALID,
                message: 'Invalid or expired OTP code.',
            });
        }

        // 2. Check if expired
        if (new Date() > otpRecord.expiresAt) {
            // Delete expired OTP
            await this.prisma.oTPCode.delete({
                where: { id: otpRecord.id },
            });

            throw new UnauthorizedException({
                code: ErrorCodes.OTP_EXPIRED,
                message: 'OTP code has expired. Please request a new one.',
            });
        }

        // 3. Check max attempts
        if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
            // Delete OTP after max attempts
            await this.prisma.oTPCode.delete({
                where: { id: otpRecord.id },
            });

            throw new UnauthorizedException({
                code: ErrorCodes.OTP_MAX_ATTEMPTS,
                message: 'Too many failed attempts. Please request a new OTP.',
            });
        }

        // 4. Verify OTP code
        const hashedCode = this.hashService.hashToken(code);
        const isValid = hashedCode === otpRecord.code;

        if (!isValid) {
            // Increment attempt count
            await this.prisma.oTPCode.update({
                where: { id: otpRecord.id },
                data: {
                    attempts: otpRecord.attempts + 1,
                },
            });

            throw new UnauthorizedException({
                code: ErrorCodes.OTP_INVALID,
                message: 'Invalid OTP code.',
            });
        }

        // 5. Mark OTP as used
        await this.prisma.oTPCode.update({
            where: { id: otpRecord.id },
            data: {
                usedAt: new Date(),
            },
        });

        this.logger.log(`OTP verified for ${email}`, 'OTPService');

        return otpRecord.userId;
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    /**
     * Check if user has exceeded OTP request rate limit
     */
    private async checkRateLimit(email: string): Promise<void> {
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.RATE_LIMIT_WINDOW_MINUTES);

        const recentOTPs = await this.prisma.oTPCode.count({
            where: {
                email,
                createdAt: {
                    gte: windowStart,
                },
            },
        });

        if (recentOTPs >= this.MAX_OTP_REQUESTS) {
            throw new BadRequestException({
                code: ErrorCodes.OTP_RATE_LIMIT,
                message: `Too many OTP requests. Please try again in ${this.RATE_LIMIT_WINDOW_MINUTES} minutes.`,
            });
        }
    }

    // ============================================
    // CLEANUP
    // ============================================

    /**
     * Cleanup expired OTP codes (can be run as a cron job)
     */
    async cleanupExpiredOTPs(): Promise<number> {
        const result = await this.prisma.oTPCode.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        this.logger.log(`Cleaned up ${result.count} expired OTPs`, 'OTPService');
        return result.count;
    }
}