// src/client/controllers/client-projects.controller.ts

import { Controller, Get, Param, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { ClientProjectsService } from '../services/client-projects.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { ClientProjectQueryDto } from '../dto/client-query.dto';

@Controller('client/projects')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientProjectsController {
    constructor(
        private readonly clientProjectsService: ClientProjectsService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @CurrentUser() user: User,
        @Query() query: ClientProjectQueryDto,
        @Req() req: Request,
    ) {
        const result = await this.clientProjectsService.findAll(user.id, query);

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
        const stats = await this.clientProjectsService.getStats(user.id);
        return this.responseBuilder.success(stats, undefined, req.url);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const project = await this.clientProjectsService.findOne(user.id, id);
        return this.responseBuilder.success(project, undefined, req.url);
    }
}