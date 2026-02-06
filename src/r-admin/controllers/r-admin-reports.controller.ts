// src/r-admin/controllers/r-admin-reports.controller.ts

import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminReportsService } from '../services/r-admin-reports.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { QueryDto } from '../dto/query.dto';

@Controller('r-admin/reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminReportsController {
    constructor(
        private readonly reportsService: RAdminReportsService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get all reports with pagination
     * GET /r-admin/reports
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @CurrentUser() user: User,
        @Query() query: QueryDto,
        @Req() req: Request
    ) {
        const result = await this.reportsService.findAll(user.id, query);
        return this.responseBuilder.success(
            {
                stats: result.stats,
                data: result.data,
                pagination: result.pagination
            },
            undefined,
            req.url
        );
    }

    /**
     * Get report by ID
     * GET /r-admin/reports/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const report = await this.reportsService.findOne(id);
        return this.responseBuilder.success(report, undefined, req.url);
    }

    /**
     * Upload report
     * POST /r-admin/reports/upload
     */
    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @CurrentUser() user: User,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() req: Request
    ) {
        const report = await this.reportsService.upload(file, body, user.id);
        return this.responseBuilder.success(
            report,
            'Report uploaded successfully',
            req.url
        );
    }
}