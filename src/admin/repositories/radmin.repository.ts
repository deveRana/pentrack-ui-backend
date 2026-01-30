// src/admin/repositories/radmin.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { User, UserRole, AccountStatus } from '@prisma/client';

/**
 * R-Admin Repository
 * Handles all database queries for R-Admin management
 */
@Injectable()
export class RAdminRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============================================
    // R-ADMIN QUERIES
    // ============================================

    /**
     * Find all R-Admins with pagination and search
     */
    async findAllRAdmins(params: {
        page: number;
        limit: number;
        search?: string;
    }) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            role: UserRole.R_ADMIN,
            deletedAt: null,
        };

        // Apply search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [radmins, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    lastLogin: true,
                    createdById: true,
                    // Count projects managed by this R-Admin
                    _count: {
                        select: {
                            managedProjects: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { radmins, total };
    }

    /**
     * Find R-Admin by ID
     */
    async findRAdminById(id: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                id,
                role: UserRole.R_ADMIN,
                deletedAt: null,
            },
        });
    }

    /**
     * Find R-Admin by email
     */
    async findRAdminByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                email,
                role: UserRole.R_ADMIN,
                deletedAt: null,
            },
        });
    }

    /**
     * Find R-Admin by phone
     */
    async findRAdminByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                phone,
                role: UserRole.R_ADMIN,
                deletedAt: null,
            },
        });
    }

    /**
     * Create new R-Admin
     */
    async createRAdmin(data: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        companyDomain: string;
        status: AccountStatus;
        createdById: string;
    }): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: UserRole.R_ADMIN,
                companyEmail: data.email, // Same as personal email for R-Admin
                companyDomain: data.companyDomain,
                status: data.status,
                isEmailVerified: true, // Auto-verified for R-Admin
                emailVerifiedAt: new Date(),
                createdById: data.createdById,
            },
        });
    }

    /**
     * Update R-Admin
     */
    async updateRAdmin(
        id: string,
        data: {
            firstName: string;
            lastName: string;
            phone: string;
            status: AccountStatus;
        },
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                status: data.status,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete R-Admin (soft delete)
     */
    async deleteRAdmin(id: string): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: AccountStatus.DELETED,
            },
        });
    }

    // ============================================
    // STATISTICS QUERIES
    // ============================================

    /**
     * Get R-Admin statistics
     */
    async getRAdminStats() {
        const [total, active, inactive, totalProjectsData] = await Promise.all([
            this.prisma.user.count({
                where: {
                    role: UserRole.R_ADMIN,
                    deletedAt: null,
                },
            }),
            this.prisma.user.count({
                where: {
                    role: UserRole.R_ADMIN,
                    status: AccountStatus.ACTIVE,
                    deletedAt: null,
                },
            }),
            this.prisma.user.count({
                where: {
                    role: UserRole.R_ADMIN,
                    status: AccountStatus.INACTIVE,
                    deletedAt: null,
                },
            }),
            this.prisma.project.count({
                where: {
                    radmin: {
                        role: UserRole.R_ADMIN,
                        deletedAt: null,
                    },
                    deletedAt: null,
                },
            }),
        ]);

        return {
            total,
            active,
            inactive,
            totalProjects: totalProjectsData,
        };
    }
}