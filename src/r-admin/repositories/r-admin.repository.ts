import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminRepository {
    constructor(private readonly prisma: PrismaService) { }
    async getDashboardStats(radminId: string) {
        const [activeProjects, pendingReviews, overdueProjects, upcomingDeadlines] = await Promise.all([
            this.prisma.project.count({ where: { radminId, status: { in: ['IN_PROGRESS', 'NOT_STARTED'] }, deletedAt: null } }),
            this.prisma.report.count({ where: { project: { radminId }, status: 'PENDING' } }),
            this.prisma.project.count({ where: { radminId, status: 'OVERDUE', deletedAt: null } }),
            this.prisma.project.count({ where: { radminId, deadline: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, status: { notIn: ['COMPLETED'] }, deletedAt: null } }),
        ]);
        return { activeProjects, pendingReviews, overdueProjects, upcomingDeadlines };
    }
}