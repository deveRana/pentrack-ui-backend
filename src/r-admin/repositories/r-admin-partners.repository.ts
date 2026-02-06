
// ===== src/r-admin/repositories/r-admin-partners.repository.ts (UPDATED) =====
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class RAdminPartnersRepository {
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

        const [partners, total] = await Promise.all([
            this.prisma.partner.findMany({
                where,
                skip,
                take: limit,
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.partner.count({ where })
        ]);

        return { partners, total };
    }

    async findOne(id: string) {
        return this.prisma.partner.findUnique({
            where: { id },
            include: { user: true }
        });
    }

    async findByEmail(email: string) {
        return this.prisma.partner.findFirst({
            where: {
                pointOfContactEmail: email,
                user: { deletedAt: null }
            }
        });
    }

    async findByPhone(phone: string) {
        return this.prisma.partner.findFirst({
            where: {
                pointOfContactPhone: phone,
                user: { deletedAt: null }
            }
        });
    }

    async create(data: any, createdById: string) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.pointOfContactEmail,
                    firstName: data.pointOfContact.split(' ')[0],
                    lastName: data.pointOfContact.split(' ').slice(1).join(' ') || '',
                    phone: data.pointOfContactPhone,
                    role: 'PARTNER',
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: true,
                    createdById
                }
            });

            return tx.partner.create({
                data: {
                    userId: user.id,
                    companyName: data.companyName,
                    industry: data.industry,
                    address: data.address,
                    website: data.website,
                    pointOfContact: data.pointOfContact,
                    pointOfContactEmail: data.pointOfContactEmail,
                    pointOfContactPhone: data.pointOfContactPhone,
                    createdById
                },
                include: { user: true }
            });
        });
    }

    async update(id: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            const partner = await tx.partner.findUnique({
                where: { id },
                include: { user: true }
            });

            if (!partner) return null;

            await tx.user.update({
                where: { id: partner.userId },
                data: {
                    phone: data.pointOfContactPhone
                }
            });

            return tx.partner.update({
                where: { id },
                data: {
                    companyName: data.companyName,
                    industry: data.industry,
                    address: data.address,
                    website: data.website,
                    pointOfContact: data.pointOfContact,
                    pointOfContactEmail: data.pointOfContactEmail,
                    pointOfContactPhone: data.pointOfContactPhone
                },
                include: { user: true }
            });
        });
    }

    async delete(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const partner = await tx.partner.findUnique({ where: { id } });
            if (!partner) return null;

            await tx.user.update({
                where: { id: partner.userId },
                data: {
                    deletedAt: new Date(),
                    status: AccountStatus.DELETED
                }
            });

            return partner;
        });
    }
}

