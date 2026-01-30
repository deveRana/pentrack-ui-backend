// src/auth/services/session.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@core/database/prisma.service';
import { AppLogger } from '@core/logger/logger.service';
import { randomBytes } from 'crypto';

/**
 * Session Service
 * Handles session creation, validation, and cleanup
 */
@Injectable()
export class SessionService {
    private readonly sessionExpiry: string;
    private readonly sessionRememberMeExpiry: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly logger: AppLogger,
    ) {
        this.sessionExpiry = this.configService.get<string>('SESSION_EXPIRES_IN', '24h');
        this.sessionRememberMeExpiry = this.configService.get<string>(
            'SESSION_REMEMBER_ME_EXPIRES_IN',
            '30d',
        );
    }

    // ============================================
    // SESSION GENERATION
    // ============================================

    /**
     * Generate a random secure session token
     */
    private generateSessionToken(): string {
        return randomBytes(32).toString('hex'); // 64 character hex string
    }

    /**
     * Calculate session expiry time
     */
    private getExpiryDate(rememberMe: boolean): Date {
        const expiresAt = new Date();

        if (rememberMe) {
            // 30 days for remember me
            const days = parseInt(this.sessionRememberMeExpiry.replace('d', ''));
            expiresAt.setDate(expiresAt.getDate() + days);
        } else {
            // 24 hours for normal session
            const hours = parseInt(this.sessionExpiry.replace('h', ''));
            expiresAt.setHours(expiresAt.getHours() + hours);
        }

        return expiresAt;
    }

    // ============================================
    // CREATE SESSION
    // ============================================

    /**
     * Create a new session for user
     */
    async createSession(
        userId: string,
        rememberMe: boolean = false,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<string> {
        const token = this.generateSessionToken();
        const expiresAt = this.getExpiryDate(rememberMe);

        await this.prisma.session.create({
            data: {
                userId,
                token,
                expiresAt,
                rememberMe,
                userAgent,
                ipAddress,
                lastActivity: new Date(),
            },
        });

        this.logger.log(`Session created for user ${userId}`, 'SessionService');

        return token;
    }

    // ============================================
    // VALIDATE SESSION
    // ============================================

    /**
     * Validate session token and return user
     */
    async validateSession(token: string): Promise<any> {
        const session = await this.prisma.session.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        status: true,
                        isEmailVerified: true,
                        profileImage: true,
                        companyEmail: true,
                        companyDomain: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!session) {
            throw new UnauthorizedException('Invalid session');
        }

        // Check if session expired
        if (new Date() > session.expiresAt) {
            await this.deleteSession(token);
            throw new UnauthorizedException('Session expired');
        }

        // Check if user account is active
        if (session.user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        // Update last activity (rolling session)
        await this.prisma.session.update({
            where: { id: session.id },
            data: { lastActivity: new Date() },
        });

        return session.user;
    }

    // ============================================
    // DELETE SESSIONS
    // ============================================

    /**
     * Delete a specific session (logout)
     */
    async deleteSession(token: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { token },
        });

        this.logger.log('Session deleted', 'SessionService');
    }

    /**
     * Delete all sessions for a user (logout from all devices)
     */
    async deleteAllUserSessions(userId: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { userId },
        });

        this.logger.log(`All sessions deleted for user ${userId}`, 'SessionService');
    }

    // ============================================
    // GET SESSIONS
    // ============================================

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: string): Promise<any[]> {
        return this.prisma.session.findMany({
            where: {
                userId,
                expiresAt: {
                    gt: new Date(), // Not expired
                },
            },
            select: {
                id: true,
                token: true,
                userAgent: true,
                ipAddress: true,
                lastActivity: true,
                createdAt: true,
                expiresAt: true,
                deviceName: true,
                deviceType: true,
            },
            orderBy: {
                lastActivity: 'desc',
            },
        });
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    /**
     * Refresh session expiry (extend session)
     */
    async refreshSession(token: string): Promise<void> {
        const session = await this.prisma.session.findUnique({
            where: { token },
        });

        if (!session) {
            throw new UnauthorizedException('Invalid session');
        }

        const newExpiresAt = this.getExpiryDate(session.rememberMe);

        await this.prisma.session.update({
            where: { id: session.id },
            data: {
                expiresAt: newExpiresAt,
                lastActivity: new Date(),
            },
        });
    }

    // ============================================
    // CLEANUP
    // ============================================

    /**
     * Cleanup expired sessions (can be run as a cron job)
     */
    async cleanupExpiredSessions(): Promise<number> {
        const result = await this.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        this.logger.log(`Cleaned up ${result.count} expired sessions`, 'SessionService');

        return result.count;
    }
}