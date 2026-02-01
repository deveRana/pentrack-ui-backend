// src/client/services/client.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../repositories/client.repository';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
    ClientProfileResponse,
    ClientDashboardResponse,
    ClientProjectListItem,
    ClientReportListItem,
} from '../types/client-response.types';

@Injectable()
export class ClientService {
    constructor(private readonly clientRepository: ClientRepository) { }

    async getProfile(userId: string): Promise<ClientProfileResponse> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        return {
            id: client.id,
            clientId: client.clientId,
            companyName: client.companyName,
            email: client.user.email,
            phone: client.user.phone,
            address: client.address,
            industry: client.industry,
            userType: client.userType as 'client' | 'partner',
            pointOfContact: client.pointOfContact,
            pointOfContactEmail: client.pointOfContactEmail,
            pointOfContactPhone: client.pointOfContactPhone,
            joinedDate: client.joinedDate.toISOString(),
            totalProjects: client.totalProjects,
            activeProjects: client.activeProjects,
        };
    }

    async getDashboard(userId: string): Promise<ClientDashboardResponse> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const [stats, recentProjectsData, quickStats] = await Promise.all([
            this.clientRepository.getDashboardStats(client.id),
            this.clientRepository.getRecentProjects(client.id, 5),
            this.clientRepository.getQuickStats(client.id),
        ]);

        const recentProjects: ClientProjectListItem[] = recentProjectsData.map((project) => ({
            id: project.id,
            name: project.name,
            client: client.companyName,
            service: project.serviceCategory?.name || 'N/A',
            status: this.mapStatusToFrontend(project.status),
            progress: project.progress,
            startDate: project.startDate?.toISOString() || '',
            endDate: project.endDate?.toISOString() || '',
            dueDate: project.deadline?.toISOString() || project.endDate?.toISOString() || '',
            pentester: project.pentester ? `${project.pentester.firstName} ${project.pentester.lastName}` : 'Not Assigned',
            pentesterEmail: project.pentester?.email || '',
            description: project.description || '',
            hasReport: project.reports.length > 0,
        }));

        const recentReports: ClientReportListItem[] = [];

        return {
            stats,
            recentProjects,
            recentReports,
            quickStats,
        };
    }

    private mapStatusToFrontend(status: string): string {
        const statusMap: Record<string, string> = {
            NOT_STARTED: 'not_started',
            IN_PROGRESS: 'in_progress',
            TESTING_COMPLETE: 'testing_complete',
            REPORT_SUBMITTED: 'report_submitted',
            UNDER_REVIEW: 'under_review',
            REWORK_NEEDED: 'rework_needed',
            COMPLETED: 'completed',
            REJECTED: 'rejected',
            OVERDUE: 'overdue',
        };
        return statusMap[status] || status.toLowerCase();
    }
}