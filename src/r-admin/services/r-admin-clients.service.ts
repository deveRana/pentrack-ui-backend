// src/r-admin/services/r-admin-clients.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RAdminClientsRepository } from '../repositories/r-admin-clients.repository';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class RAdminClientsService {
    constructor(private readonly clientsRepository: RAdminClientsRepository) { }

    /**
     * Get all clients with pagination
     */
    async findAll(query: any) {
        const { clients, total } = await this.clientsRepository.findAll(query);

        const data = clients.map(c => ({
            id: c.id,
            companyName: c.companyName,
            industry: c.industry,
            address: c.address,
            website: c.website,
            pointOfContact: c.pointOfContact,
            pointOfContactEmail: c.pointOfContactEmail,
            pointOfContactPhone: c.pointOfContactPhone,
            hasPartner: c.hasPartner,
            partnerId: c.partnerId,
            partnerName: c.partner?.companyName,
            totalProjects: c.totalProjects,
            activeProjects: c.activeProjects,
            status: c.user.status.toLowerCase(),
            userType: c.userType,
            createdAt: c.createdAt.toISOString()
        }));

        return {
            stats: { total },
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

    /**
     * Get client by ID
     */
    async findOne(id: string) {
        const client = await this.clientsRepository.findOne(id);
        if (!client) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return {
            id: client.id,
            companyName: client.companyName,
            industry: client.industry,
            address: client.address,
            website: client.website,
            pointOfContact: client.pointOfContact,
            pointOfContactEmail: client.pointOfContactEmail,
            pointOfContactPhone: client.pointOfContactPhone,
            hasPartner: client.hasPartner,
            partnerId: client.partnerId,
            partnerName: client.partner?.companyName,
            totalProjects: client.totalProjects,
            activeProjects: client.activeProjects,
            status: client.user.status.toLowerCase(),
            userType: client.userType,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString()
        };
    }

    /**
     * Create new client
     */
    async create(dto: CreateClientDto, createdById: string) {
        // Check if email already exists
        const existingByEmail = await this.clientsRepository.findByEmail(dto.pointOfContactEmail);
        if (existingByEmail) {
            throw new ConflictException('A client with this email already exists');
        }

        // Check if phone already exists
        const existingByPhone = await this.clientsRepository.findByPhone(dto.pointOfContactPhone);
        if (existingByPhone) {
            throw new ConflictException('A client with this phone number already exists');
        }

        return this.clientsRepository.create(dto, createdById);
    }

    /**
     * Update client
     */
    async update(id: string, dto: UpdateClientDto) {
        // Check if client exists
        const existing = await this.clientsRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        // Check if email is being changed and already exists
        if (dto.pointOfContactEmail !== existing.pointOfContactEmail) {
            const existingByEmail = await this.clientsRepository.findByEmail(dto.pointOfContactEmail);
            if (existingByEmail && existingByEmail.id !== id) {
                throw new ConflictException('A client with this email already exists');
            }
        }

        // Check if phone is being changed and already exists
        if (dto.pointOfContactPhone !== existing.pointOfContactPhone) {
            const existingByPhone = await this.clientsRepository.findByPhone(dto.pointOfContactPhone);
            if (existingByPhone && existingByPhone.id !== id) {
                throw new ConflictException('A client with this phone number already exists');
            }
        }

        return this.clientsRepository.update(id, dto);
    }

    /**
     * Delete client (soft delete)
     */
    async delete(id: string) {
        // Check if client exists
        const existing = await this.clientsRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Client with ID ${id} not found`);
        }

        return this.clientsRepository.delete(id);
    }
}