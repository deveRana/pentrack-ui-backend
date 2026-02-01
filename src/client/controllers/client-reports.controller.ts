// src/client/controllers/client-reports.controller.ts

import { Controller, Get, Param, Query, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { ClientReportsService } from '../services/client-reports.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { ClientReportQueryDto } from '../dto/client-query.dto';

@Controller('client/reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientReportsController {
    constructor(
        private readonly clientReportsService: ClientReportsService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @CurrentUser() user: User,
        @Query() query: ClientReportQueryDto,
        @Req() req: Request,
    ) {
        const result = await this.clientReportsService.findAll(user.id, query);

        return this.responseBuilder.success(
            {
                stats: result.stats,
                data: result.data,
            },
            undefined,
            req.url,
        );
    }

    @Get('stats')
    @HttpCode(HttpStatus.OK)
    async getStats(@CurrentUser() user: User, @Req() req: Request) {
        const stats = await this.clientReportsService.getStats(user.id);
        return this.responseBuilder.success(stats, undefined, req.url);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const report = await this.clientReportsService.findOne(user.id, id);
        return this.responseBuilder.success(report, undefined, req.url);
    }

    @Get(':id/download')
    @HttpCode(HttpStatus.OK)
    async downloadReport(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const { fileUrl, fileName } = await this.clientReportsService.downloadReport(user.id, id);
        res.redirect(fileUrl);
    }
}