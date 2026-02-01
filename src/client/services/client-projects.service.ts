// src/client/services/client-projects.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientProjectsRepository } from '../repositories/client-projects.repository';
import { ClientRepository } from '../repositories/client.repository';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { ClientProjectQueryDto } from '../dto/client-query.dto';
import {
    ClientProjectListItem,
    ClientProjectDetails,
    ProjectTimeline,
    ProjectReport,
    ClientProjectsStatsResponse,
} from '../types/client-response.types';

@Injectable()
export class ClientProjectsService {
    constructor(
        private readonly clientProjectsRepository: ClientProjectsRepository,
        private readonly clientRepository: ClientRepository,
    ) { }

    async findAll(userId: string, query: ClientProjectQueryDto) {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const { page = 1, limit = 10, search, status, service } = query;

        const [{ projects, total }, stats] = await Promise.all([
            this.clientProjectsRepository.findAllProjects({
                clientId: client.id,
                page,
                limit,
                search,
                status,
                service,
            }),
            this.clientProjectsRepository.getProjectsStats(client.id),
        ]);

        const data: ClientProjectListItem[] = projects.map((project) => ({
            id: project.id,
            name: project.name,
            client: project.client.companyName,
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

        return {
            stats,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(userId: string, projectId: string): Promise<ClientProjectDetails> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const project = await this.clientProjectsRepository.findProjectById(projectId, client.id);

        if (!project) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Project not found',
            });
        }

        const timeline: ProjectTimeline[] = project.timelines.map((t) => ({
            id: t.id,
            status: this.mapStatusToFrontend(t.status),
            date: t.date?.toISOString() || null,
            completed: t.completed,
            description: t.description || '',
        }));

        const reports: ProjectReport[] = project.reports.map((r) => ({
            id: r.id,
            version: r.version.toString(),
            publishedDate: r.submittedAt.toISOString(),
            fileSize: this.formatFileSize(r.fileSize),
            fileName: r.fileName,
        }));

        return {
            id: project.id,
            name: project.name,
            client: project.client.companyName,
            service: project.serviceCategory?.name || 'N/A',
            status: this.mapStatusToFrontend(project.status),
            progress: project.progress,
            startDate: project.startDate?.toISOString() || '',
            endDate: project.endDate?.toISOString() || '',
            dueDate: project.deadline?.toISOString() || project.endDate?.toISOString() || '',
            pentester: project.pentester ? `${project.pentester.firstName} ${project.pentester.lastName}` : 'Not Assigned',
            pentesterEmail: project.pentester?.email || '',
            description: project.description || '',
            hasReport: reports.length > 0,
            scopeOfWork: project.scopeOfWork || '',
            objectives: project.objectives || '',
            targetUrls: project.targetUrls || '',
            priority: this.mapPriorityToFrontend(project.priority),
            timeline,
            reports,
        };
    }

    async getStats(userId: string): Promise<ClientProjectsStatsResponse> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        return this.clientProjectsRepository.getProjectsStats(client.id);
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

    private mapPriorityToFrontend(priority: string): string {
        return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    }

    private formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}