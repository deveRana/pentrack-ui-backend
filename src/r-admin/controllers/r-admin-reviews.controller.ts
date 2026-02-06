// src/r-admin/controllers/r-admin-reviews.controller.ts

import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminReviewsService } from '../services/r-admin-reviews.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { ApproveReportDto } from '../dto/approve-report.dto';
import { RejectReportDto } from '../dto/reject-report.dto';

@Controller('r-admin/reviews')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminReviewsController {
    constructor(
        private readonly reviewsService: RAdminReviewsService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get pending reviews
     * GET /r-admin/reviews/pending
     */
    @Get('pending')
    @HttpCode(HttpStatus.OK)
    async getPendingReviews(
        @CurrentUser() user: User,
        @Req() req: Request
    ) {
        const reviews = await this.reviewsService.getPendingReviews(user.id);
        return this.responseBuilder.success(reviews, undefined, req.url);
    }

    /**
     * Approve report
     * POST /r-admin/reviews/:id/approve
     */
    @Post(':id/approve')
    @HttpCode(HttpStatus.OK)
    async approveReport(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() dto: ApproveReportDto,
        @Req() req: Request
    ) {
        const report = await this.reviewsService.approveReport(id, dto, user.id);
        return this.responseBuilder.success(
            report,
            'Report approved successfully',
            req.url
        );
    }

    /**
     * Reject report
     * POST /r-admin/reviews/:id/reject
     */
    @Post(':id/reject')
    @HttpCode(HttpStatus.OK)
    async rejectReport(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() dto: RejectReportDto,
        @Req() req: Request
    ) {
        const report = await this.reviewsService.rejectReport(id, dto, user.id);
        return this.responseBuilder.success(
            report,
            'Report rejected successfully',
            req.url
        );
    }
}