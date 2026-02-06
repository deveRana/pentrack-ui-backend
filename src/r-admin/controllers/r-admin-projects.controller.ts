import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
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
import { QueryDto } from '../dto/query.dto';
@Controller('r-admin/projects')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminProjectsController {
    constructor(private readonly projectsService: RAdminProjectsService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@CurrentUser() user: User, @Query() query: QueryDto, @Req() req: Request) {
        const result = await this.projectsService.findAll(user.id, query);
        return this.responseBuilder.success({ stats: result.stats, data: result.data }, undefined, req.url);
    }
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@CurrentUser() user: User, @Body() dto: CreateProjectDto, @Req() req: Request) {
        const project = await this.projectsService.create(dto, user.id);
        return this.responseBuilder.success(project, 'Project created successfully', req.url);
    }
}