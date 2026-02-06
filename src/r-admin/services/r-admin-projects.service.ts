
// ===== src/r-admin/services/r-admin-projects.service.ts (UPDATED) =====
import { Injectable, NotFoundException } from '@nestjs/common';
import { RAdminProjectsRepository } from '../repositories/r-admin-projects.repository';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class RAdminProjectsService {
    constructor(private readonly projectsRepository: RAdminProjectsRepository) { }

    async findAll(userId: string, query: any) {
        const { projects, total } = await this.projectsRepository.findAll({
            radminId: userId,
            ...query
        });

        const data = projects.map(p => ({
            id: p.id,
            name: p.name,
            client: p.client.companyName,
            clientId: p.clientId,
            services: p.services,
            pentester: p.pentester ? `${p.pentester.firstName} ${p.pentester.lastName}` : 'Not Assigned',
            pentesterId: p.pentesterId,
            status: p.status.toLowerCase(),
            priority: p.priority.toLowerCase(),
            startDate: p.startDate?.toISOString(),
            endDate: p.endDate?.toISOString(),
            progress: p.progress,
            scopeOfWork: p.scopeOfWork,
            objectives: p.objectives,
            targetUrls: p.targetUrls
        }));

        const stats = {
            totalProjects: total,
            activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
            completedProjects: projects.filter(p => p.status === 'COMPLETED').length
        };

        return {
            stats,
            data,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
                hasNextPage: query.page < Math.ceil(total / query.limit),
                hasPreviousPage: query.page > 1
            }
        };
    }

    async findOne(id: string) {
        const project = await this.projectsRepository.findOne(id);
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return {
            id: project.id,
            name: project.name,
            description: project.description,
            client: project.client.companyName,
            clientId: project.clientId,
            clientEmail: project.client.pointOfContactEmail,
            clientPhone: project.client.pointOfContactPhone,
            clientAddress: project.client.address,
            services: project.services,
            serviceCategory: project.serviceCategory?.name,
            pentester: project.pentester ? `${project.pentester.firstName} ${project.pentester.lastName}` : 'Not Assigned',
            pentesterId: project.pentesterId,
            pentesterEmail: project.pentester?.email,
            pentesterPhone: project.pentester?.phone,
            status: project.status.toLowerCase(),
            priority: project.priority.toLowerCase(),
            startDate: project.startDate?.toISOString(),
            endDate: project.endDate?.toISOString(),
            deadline: project.deadline?.toISOString(),
            progress: project.progress,
            scopeOfWork: project.scopeOfWork,
            objectives: project.objectives,
            targetUrls: project.targetUrls,
            createdBy: project.createdBy,
            assignedBy: project.assignedBy,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        };
    }

    async create(dto: CreateProjectDto, radminId: string) {
        return this.projectsRepository.create(dto, radminId);
    }

    async update(id: string, dto: UpdateProjectDto) {
        const existing = await this.projectsRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return this.projectsRepository.update(id, dto);
    }

    async updateStatus(id: string, status: ProjectStatus, notes?: string) {
        const existing = await this.projectsRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return this.projectsRepository.updateStatus(id, status, notes);
    }

    async delete(id: string) {
        const existing = await this.projectsRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return this.projectsRepository.delete(id);
    }
}
