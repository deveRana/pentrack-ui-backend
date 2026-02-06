
// ===== src/r-admin/repositories/r-admin-projects.repository.ts (UPDATED) =====
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class RAdminProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        radminId: string;
        page: number;
        limit: number;
        search?: string;
        status?: string;
        priority?: string;
    }) {
        const { radminId, page, limit, search, status, priority } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            radminId,
            deletedAt: null
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { client: { companyName: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (status && status !== 'all') {
            where.status = status.toUpperCase() as ProjectStatus;
        }

        if (priority && priority !== 'all') {
            where.priority = priority.toUpperCase();
        }

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: limit,
                include: {
                    client: true,
                    pentester: true,
                    serviceCategory: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.project.count({ where })
        ]);

        return { projects, total };
    }

    async findOne(id: string) {
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                client: true,
                pentester: true,
                partner: true,
                serviceCategory: {
                    include: {
                        subServices: true
                    }
                },
                radmin: true
            }
        });
    }

    async create(data: any, radminId: string) {
        return this.prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                clientId: data.clientId,
                pentesterId: data.pentesterId,
                radminId,
                scopeOfWork: data.scopeOfWork,
                objectives: data.objectives,
                targetUrls: data.targetUrls,
                services: data.services || [],
                serviceCategoryId: data.serviceCategoryId,
                status: data.status || ProjectStatus.NOT_STARTED,
                priority: data.priority || 'MEDIUM',
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                deadline: data.deadline ? new Date(data.deadline) : null,
                createdBy: radminId,
                assignedBy: radminId
            },
            include: {
                client: true,
                pentester: true,
                serviceCategory: true
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                clientId: data.clientId,
                pentesterId: data.pentesterId,
                scopeOfWork: data.scopeOfWork,
                objectives: data.objectives,
                targetUrls: data.targetUrls,
                services: data.services,
                serviceCategoryId: data.serviceCategoryId,
                status: data.status,
                priority: data.priority,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                progress: data.progress
            },
            include: {
                client: true,
                pentester: true,
                serviceCategory: true
            }
        });
    }

    async updateStatus(id: string, status: ProjectStatus, notes?: string) {
        return this.prisma.$transaction(async (tx) => {
            // Update project status
            const project = await tx.project.update({
                where: { id },
                data: { status },
                include: {
                    client: true,
                    pentester: true,
                    serviceCategory: true
                }
            });

            // Create activity log
            await tx.projectActivity.create({
                data: {
                    projectId: id,
                    userId: project.radminId,
                    activityType: 'STATUS_CHANGED',
                    description: `Status changed to ${status}`,
                    metadata: { status, notes }
                }
            });

            return project;
        });
    }

    async delete(id: string) {
        return this.prisma.project.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
    }
}