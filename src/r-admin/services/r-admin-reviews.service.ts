import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminReviewsService {
    constructor(private readonly prisma: PrismaService) { }
    async getPendingReviews(radminId: string) {
        return this.prisma.report.findMany({ where: { project: { radminId }, status: 'PENDING' }, include: { project: { include: { client: true } }, pentester: true } });
    }
}