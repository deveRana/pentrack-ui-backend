// src/client/services/client-reports.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientReportsRepository } from '../repositories/client-reports.repository';
import { ClientRepository } from '../repositories/client.repository';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { ClientReportQueryDto } from '../dto/client-query.dto';
import { ClientReportListItem, ClientReportsStatsResponse } from '../types/client-response.types';

@Injectable()
export class ClientReportsService {
    constructor(
        private readonly clientReportsRepository: ClientReportsRepository,
        private readonly clientRepository: ClientRepository,
    ) { }

    async findAll(userId: string, query: ClientReportQueryDto) {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const { page = 1, limit = 10, search, service, dateRange } = query;

        const [{ reports, total }, stats] = await Promise.all([
            this.clientReportsRepository.findAllReports({
                clientId: client.id,
                page,
                limit,
                search,
                service,
                dateRange,
            }),
            this.clientReportsRepository.getReportsStats(client.id),
        ]);

        const data: ClientReportListItem[] = reports.map((report) => ({
            id: report.id,
            projectName: report.project.name,
            projectId: report.project.id,
            service: report.project.serviceCategory?.name || 'N/A',
            version: report.version.toString(),
            publishedDate: report.submittedAt.toISOString(),
            fileSize: this.formatFileSize(report.fileSize),
            fileName: report.fileName,
            description: report.project.description || '',
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

    async findOne(userId: string, reportId: string): Promise<ClientReportListItem> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const report = await this.clientReportsRepository.findReportById(reportId, client.id);

        if (!report) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Report not found',
            });
        }

        return {
            id: report.id,
            projectName: report.project.name,
            projectId: report.project.id,
            service: report.project.serviceCategory?.name || 'N/A',
            version: report.version.toString(),
            publishedDate: report.submittedAt.toISOString(),
            fileSize: this.formatFileSize(report.fileSize),
            fileName: report.fileName,
            description: report.project.description || '',
        };
    }

    async getStats(userId: string): Promise<ClientReportsStatsResponse> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        return this.clientReportsRepository.getReportsStats(client.id);
    }

    async downloadReport(userId: string, reportId: string): Promise<{ fileUrl: string; fileName: string }> {
        const client = await this.clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Client profile not found',
            });
        }

        const report = await this.clientReportsRepository.findReportById(reportId, client.id);

        if (!report) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Report not found',
            });
        }

        return {
            fileUrl: report.fileUrl,
            fileName: report.fileName,
        };
    }

    private formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}