// src/client/repositories/client-reports.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class ClientReportsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAllReports(params: {
        clientId: string;
        page: number;
        limit: number;
        search?: string;
        service?: string;
        dateRange?: string;
    }) {
        const { clientId, page, limit, search, service, dateRange } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            project: {
                clientId,
                deletedAt: null,
            },
            status: 'APPROVED',
        };

        if (search) {
            where.OR = [
                { project: { name: { contains: search, mode: 'insensitive' } } },
                { fileName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (service && service !== 'all') {
            where.project = {
                ...where.project,
                serviceCategory: {
                    name: service,
                },
            };
        }

        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            const daysMap: Record<string, number> = {
                '7days': 7,
                '30days': 30,
                '90days': 90,
            };
            const days = daysMap[dateRange];

            if (days) {
                const dateFrom = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                where.submittedAt = { gte: dateFrom };
            }
        }

        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            serviceCategory: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.report.count({ where }),
        ]);

        return { reports, total };
    }

    async findReportById(reportId: string, clientId: string) {
        return this.prisma.report.findFirst({
            where: {
                id: reportId,
                status: 'APPROVED',
                project: {
                    clientId,
                    deletedAt: null,
                },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        serviceCategory: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async getReportsStats(clientId: string) {
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const yearStart = new Date(currentDate.getFullYear(), 0, 1);

        const [total, thisMonth, thisYear] = await Promise.all([
            this.prisma.report.count({
                where: {
                    project: { clientId, deletedAt: null },
                    status: 'APPROVED',
                },
            }),
            this.prisma.report.count({
                where: {
                    project: { clientId, deletedAt: null },
                    status: 'APPROVED',
                    submittedAt: { gte: monthStart },
                },
            }),
            this.prisma.report.count({
                where: {
                    project: { clientId, deletedAt: null },
                    status: 'APPROVED',
                    submittedAt: { gte: yearStart },
                },
            }),
        ]);

        return {
            totalReports: total,
            thisMonth,
            thisYear,
        };
    }
}