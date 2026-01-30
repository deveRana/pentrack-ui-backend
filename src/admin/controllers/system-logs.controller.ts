// src/admin/controllers/system-logs.controller.ts

import {
    Controller,
    Get,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
    Res,
    StreamableFile,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SystemLogsService } from '../services/system-logs.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { SystemLogQueryDto, ExportLogsQueryDto } from '../dto/system-log-query.dto';
import { UserRole } from '@prisma/client';

/**
 * System Logs Controller
 * Handles system logs viewing and export
 * 
 * Base path: /admin/logs
 */
@Controller('admin/logs')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SystemLogsController {
    constructor(
        private readonly logsService: SystemLogsService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    // ============================================
    // SYSTEM LOGS ENDPOINTS
    // ============================================

    /**
     * Get all system logs with pagination and filters
     * GET /admin/logs
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query() query: SystemLogQueryDto,
        @Req() req: Request,
    ) {
        const result = await this.logsService.findAll(query);

        // ✅ FIXED: Add hasNextPage and hasPreviousPage to pagination metadata
        return this.responseBuilder.paginated(
            result.data,
            {
                ...result.pagination,
                hasNextPage: result.pagination.page < result.pagination.totalPages,
                hasPreviousPage: result.pagination.page > 1,
            },
            undefined,
            req.url,
        );
    }

    /**
     * Export system logs
     * GET /admin/logs/export
     * 
     * Query params:
     * - format: 'csv' | 'json' | 'pdf' (default: 'csv')
     * - type, status, userId, searchQuery, startDate, endDate (filters)
     */
    @Get('export')
    @HttpCode(HttpStatus.OK)
    async exportLogs(
        @Query() query: ExportLogsQueryDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const format = query.format || 'csv';
        const buffer = await this.logsService.exportLogs(query);

        // Set response headers
        const filename = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        const contentType = this.getContentType(format);

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });

        return new StreamableFile(buffer);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get content type based on export format
     */
    private getContentType(format: string): string {
        switch (format) {
            case 'csv':
                return 'text/csv';
            case 'json':
                return 'application/json';
            case 'pdf':
                return 'application/pdf';
            default:
                return 'text/plain';
        }
    }
}