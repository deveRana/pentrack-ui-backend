import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminClientsRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll(params: { page: number; limit: number; search?: string }) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;
        const where: any = { deletedAt: null };
        if (search) where.OR = [{ companyName: { contains: search, mode: 'insensitive' } }, { pointOfContactEmail: { contains: search, mode: 'insensitive' } }];
        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({ where, skip, take: limit, include: { user: true, partner: true } }),
            this.prisma.client.count({ where }),
        ]);
        return { clients, total };
    }
    async create(data: any, createdById: string) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { email: data.pointOfContactEmail, firstName: data.pointOfContact.split(' ')[0], lastName: data.pointOfContact.split(' ')[1] || '', phone: data.pointOfContactPhone, role: 'CLIENT', status: 'ACTIVE', isEmailVerified: true, createdById } });
            return tx.client.create({ data: { userId: user.id, clientId: `CLI-${Date.now()}`, companyName: data.companyName, industry: data.industry, address: data.address, website: data.website, pointOfContact: data.pointOfContact, pointOfContactEmail: data.pointOfContactEmail, pointOfContactPhone: data.pointOfContactPhone, hasPartner: data.hasPartner || false, partnerId: data.partnerId, createdById } });
        });
    }
}