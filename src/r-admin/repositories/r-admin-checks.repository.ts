import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateCheckDto, UpdateCheckDto } from '../dto/create-check.dto';

@Injectable()
export class RAdminChecksRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.securityCheck.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        return this.prisma.securityCheck.findUnique({
            where: { id }
        });
    }

    async create(dto: CreateCheckDto, createdById: string) {
        return this.prisma.securityCheck.create({
            data: {
                title: dto.title,
                description: dto.description,
                serviceCategory: dto.serviceCategory,
                subService: dto.subService,
                isMandatory: dto.isMandatory ?? false,
                createdById,
                isActive: true,
            }
        });
    }

    async update(id: string, dto: UpdateCheckDto) {
        return this.prisma.securityCheck.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                serviceCategory: dto.serviceCategory,
                subService: dto.subService,
                isMandatory: dto.isMandatory,
            }
        });
    }

    async delete(id: string) {
        // Soft delete
        return this.prisma.securityCheck.update({
            where: { id },
            data: { isActive: false }
        });
    }
}