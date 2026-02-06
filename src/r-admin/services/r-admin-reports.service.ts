
// ===== src/r-admin/services/r-admin-reports.service.ts (UPDATED) =====
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RAdminReportsRepository } from '../repositories/r-admin-reports.repository';

@Injectable()
export class RAdminReportsService {
    constructor(private readonly reportsRepository: RAdminReportsRepository) { }

    async findAll(userId: string, query: any) {
        const { reports, total } = await this.reportsRepository.findAll({
            radminId: userId,
            ...query
        });

        const data = reports.map(r => ({
            id: r.id,
            projectName: r.project.name,
            projectId: r.projectId,
            client: r.project.client.companyName,
            clientEmail: r.project.client.pointOfContactEmail,
            service: r.project.serviceCategory?.name || 'N/A',
            pentester: `${r.pentester.firstName} ${r.pentester.lastName}`,
            pentesterEmail: r.pentester.email,
            version: r.version,
            status: r.status,
            submittedDate: r.submittedAt.toISOString(),
            reviewedDate: r.reviewedAt?.toISOString(),
            reviewedBy: r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : null,
            fileName: r.fileName,
            fileSize: this.formatFileSize(r.fileSize),
            fileUrl: r.fileUrl,
            submissionNotes: r.submissionNotes,
            reviewNotes: r.reviewNotes,
            rejectionReason: r.rejectionReason
        }));

        return {
            stats: { total },
            data,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
                hasNextPage: query.page < Math.ceil(total / query.limit),
                hasPreviousPage: query.page > 1
            }
        };
    }

    async findOne(id: string) {
        const report = await this.reportsRepository.findOne(id);
        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        return {
            id: report.id,
            projectName: report.project.name,
            projectId: report.projectId,
            client: report.project.client.companyName,
            clientEmail: report.project.client.pointOfContactEmail,
            service: report.project.serviceCategory?.name || 'N/A',
            pentester: `${report.pentester.firstName} ${report.pentester.lastName}`,
            pentesterEmail: report.pentester.email,
            version: report.version,
            status: report.status,
            action: this.getActionText(report.status),
            submittedDate: report.submittedAt.toISOString(),
            reviewedDate: report.reviewedAt?.toISOString(),
            reviewedBy: report.reviewer ? `${report.reviewer.firstName} ${report.reviewer.lastName}` : null,
            fileName: report.fileName,
            fileSize: this.formatFileSize(report.fileSize),
            fileUrl: report.fileUrl,
            submissionNotes: report.submissionNotes,
            reviewNotes: report.reviewNotes || report.rejectionReason,
            approvalNotes: report.reviewNotes,
            checksCompleted: report.checks?.map(c => ({
                id: c.id,
                name: c.securityCheck.title,
                completed: c.completed
            })) || [],
            history: report.history?.map(h => ({
                id: h.id,
                version: h.version,
                status: h.status,
                action: this.getActionText(h.status),
                submittedDate: h.submittedDate.toISOString(),
                reviewedDate: h.reviewedDate?.toISOString(),
                fileName: h.fileName,
                fileUrl: h.fileUrl,
                approvalNotes: h.approvalNotes,
                rejectionReason: h.rejectionReason
            })) || []
        };
    }

    async upload(file: Express.Multer.File, body: any, userId: string) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (!body.projectId) {
            throw new BadRequestException('Project ID is required');
        }

        // TODO: Implement file upload logic (S3, local storage, etc.)
        // For now, throw not implemented
        throw new BadRequestException('File upload not yet implemented');
    }

    private formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    private getActionText(status: string): string {
        switch (status) {
            case 'APPROVED': return 'Reviewed & Approved';
            case 'REJECTED': return 'Reviewed & Rejected';
            case 'PENDING': return 'Pending Review';
            case 'UNDER_REVIEW': return 'Under Review';
            default: return status;
        }
    }
}
