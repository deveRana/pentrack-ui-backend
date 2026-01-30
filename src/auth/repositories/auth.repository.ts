// src/auth/repositories/auth.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { User, UserRole, AccountStatus } from '@prisma/client';

/**
 * Auth Repository
 * Handles all database queries related to authentication
 */
@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============================================
    // USER QUERIES
    // ============================================

    /**
     * Find user by email
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by ID (with relations based on role)
     */
    async findUserById(userId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                clientProfile: true,
                partnerProfile: true,
                pentesterProfile: true,
            },
        });
    }

    /**
     * Find user by phone
     */
    async findUserByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }

    // ============================================
    // USER MUTATIONS
    // ============================================

    /**
     * Create new user
     */
    async createUser(data: {
        email: string;
        password?: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        role: UserRole;
        companyEmail?: string | null;
        companyDomain?: string | null;
    }): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role,
                companyEmail: data.companyEmail,
                companyDomain: data.companyDomain,
                status: AccountStatus.PENDING, // Email not verified yet
                isEmailVerified: false,
            },
        });
    }

    /**
     * Update user email verification status
     */
    async markEmailAsVerified(userId: string): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                status: AccountStatus.ACTIVE, // Account becomes active after verification
            },
        });
    }

    /**
     * Update last login details
     */
    async updateLastLogin(userId: string, ipAddress: string): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                lastLogin: new Date(),
                lastLoginIp: ipAddress,
            },
        });
    }

    /**
     * Update account status
     */
    async updateAccountStatus(userId: string, status: AccountStatus): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status },
        });
    }

    // ============================================
    // SESSION QUERIES
    // ============================================

    /**
     * Find session by token
     */
    async findSessionByToken(token: string) {
        return this.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
    }

    /**
     * Find all sessions for a user
     */
    async findUserSessions(userId: string) {
        return this.prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ============================================
    // SESSION MUTATIONS
    // ============================================

    /**
     * Create new session
     */
    async createSession(data: {
        userId: string;
        token: string;
        expiresAt: Date;
        rememberMe: boolean;
        userAgent?: string;
        ipAddress?: string;
    }) {
        return this.prisma.session.create({
            data: {
                userId: data.userId,
                token: data.token,
                expiresAt: data.expiresAt,
                rememberMe: data.rememberMe,
                userAgent: data.userAgent,
                ipAddress: data.ipAddress,
            },
        });
    }

    /**
     * Update session last activity
     */
    async updateSessionActivity(sessionId: string) {
        return this.prisma.session.update({
            where: { id: sessionId },
            data: { lastActivity: new Date() },
        });
    }

    /**
     * Delete session by token (logout)
     */
    async deleteSession(token: string): Promise<void> {
        await this.prisma.session.delete({
            where: { token },
        });
    }

    /**
     * Delete all sessions for a user (logout from all devices)
     */
    async deleteAllUserSessions(userId: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
    }

    /**
     * Delete expired sessions (cleanup job)
     */
    async deleteExpiredSessions(): Promise<number> {
        const result = await this.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
}