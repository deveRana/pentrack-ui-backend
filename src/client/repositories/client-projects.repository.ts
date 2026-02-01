// src/client/repositories/client-projects.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ClientProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAllProjects(params: {
        clientId: string;
        page: number;
        limit: number;
        search?: string;
        status?: string;
        service?: string;
    }) {
        const { clientId, page, limit, search, status, service } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            clientId,
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status as ProjectStatus;
        }

        if (service && service !== 'all') {
            where.serviceCategory = {
                name: service,
            };
        }

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: {
                        select: {
                            companyName: true,
                        },
                    },
                    pentester: {
                        select: {
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
                        select: { id: true },
                        take: 1,
                    },
                },
            }),
            this.prisma.project.count({ where }),
        ]);

        return { projects, total };
    }

    async findProjectById(projectId: string, clientId: string) {
        return this.prisma.project.findFirst({
            where: {
                id: projectId,
                clientId,
                deletedAt: null,
            },
            include: {
                client: {
                    select: {
                        companyName: true,
                    },
                },
                pentester: {
                    select: {
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
                timelines: {
                    orderBy: { order: 'asc' },
                },
                reports: {
                    where: { status: 'APPROVED' },
                    orderBy: { version: 'desc' },
                    select: {
                        id: true,
                        version: true,
                        submittedAt: true,
                        fileName: true,
                        fileSize: true,
                        fileUrl: true,
                    },
                },
            },
        });
    }

    async getProjectsStats(clientId: string) {
        const [total, active, completed, notStarted, inProgress, underReview] = await Promise.all([
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
            this.prisma.project.count({
                where: { clientId, status: 'NOT_STARTED', deletedAt: null },
            }),
            this.prisma.project.count({
                where: { clientId, status: 'IN_PROGRESS', deletedAt: null },
            }),
            this.prisma.project.count({
                where: { clientId, status: 'UNDER_REVIEW', deletedAt: null },
            }),
        ]);

        return {
            totalProjects: total,
            activeProjects: active,
            completedProjects: completed,
            notStarted,
            inProgress,
            underReview,
        };
    }
}