import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminPartnersRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll(params: { page: number; limit: number }) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [partners, total] = await Promise.all([
            this.prisma.partner.findMany({ skip, take: limit, include: { user: true } }),
            this.prisma.partner.count(),
        ]);
        return { partners, total };
    }
}