import { Controller, Get, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminReviewsService } from '../services/r-admin-reviews.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
@Controller('r-admin/reviews')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminReviewsController {
    constructor(private readonly reviewsService: RAdminReviewsService, private readonly responseBuilder: ResponseBuilder) { }
    @Get('pending')
    @HttpCode(HttpStatus.OK)
    async getPendingReviews(@CurrentUser() user: User, @Req() req: Request) {
        const reviews = await this.reviewsService.getPendingReviews(user.id);
        return this.responseBuilder.success(reviews, undefined, req.url);
    }
}