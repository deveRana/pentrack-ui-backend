// src/admin/controllers/radmin.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client'; // ✅ FIXED: Use 'import type'
import { UserRole } from '@prisma/client';
import { RAdminService } from '../services/radmin.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreateRAdminDto } from '../dto/create-radmin.dto';
import { UpdateRAdminDto } from '../dto/update-radmin.dto';
import { RAdminQueryDto } from '../dto/radmin-query.dto';
import { sanitizeIpAddress } from '@auth/utils/auth.utils';

/**
 * R-Admin Controller
 * Handles R-Admin CRUD operations
 * 
 * Base path: /admin/r-admins
 */
@Controller('admin/r-admins')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RAdminController {
    constructor(
        private readonly radminService: RAdminService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    // ============================================
    // R-ADMIN CRUD ENDPOINTS
    // ============================================

    /**
     * Get all R-Admins with pagination and search
     * GET /admin/r-admins
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query() query: RAdminQueryDto,
        @Req() req: Request,
    ) {
        const result = await this.radminService.findAll(query);

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
     * Get R-Admin statistics
     * GET /admin/r-admins/stats
     */
    @Get('stats')
    @HttpCode(HttpStatus.OK)
    async getStats(@Req() req: Request) {
        const stats = await this.radminService.getStats();

        return this.responseBuilder.success(
            stats,
            undefined,
            req.url,
        );
    }

    /**
     * Get R-Admin by ID
     * GET /admin/r-admins/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const radmin = await this.radminService.findOne(id);

        return this.responseBuilder.success(
            radmin,
            undefined,
            req.url,
        );
    }

    /**
     * Create new R-Admin
     * POST /admin/r-admins
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateRAdminDto,
        @Req() req: Request,
    ) {
        const ipAddress = sanitizeIpAddress(req.ip);
        const radmin = await this.radminService.create(dto, user.id, ipAddress);

        return this.responseBuilder.success(
            radmin,
            'R-Admin account created successfully. Welcome email sent.',
            req.url,
        );
    }

    /**
     * Update R-Admin
     * PUT /admin/r-admins/:id
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateRAdminDto,
        @Req() req: Request,
    ) {
        const ipAddress = sanitizeIpAddress(req.ip);
        const radmin = await this.radminService.update(id, dto, user.id, ipAddress);

        return this.responseBuilder.success(
            radmin,
            'R-Admin updated successfully',
            req.url,
        );
    }

    /**
     * Delete R-Admin
     * DELETE /admin/r-admins/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Req() req: Request,
    ) {
        const ipAddress = sanitizeIpAddress(req.ip);
        const result = await this.radminService.delete(id, user.id, ipAddress);

        return this.responseBuilder.success(
            result,
            'R-Admin deleted successfully',
            req.url,
        );
    }
}