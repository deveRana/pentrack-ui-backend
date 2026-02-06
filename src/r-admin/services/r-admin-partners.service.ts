
// ===== src/r-admin/services/r-admin-partners.service.ts =====
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RAdminPartnersRepository } from '../repositories/r-admin-partners.repository';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto/create-partner.dto';

@Injectable()
export class RAdminPartnersService {
    constructor(private readonly partnersRepository: RAdminPartnersRepository) { }

    async findAll(query: any) {
        const { partners, total } = await this.partnersRepository.findAll(query);

        const data = partners.map(p => ({
            id: p.id,
            companyName: p.companyName,
            industry: p.industry,
            address: p.address,
            website: p.website,
            pointOfContact: p.pointOfContact,
            pointOfContactEmail: p.pointOfContactEmail,
            pointOfContactPhone: p.pointOfContactPhone,
            totalProjects: p.totalProjects,
            activeProjects: p.activeProjects,
            status: p.user.status.toLowerCase(),
            userType: p.userType,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString()
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

    async findOne(id: string) {
        const partner = await this.partnersRepository.findOne(id);
        if (!partner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }

        return {
            id: partner.id,
            companyName: partner.companyName,
            industry: partner.industry,
            address: partner.address,
            website: partner.website,
            pointOfContact: partner.pointOfContact,
            pointOfContactEmail: partner.pointOfContactEmail,
            pointOfContactPhone: partner.pointOfContactPhone,
            totalProjects: partner.totalProjects,
            activeProjects: partner.activeProjects,
            status: partner.user.status.toLowerCase(),
            userType: partner.userType,
            createdAt: partner.createdAt.toISOString(),
            updatedAt: partner.updatedAt.toISOString()
        };
    }

    async create(dto: CreatePartnerDto, createdById: string) {
        const existingByEmail = await this.partnersRepository.findByEmail(dto.pointOfContactEmail);
        if (existingByEmail) {
            throw new ConflictException('A partner with this email already exists');
        }

        const existingByPhone = await this.partnersRepository.findByPhone(dto.pointOfContactPhone);
        if (existingByPhone) {
            throw new ConflictException('A partner with this phone number already exists');
        }

        return this.partnersRepository.create(dto, createdById);
    }

    async update(id: string, dto: UpdatePartnerDto) {
        const existing = await this.partnersRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }

        if (dto.pointOfContactEmail !== existing.pointOfContactEmail) {
            const existingByEmail = await this.partnersRepository.findByEmail(dto.pointOfContactEmail);
            if (existingByEmail && existingByEmail.id !== id) {
                throw new ConflictException('A partner with this email already exists');
            }
        }

        if (dto.pointOfContactPhone !== existing.pointOfContactPhone) {
            const existingByPhone = await this.partnersRepository.findByPhone(dto.pointOfContactPhone);
            if (existingByPhone && existingByPhone.id !== id) {
                throw new ConflictException('A partner with this phone number already exists');
            }
        }

        return this.partnersRepository.update(id, dto);
    }

    async delete(id: string) {
        const existing = await this.partnersRepository.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }

        return this.partnersRepository.delete(id);
    }
}
