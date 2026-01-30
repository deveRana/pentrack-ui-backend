// src/admin/repositories/admin.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { User, UserRole } from '@prisma/client';

/**
 * Admin Repository
 * Handles all database queries for Admin (Super Admin) operations
 */
@Injectable()
export class AdminRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============================================
    // ADMIN PROFILE QUERIES
    // ============================================

    /**
     * Get admin user by ID with full profile
     */
    async findAdminById(userId: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                id: userId,
                role: UserRole.ADMIN,
            },
        });
    }

    /**
     * Update admin profile
     */
    async updateAdminProfile(
        userId: string,
        data: {
            firstName: string;
            lastName: string;
            phone: string;
        },
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                updatedAt: new Date(),
            },
        });
    }

    // ============================================
    // DASHBOARD QUERIES
    // ============================================

    /**
     * Get total count of R-Admins
     */
    async getTotalRAdminsCount(): Promise<number> {
        return this.prisma.user.count({
            where: {
                role: UserRole.R_ADMIN,
                deletedAt: null,
            },
        });
    }

    /**
     * Get total active projects count
     */
    async getActiveProjectsCount(): Promise<number> {
        return this.prisma.project.count({
            where: {
                status: {
                    in: ['NOT_STARTED', 'IN_PROGRESS', 'TESTING_COMPLETE'],
                },
                deletedAt: null,
            },
        });
    }

    /**
     * Get pending reports count
     */
    async getPendingReportsCount(): Promise<number> {
        return this.prisma.report.count({
            where: {
                status: {
                    in: ['PENDING', 'UNDER_REVIEW'],
                },
            },
        });
    }

    /**
     * Get recent activities (from AuthAuditLog)
     */
    async getRecentActivities(limit: number = 10) {
        return this.prisma.authAuditLog.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
}