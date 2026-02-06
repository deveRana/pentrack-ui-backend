
// ===== src/r-admin/repositories/r-admin-reports.repository.ts (UPDATED) =====
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class RAdminReportsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        radminId: string;
        page: number;
        limit: number;
        search?: string;
        status?: string;
    }) {
        const { radminId, page, limit, search, status } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            project: { radminId }
        };

        if (search) {
            where.OR = [
                { project: { name: { contains: search, mode: 'insensitive' } } },
                { project: { client: { companyName: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        if (status && status !== 'all') {
            where.status = status.toUpperCase() as ReportStatus;
        }

        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                include: {
                    project: {
                        include: {
                            client: true,
                            serviceCategory: true
                        }
                    },
                    pentester: true,
                    reviewer: true
                },
                orderBy: { submittedAt: 'desc' }
            }),
            this.prisma.report.count({ where })
        ]);

        return { reports, total };
    }

    async findOne(id: string) {
        return this.prisma.report.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: true,
                        serviceCategory: true
                    }
                },
                pentester: true,
                reviewer: true,
                checks: {
                    include: {
                        securityCheck: true
                    }
                },
                history: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
}
