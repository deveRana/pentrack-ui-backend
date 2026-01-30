// src/admin/repositories/system-logs.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { SystemLogType, SystemLogStatus } from '@prisma/client';

/**
 * System Logs Repository
 * Handles all database queries for system logs (AuthAuditLog)
 */
@Injectable()
export class SystemLogsRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============================================
    // SYSTEM LOG QUERIES
    // ============================================

    /**
     * Find all system logs with pagination and filters
     */
    async findAllLogs(params: {
        page: number;
        limit: number;
        type?: SystemLogType;
        status?: SystemLogStatus;
        userId?: string;
        searchQuery?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const { page, limit, type, status, userId, searchQuery, startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Apply filters
        if (type) {
            where.eventType = type;
        }

        if (status) {
            where.status = status;
        }

        if (userId) {
            where.userId = userId;
        }

        if (searchQuery) {
            where.OR = [
                { event: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                {
                    user: {
                        OR: [
                            { firstName: { contains: searchQuery, mode: 'insensitive' } },
                            { lastName: { contains: searchQuery, mode: 'insensitive' } },
                            { email: { contains: searchQuery, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }

        if (startDate) {
            where.createdAt = {
                ...where.createdAt,
                gte: new Date(startDate),
            };
        }

        if (endDate) {
            where.createdAt = {
                ...where.createdAt,
                lte: new Date(endDate),
            };
        }

        const [logs, total] = await Promise.all([
            this.prisma.authAuditLog.findMany({
                where,
                skip,
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
            }),
            this.prisma.authAuditLog.count({ where }),
        ]);

        return { logs, total };
    }

    /**
     * Find system log by ID
     */
    async findLogById(id: string) {
        return this.prisma.authAuditLog.findUnique({
            where: { id },
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

    /**
     * Create system log entry
     */
    async createLog(data: {
        userId?: string;
        event: string;
        eventType: SystemLogType;
        description?: string;
        status: SystemLogStatus;
        metadata?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.authAuditLog.create({
            data: {
                userId: data.userId,
                event: data.event,
                eventType: data.eventType,
                description: data.description,
                status: data.status,
                metadata: data.metadata,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }

    /**
     * Get all logs for export (without pagination)
     */
    async getAllLogsForExport(params: {
        type?: SystemLogType;
        status?: SystemLogStatus;
        userId?: string;
        searchQuery?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const { type, status, userId, searchQuery, startDate, endDate } = params;

        const where: any = {};

        // Apply same filters as findAllLogs
        if (type) where.eventType = type;
        if (status) where.status = status;
        if (userId) where.userId = userId;

        if (searchQuery) {
            where.OR = [
                { event: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }

        if (startDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
        }

        if (endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
        }

        return this.prisma.authAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 10000, // Limit to 10k records for export
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
}