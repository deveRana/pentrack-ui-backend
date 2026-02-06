import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';

@Injectable()
export class RAdminServicesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.serviceCategory.findMany({
            where: { isActive: true },
            include: {
                subServices: {
                    where: { isActive: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(dto: CreateServiceCategoryDto, createdById: string) {
        // Check if a deleted category with same name exists
        const existingCategory = await this.prisma.serviceCategory.findUnique({
            where: { name: dto.name },
            include: { subServices: true }
        });

        // If exists and is deleted, reactivate it and update
        if (existingCategory && !existingCategory.isActive) {
            return this.prisma.$transaction(async (tx) => {
                // Soft delete old sub-services
                await tx.subService.updateMany({
                    where: { serviceCategoryId: existingCategory.id },
                    data: { isActive: false }
                });

                // Reactivate category with new data
                return tx.serviceCategory.update({
                    where: { id: existingCategory.id },
                    data: {
                        description: dto.description,
                        isActive: true,
                        subServices: {
                            create: dto.subServices.map(subService => ({
                                name: subService.name,
                                description: subService.description,
                                createdById,
                                isActive: true,
                            })),
                        },
                    },
                    include: {
                        subServices: true,
                    },
                });
            });
        }

        // If name already exists and is active, Prisma will throw error (which is correct)
        // Create new service category with sub-services
        return this.prisma.serviceCategory.create({
            data: {
                name: dto.name,
                description: dto.description,
                createdById,
                isActive: true,
                subServices: {
                    create: dto.subServices.map(subService => ({
                        name: subService.name,
                        description: subService.description,
                        createdById,
                        isActive: true,
                    })),
                },
            },
            include: {
                subServices: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.serviceCategory.findUnique({
            where: { id },
            include: {
                subServices: {
                    where: { isActive: true }
                }
            },
        });
    }

    async update(id: string, dto: CreateServiceCategoryDto, updatedById: string) {
        // For update, we'll handle it differently - delete old sub-services and create new ones
        return this.prisma.$transaction(async (tx) => {
            // Delete existing sub-services (soft delete)
            await tx.subService.updateMany({
                where: { serviceCategoryId: id },
                data: { isActive: false }
            });

            // Update category and create new sub-services
            return tx.serviceCategory.update({
                where: { id },
                data: {
                    name: dto.name,
                    description: dto.description,
                    subServices: {
                        create: dto.subServices.map(subService => ({
                            name: subService.name,
                            description: subService.description,
                            createdById: updatedById,
                            isActive: true,
                        })),
                    },
                },
                include: {
                    subServices: true,
                },
            });
        });
    }

    async delete(id: string) {
        // Soft delete - set isActive to false
        return this.prisma.serviceCategory.update({
            where: { id },
            data: { isActive: false }
        });
    }
}