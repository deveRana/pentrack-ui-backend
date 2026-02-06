// src/r-admin/controllers/r-admin-projects.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
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
import { RAdminProjectsService } from '../services/r-admin-projects.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateProjectStatusDto } from '../dto/update-status.dto';
import { QueryDto } from '../dto/query.dto';

@Controller('r-admin/projects')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminProjectsController {
    constructor(
        private readonly projectsService: RAdminProjectsService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get all projects with pagination
     * GET /r-admin/projects
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @CurrentUser() user: User,
        @Query() query: QueryDto,
        @Req() req: Request
    ) {
        const result = await this.projectsService.findAll(user.id, query);
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
     * Get project by ID
     * GET /r-admin/projects/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const project = await this.projectsService.findOne(id);
        return this.responseBuilder.success(project, undefined, req.url);
    }

    /**
     * Create new project
     * POST /r-admin/projects
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateProjectDto,
        @Req() req: Request
    ) {
        const project = await this.projectsService.create(dto, user.id);
        return this.responseBuilder.success(
            project,
            'Project created successfully',
            req.url
        );
    }

    /**
     * Update project
     * PUT /r-admin/projects/:id
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
        @Req() req: Request
    ) {
        const project = await this.projectsService.update(id, dto);
        return this.responseBuilder.success(
            project,
            'Project updated successfully',
            req.url
        );
    }

    /**
     * Update project status
     * PATCH /r-admin/projects/:id/status
     */
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateProjectStatusDto,
        @Req() req: Request
    ) {
        const project = await this.projectsService.updateStatus(id, dto.status, dto.notes);
        return this.responseBuilder.success(
            project,
            'Project status updated successfully',
            req.url
        );
    }

    /**
     * Delete project (soft delete)
     * DELETE /r-admin/projects/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: Request) {
        await this.projectsService.delete(id);
        return this.responseBuilder.success(
            null,
            'Project deleted successfully',
            req.url
        );
    }
}