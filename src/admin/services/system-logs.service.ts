// src/admin/services/system-logs.service.ts

import { Injectable } from '@nestjs/common';
import { SystemLogsRepository } from '../repositories/system-logs.repository';
import { SystemLogQueryDto, ExportLogsQueryDto } from '../dto/system-log-query.dto';
import { AppLogger } from '@core/logger/logger.service';

/**
 * System Logs Service
 * Handles business logic for system logs viewing and export
 */
@Injectable()
export class SystemLogsService {
    constructor(
        private readonly logsRepository: SystemLogsRepository,
        private readonly logger: AppLogger,
    ) { }

    // ============================================
    // SYSTEM LOGS QUERIES
    // ============================================

    /**
     * Get all system logs with pagination and filters
     */
    async findAll(query: SystemLogQueryDto) {
        const {
            page = 1,
            limit = 15,
            type,
            status,
            userId,
            searchQuery,
            startDate,
            endDate,
        } = query;

        const { logs, total } = await this.logsRepository.findAllLogs({
            page,
            limit,
            type,
            status,
            userId,
            searchQuery,
            startDate,
            endDate,
        });

        // Format logs for frontend
        const formattedLogs = logs.map((log) => ({
            id: log.id,
            timestamp: log.createdAt.toISOString(),
            user: log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : 'System',
            userId: log.userId || 0,
            action: log.description || log.event,
            type: log.eventType.toLowerCase(),
            ip: log.ipAddress || 'unknown',
            status: log.status.toLowerCase(),
            details: log.metadata ? JSON.stringify(log.metadata) : null,
            userAgent: log.userAgent || null,
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: formattedLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    /**
     * Export system logs in specified format
     */
    async exportLogs(query: ExportLogsQueryDto): Promise<Buffer> {
        const { format = 'csv', type, status, userId, searchQuery, startDate, endDate } = query;

        // Get all logs for export (no pagination)
        const logs = await this.logsRepository.getAllLogsForExport({
            type,
            status,
            userId,
            searchQuery,
            startDate,
            endDate,
        });

        this.logger.log(
            `Exporting ${logs.length} system logs in ${format} format`,
            'SystemLogsService',
        );

        switch (format) {
            case 'csv':
                return this.exportAsCSV(logs);
            case 'json':
                return this.exportAsJSON(logs);
            case 'pdf':
                return this.exportAsPDF(logs);
            default:
                return this.exportAsCSV(logs);
        }
    }

    /**
     * Export as CSV
     */
    private exportAsCSV(logs: any[]): Buffer {
        const headers = [
            'ID',
            'Timestamp',
            'User',
            'User ID',
            'Action',
            'Type',
            'IP Address',
            'Status',
        ];

        const rows = logs.map((log) => [
            log.id,
            log.createdAt.toISOString(),
            log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : 'System',
            log.userId || '',
            (log.description || log.event).replace(/,/g, ';'), // Escape commas
            log.eventType,
            log.ipAddress || '',
            log.status,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        return Buffer.from(csvContent, 'utf-8');
    }

    /**
     * Export as JSON
     */
    private exportAsJSON(logs: any[]): Buffer {
        const formattedLogs = logs.map((log) => ({
            id: log.id,
            timestamp: log.createdAt.toISOString(),
            user: log.user
                ? {
                    id: log.user.id,
                    name: `${log.user.firstName} ${log.user.lastName}`,
                    email: log.user.email,
                }
                : null,
            action: log.description || log.event,
            type: log.eventType,
            ipAddress: log.ipAddress,
            status: log.status,
            metadata: log.metadata,
            userAgent: log.userAgent,
        }));

        const jsonContent = JSON.stringify(
            {
                exportDate: new Date().toISOString(),
                totalRecords: logs.length,
                logs: formattedLogs,
            },
            null,
            2,
        );

        return Buffer.from(jsonContent, 'utf-8');
    }

    /**
     * Export as PDF (Simple text-based PDF for now)
     * TODO: Use a proper PDF library like pdfkit or puppeteer for better formatting
     */
    private exportAsPDF(logs: any[]): Buffer {
        // For now, create a simple text-based PDF content
        // In production, you'd use a library like pdfkit
        const pdfContent = `
System Logs Export
Generated: ${new Date().toISOString()}
Total Records: ${logs.length}

${'='.repeat(80)}

${logs
                .map(
                    (log, index) => `
${index + 1}. ${log.createdAt.toISOString()}
   User: ${log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
   Action: ${log.description || log.event}
   Type: ${log.eventType}
   Status: ${log.status}
   IP: ${log.ipAddress || 'N/A'}
   ${'-'.repeat(80)}
`,
                )
                .join('\n')}

${'='.repeat(80)}
End of Report
        `.trim();

        return Buffer.from(pdfContent, 'utf-8');
    }
}