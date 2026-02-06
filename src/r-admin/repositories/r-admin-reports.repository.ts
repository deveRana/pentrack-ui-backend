import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminReportsRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll(params: { radminId: string; page: number; limit: number }) {
        const { radminId, page, limit } = params;
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({ where: { project: { radminId } }, skip, take: limit, include: { project: { include: { client: true } }, pentester: true } }),
            this.prisma.report.count({ where: { project: { radminId } } }),
        ]);
        return { reports, total };
    }
}