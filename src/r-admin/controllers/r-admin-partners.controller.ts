// src/r-admin/controllers/r-admin-partners.controller.ts

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
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminPartnersService } from '../services/r-admin-partners.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto/create-partner.dto';
import { QueryDto } from '../dto/query.dto';

@Controller('r-admin/partners')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminPartnersController {
    constructor(
        private readonly partnersService: RAdminPartnersService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get all partners with pagination
     * GET /r-admin/partners
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryDto, @Req() req: Request) {
        const result = await this.partnersService.findAll(query);
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
     * Get partner by ID
     * GET /r-admin/partners/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const partner = await this.partnersService.findOne(id);
        return this.responseBuilder.success(partner, undefined, req.url);
    }

    /**
     * Create new partner
     * POST /r-admin/partners
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreatePartnerDto,
        @Req() req: Request
    ) {
        const partner = await this.partnersService.create(dto, user.id);
        return this.responseBuilder.success(
            partner,
            'Partner created successfully',
            req.url
        );
    }

    /**
     * Update partner
     * PUT /r-admin/partners/:id
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePartnerDto,
        @Req() req: Request
    ) {
        const partner = await this.partnersService.update(id, dto);
        return this.responseBuilder.success(
            partner,
            'Partner updated successfully',
            req.url
        );
    }

    /**
     * Delete partner (soft delete)
     * DELETE /r-admin/partners/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: Request) {
        await this.partnersService.delete(id);
        return this.responseBuilder.success(
            null,
            'Partner deleted successfully',
            req.url
        );
    }
}