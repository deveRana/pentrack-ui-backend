
// ===== src/r-admin/services/r-admin-reviews.service.ts (UPDATED) =====
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ApproveReportDto } from '../dto/approve-report.dto';
import { RejectReportDto } from '../dto/reject-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class RAdminReviewsService {
    constructor(private readonly prisma: PrismaService) { }

    async getPendingReviews(radminId: string) {
        const reviews = await this.prisma.report.findMany({
            where: {
                project: { radminId },
                status: ReportStatus.PENDING
            },
            include: {
                project: {
                    include: { client: true }
                },
                pentester: true
            },
            orderBy: { submittedAt: 'desc' }
        });

        return reviews.map(r => ({
            id: r.id,
            client: r.project.client.companyName,
            project: r.project.name,
            pentester: `${r.pentester.firstName} ${r.pentester.lastName}`,
            submittedAt: this.getTimeAgo(r.submittedAt)
        }));
    }

    async approveReport(id: string, dto: ApproveReportDto, reviewerId: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: { project: true, pentester: true }
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        // Update report status
        const updatedReport = await this.prisma.report.update({
            where: { id },
            data: {
                status: ReportStatus.APPROVED,
                reviewerId,
                reviewedAt: new Date(),
                reviewNotes: dto.notes
            },
            include: {
                project: { include: { client: true } },
                pentester: true,
                reviewer: true
            }
        });

        // Create history entry
        await this.prisma.reportHistory.create({
            data: {
                reportId: id,
                version: report.version,
                status: ReportStatus.APPROVED,
                submittedDate: report.submittedAt,
                reviewedDate: new Date(),
                fileName: report.fileName,
                fileUrl: report.fileUrl,
                approvalNotes: dto.notes
            }
        });

        // TODO: Send emails if dto.sendToSpoc or dto.customEmails
        // TODO: Publish to portal if dto.publishToPortal

        return this.formatReportResponse(updatedReport);
    }

    async rejectReport(id: string, dto: RejectReportDto, reviewerId: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: { project: true, pentester: true }
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        // Update report status
        const updatedReport = await this.prisma.report.update({
            where: { id },
            data: {
                status: ReportStatus.REJECTED,
                reviewerId,
                reviewedAt: new Date(),
                rejectionReason: dto.comments
            },
            include: {
                project: { include: { client: true } },
                pentester: true,
                reviewer: true
            }
        });

        // Create history entry
        await this.prisma.reportHistory.create({
            data: {
                reportId: id,
                version: report.version,
                status: ReportStatus.REJECTED,
                submittedDate: report.submittedAt,
                reviewedDate: new Date(),
                fileName: report.fileName,
                fileUrl: report.fileUrl,
                rejectionReason: dto.comments
            }
        });

        // TODO: Send notification email to pentester

        return this.formatReportResponse(updatedReport);
    }

    private formatReportResponse(report: any) {
        return {
            id: report.id,
            projectName: report.project.name,
            client: report.project.client.companyName,
            pentester: `${report.pentester.firstName} ${report.pentester.lastName}`,
            version: report.version,
            status: report.status,
            submittedDate: report.submittedAt.toISOString(),
            reviewedDate: report.reviewedAt?.toISOString(),
            reviewedBy: report.reviewer ? `${report.reviewer.firstName} ${report.reviewer.lastName}` : null,
            fileName: report.fileName,
            fileUrl: report.fileUrl
        };
    }

    private getTimeAgo(date: Date): string {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }
}