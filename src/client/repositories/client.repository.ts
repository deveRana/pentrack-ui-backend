// src/client/repositories/client.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class ClientRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findClientByUserId(userId: string) {
        return this.prisma.client.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        firstName: true,
                        lastName: true,
                        status: true,
                    },
                },
                partner: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
            },
        });
    }

    async getDashboardStats(clientId: string) {
        const [totalProjects, activeProjects, completedProjects, totalReports] = await Promise.all([
            this.prisma.project.count({
                where: { clientId, deletedAt: null },
            }),
            this.prisma.project.count({
                where: {
                    clientId,
                    status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'TESTING_COMPLETE'] },
                    deletedAt: null,
                },
            }),
            this.prisma.project.count({
                where: { clientId, status: 'COMPLETED', deletedAt: null },
            }),
            this.prisma.report.count({
                where: {
                    project: { clientId },
                    status: 'APPROVED',
                },
            }),
        ]);

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            totalReports,
        };
    }

    async getRecentProjects(clientId: string, limit: number = 5) {
        return this.prisma.project.findMany({
            where: { clientId, deletedAt: null },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                pentester: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                serviceCategory: {
                    select: {
                        name: true,
                    },
                },
                reports: {
                    where: { status: 'APPROVED' },
                    take: 1,
                    orderBy: { version: 'desc' },
                },
            },
        });
    }

    async getQuickStats(clientId: string) {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);

        const [projectsThisYear, allProjects] = await Promise.all([
            this.prisma.project.count({
                where: {
                    clientId,
                    createdAt: { gte: yearStart },
                    deletedAt: null,
                },
            }),
            this.prisma.project.findMany({
                where: { clientId, deletedAt: null, status: 'COMPLETED' },
                select: { startDate: true, endDate: true },
            }),
        ]);

        const completedCount = allProjects.length;
        const successRate = completedCount > 0 ? Math.round((completedCount / (await this.prisma.project.count({ where: { clientId, deletedAt: null } }))) * 100) : 0;

        let totalDays = 0;
        let validProjects = 0;

        allProjects.forEach((project) => {
            if (project.startDate && project.endDate) {
                const days = Math.floor((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
                totalDays += days;
                validProjects++;
            }
        });

        const avgCompletion = validProjects > 0 ? `${Math.round(totalDays / validProjects)} days` : 'N/A';

        return {
            projectsThisYear,
            successRate,
            avgCompletion,
        };
    }
}