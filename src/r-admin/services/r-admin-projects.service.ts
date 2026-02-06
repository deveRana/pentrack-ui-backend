import { Injectable } from '@nestjs/common';
import { RAdminProjectsRepository } from '../repositories/r-admin-projects.repository';
import { CreateProjectDto } from '../dto/create-project.dto';
@Injectable()
export class RAdminProjectsService {
    constructor(private readonly projectsRepository: RAdminProjectsRepository) { }
    async findAll(userId: string, query: any) {
        const { projects, total } = await this.projectsRepository.findAll({ radminId: userId, ...query });
        const data = projects.map(p => ({ id: p.id, name: p.name, client: p.client.companyName, services: p.services, pentester: p.pentester ? `${p.pentester.firstName} ${p.pentester.lastName}` : 'Not Assigned', status: p.status.toLowerCase(), priority: p.priority.toLowerCase(), startDate: p.startDate?.toISOString(), endDate: p.endDate?.toISOString(), progress: p.progress }));
        const stats = { totalProjects: total, activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length, completedProjects: projects.filter(p => p.status === 'COMPLETED').length };
        return { stats, data, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNextPage: query.page < Math.ceil(total / query.limit), hasPreviousPage: query.page > 1 } };
    }
    async create(dto: CreateProjectDto, userId: string) {
        return this.projectsRepository.create(dto, userId);
    }
}