
// ===== src/r-admin/repositories/r-admin-clients.repository.ts (UPDATED) =====
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class RAdminClientsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: { page: number; limit: number; search?: string; status?: string }) {
        const { page, limit, search, status } = params;
        const skip = (page - 1) * limit;

        const where: any = { user: { deletedAt: null } };

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { pointOfContactEmail: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'all') {
            where.user = {
                ...where.user,
                status: status.toUpperCase() as AccountStatus
            };
        }

        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: true,
                    partner: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.client.count({ where })
        ]);

        return { clients, total };
    }

    async findOne(id: string) {
        return this.prisma.client.findUnique({
            where: { id },
            include: {
                user: true,
                partner: true
            }
        });
    }

    async findByEmail(email: string) {
        return this.prisma.client.findFirst({
            where: {
                pointOfContactEmail: email,
                user: { deletedAt: null }
            }
        });
    }

    async findByPhone(phone: string) {
        return this.prisma.client.findFirst({
            where: {
                pointOfContactPhone: phone,
                user: { deletedAt: null }
            }
        });
    }

    async create(data: any, createdById: string) {
        return this.prisma.$transaction(async (tx) => {
            // Create user account
            const user = await tx.user.create({
                data: {
                    email: data.pointOfContactEmail,
                    firstName: data.pointOfContact.split(' ')[0],
                    lastName: data.pointOfContact.split(' ').slice(1).join(' ') || '',
                    phone: data.pointOfContactPhone,
                    role: 'CLIENT',
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: true,
                    createdById
                }
            });

            // Create client profile
            return tx.client.create({
                data: {
                    userId: user.id,
                    clientId: `CLI-${Date.now()}`,
                    companyName: data.companyName,
                    industry: data.industry,
                    address: data.address,
                    website: data.website,
                    pointOfContact: data.pointOfContact,
                    pointOfContactEmail: data.pointOfContactEmail,
                    pointOfContactPhone: data.pointOfContactPhone,
                    hasPartner: data.hasPartner || false,
                    partnerId: data.partnerId,
                    createdById
                },
                include: { user: true }
            });
        });
    }

    async update(id: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            const client = await tx.client.findUnique({
                where: { id },
                include: { user: true }
            });

            if (!client) return null;

            // Update user account
            await tx.user.update({
                where: { id: client.userId },
                data: {
                    phone: data.pointOfContactPhone
                }
            });

            // Update client profile
            return tx.client.update({
                where: { id },
                data: {
                    companyName: data.companyName,
                    industry: data.industry,
                    address: data.address,
                    website: data.website,
                    pointOfContact: data.pointOfContact,
                    pointOfContactEmail: data.pointOfContactEmail,
                    pointOfContactPhone: data.pointOfContactPhone,
                    hasPartner: data.hasPartner,
                    partnerId: data.partnerId
                },
                include: { user: true }
            });
        });
    }

    async delete(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const client = await tx.client.findUnique({ where: { id } });
            if (!client) return null;

            // Soft delete user
            await tx.user.update({
                where: { id: client.userId },
                data: {
                    deletedAt: new Date(),
                    status: AccountStatus.DELETED
                }
            });

            return client;
        });
    }
}
