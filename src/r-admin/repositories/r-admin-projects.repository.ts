import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll(params: { radminId: string; page: number; limit: number; search?: string; status?: string }) {
        const { radminId, page, limit, search, status } = params;
        const skip = (page - 1) * limit;
        const where: any = { radminId, deletedAt: null };
        if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
        if (status && status !== 'all') where.status = status;
        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({ where, skip, take: limit, include: { client: true, pentester: true, serviceCategory: true } }),
            this.prisma.project.count({ where }),
        ]);
        return { projects, total };
    }
    async create(data: any, radminId: string) {
        return this.prisma.project.create({ data: { ...data, radminId, createdBy: radminId } });
    }
}