import { Injectable } from '@nestjs/common';
import { RAdminRepository } from '../repositories/r-admin.repository';
@Injectable()
export class RAdminService {
    constructor(private readonly radminRepository: RAdminRepository) { }
    async getDashboard(userId: string) {
        const stats = await this.radminRepository.getDashboardStats(userId);
        return { stats, recentActivities: [], upcomingDeadlines: [], pendingReviews: [] };
    }
}