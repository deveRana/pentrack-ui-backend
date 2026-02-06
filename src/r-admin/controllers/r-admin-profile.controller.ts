// src/r-admin/controllers/r-admin-profile.controller.ts

import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminProfileService } from '../services/r-admin-profile.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { UpdateRAdminProfileDto } from '../dto/update-profile.dto';

@Controller('r-admin/profile')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminProfileController {
    constructor(
        private readonly profileService: RAdminProfileService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get R-Admin profile
     * GET /r-admin/profile
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async getProfile(
        @CurrentUser() user: User,
        @Req() req: Request
    ) {
        const profile = await this.profileService.getProfile(user.id);
        return this.responseBuilder.success(profile, undefined, req.url);
    }

    /**
     * Update R-Admin profile
     * PUT /r-admin/profile
     */
    @Put()
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateRAdminProfileDto,
        @Req() req: Request
    ) {
        const profile = await this.profileService.updateProfile(user.id, dto);
        return this.responseBuilder.success(
            profile,
            'Profile updated successfully',
            req.url
        );
    }
}