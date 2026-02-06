
// ===== src/r-admin/services/r-admin-profile.service.ts (NEW) =====
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UpdateRAdminProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class RAdminProfileService {
    constructor(private readonly prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
                _count: {
                    select: {
                        managedProjects: true
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundException('Profile not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role.toLowerCase(),
            status: user.status.toLowerCase(),
            profileImage: user.profileImage,
            totalProjects: user._count.managedProjects,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString()
        };
    }

    async updateProfile(userId: string, dto: UpdateRAdminProfileDto) {
        const existing = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existing) {
            throw new NotFoundException('Profile not found');
        }

        // Check if phone is being changed and already exists
        if (dto.phone !== existing.phone) {
            const existingByPhone = await this.prisma.user.findFirst({
                where: {
                    phone: dto.phone,
                    id: { not: userId }
                }
            });

            if (existingByPhone) {
                throw new NotFoundException('This phone number is already in use');
            }
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone
            }
        });

        return {
            id: updated.id,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email,
            phone: updated.phone,
            role: updated.role.toLowerCase(),
            updatedAt: updated.updatedAt.toISOString()
        };
    }
}
