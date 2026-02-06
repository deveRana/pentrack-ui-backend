import { Injectable } from '@nestjs/common';
import { RAdminClientsRepository } from '../repositories/r-admin-clients.repository';
import { CreateClientDto } from '../dto/create-client.dto';
@Injectable()
export class RAdminClientsService {
    constructor(private readonly clientsRepository: RAdminClientsRepository) { }
    async findAll(query: any) {
        const { clients, total } = await this.clientsRepository.findAll(query);
        const data = clients.map(c => ({ id: c.id, companyName: c.companyName, industry: c.industry, address: c.address, pointOfContact: c.pointOfContact, pointOfContactEmail: c.pointOfContactEmail, pointOfContactPhone: c.pointOfContactPhone, totalProjects: c.totalProjects, activeProjects: c.activeProjects, status: c.user.status.toLowerCase(), createdAt: c.createdAt.toISOString() }));
        return { stats: { total }, data, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNextPage: query.page < Math.ceil(total / query.limit), hasPreviousPage: query.page > 1 } };
    }
    async create(dto: CreateClientDto, userId: string) {
        return this.clientsRepository.create(dto, userId);
    }
}