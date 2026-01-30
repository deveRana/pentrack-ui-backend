// src/admin/controllers/admin.controller.ts

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
import type { User } from '@prisma/client'; // ✅ FIXED: Use 'import type'
import { UserRole } from '@prisma/client';
import { AdminService } from '../services/admin.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { UpdateAdminProfileDto } from '../dto/update-admin-profile.dto';

/**
 * Admin Controller
 * Handles Admin (Super Admin) profile and dashboard endpoints
 * 
 * Base path: /admin
 */
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    // ============================================
    // PROFILE ENDPOINTS
    // ============================================

    /**
     * Get admin profile
     * GET /admin/profile
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(
        @CurrentUser() user: User,
        @Req() req: Request,
    ) {
        const profile = await this.adminService.getProfile(user.id);

        return this.responseBuilder.success(
            profile,
            undefined,
            req.url,
        );
    }

    /**
     * Update admin profile
     * PUT /admin/profile
     */
    @Put('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateAdminProfileDto,
        @Req() req: Request,
    ) {
        const updatedProfile = await this.adminService.updateProfile(user.id, dto);

        return this.responseBuilder.success(
            updatedProfile,
            'Profile updated successfully',
            req.url,
        );
    }

    // ============================================
    // DASHBOARD ENDPOINTS
    // ============================================

    /**
     * Get admin dashboard data
     * GET /admin/dashboard
     */
    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    async getDashboard(@Req() req: Request) {
        const dashboardData = await this.adminService.getDashboard();

        return this.responseBuilder.success(
            dashboardData,
            undefined,
            req.url,
        );
    }
}