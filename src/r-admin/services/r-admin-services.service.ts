import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RAdminServicesRepository } from '../repositories/r-admin-services.repository';
import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';

@Injectable()
export class RAdminServicesService {
    constructor(private readonly servicesRepository: RAdminServicesRepository) { }

    async findAll() {
        return this.servicesRepository.findAll();
    }

    async findOne(id: string) {
        const category = await this.servicesRepository.findOne(id);
        if (!category) {
            throw new NotFoundException(`Service category with ID ${id} not found`);
        }
        return category;
    }

    async create(dto: CreateServiceCategoryDto, createdById: string) {
        try {
            return await this.servicesRepository.create(dto, createdById);
        } catch (error) {
            // Handle Prisma unique constraint violation
            if (error.code === 'P2002') {
                throw new ConflictException(`A service category with the name "${dto.name}" already exists`);
            }
            throw error;
        }
    }

    async update(id: string, dto: CreateServiceCategoryDto, updatedById: string) {
        // Check if exists first
        await this.findOne(id);
        try {
            return await this.servicesRepository.update(id, dto, updatedById);
        } catch (error) {
            // Handle Prisma unique constraint violation
            if (error.code === 'P2002') {
                throw new ConflictException(`A service category with the name "${dto.name}" already exists`);
            }
            throw error;
        }
    }

    async delete(id: string) {
        // Check if exists first
        await this.findOne(id);
        return this.servicesRepository.delete(id);
    }
}