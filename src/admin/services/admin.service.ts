// src/admin/services/admin.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { UpdateAdminProfileDto } from '../dto/update-admin-profile.dto';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { formatUserResponse } from '@auth/utils/auth.utils';

/**
 * Admin Service
 * Handles business logic for Admin (Super Admin) operations
 */
@Injectable()
export class AdminService {
    constructor(private readonly adminRepository: AdminRepository) { }

    // ============================================
    // PROFILE MANAGEMENT
    // ============================================

    /**
     * Get admin profile
     */
    async getProfile(userId: string) {
        const admin = await this.adminRepository.findAdminById(userId);

        if (!admin) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Admin user not found',
            });
        }

        return formatUserResponse(admin);
    }

    /**
     * Update admin profile
     */
    async updateProfile(userId: string, dto: UpdateAdminProfileDto) {
        // Check if admin exists
        const admin = await this.adminRepository.findAdminById(userId);

        if (!admin) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Admin user not found',
            });
        }

        // Update profile
        const updatedAdmin = await this.adminRepository.updateAdminProfile(userId, {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
        });

        return formatUserResponse(updatedAdmin);
    }

    // ============================================
    // DASHBOARD
    // ============================================

    /**
     * Get admin dashboard data
     */
    async getDashboard() {
        const [totalZoneAdmins, activeProjects, pendingReports, recentActivities] =
            await Promise.all([
                this.adminRepository.getTotalRAdminsCount(),
                this.adminRepository.getActiveProjectsCount(),
                this.adminRepository.getPendingReportsCount(),
                this.adminRepository.getRecentActivities(10),
            ]);

        // Format recent activities
        const formattedActivities = recentActivities.map((log) => ({
            id: log.id,
            user: log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : 'System',
            userId: log.userId || null,
            action: log.description || log.event,
            time: this.getRelativeTime(log.createdAt),
            timestamp: log.createdAt.toISOString(),
            type: log.eventType,
        }));

        return {
            stats: {
                totalZoneAdmins,
                activeProjects,
                pendingReports,
            },
            recentActivities: formattedActivities,
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get relative time string (e.g., "2 minutes ago")
     */
    private getRelativeTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
}