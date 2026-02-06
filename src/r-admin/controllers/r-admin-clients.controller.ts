// src/r-admin/controllers/r-admin-clients.controller.ts

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
import { RAdminClientsService } from '../services/r-admin-clients.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { QueryDto } from '../dto/query.dto';

@Controller('r-admin/clients')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminClientsController {
    constructor(
        private readonly clientsService: RAdminClientsService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    /**
     * Get all clients with pagination
     * GET /r-admin/clients
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryDto, @Req() req: Request) {
        const result = await this.clientsService.findAll(query);
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
     * Get client by ID
     * GET /r-admin/clients/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const client = await this.clientsService.findOne(id);
        return this.responseBuilder.success(client, undefined, req.url);
    }

    /**
     * Create new client
     * POST /r-admin/clients
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateClientDto,
        @Req() req: Request
    ) {
        const client = await this.clientsService.create(dto, user.id);
        return this.responseBuilder.success(
            client,
            'Client created successfully',
            req.url
        );
    }

    /**
     * Update client
     * PUT /r-admin/clients/:id
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateClientDto,
        @Req() req: Request
    ) {
        const client = await this.clientsService.update(id, dto);
        return this.responseBuilder.success(
            client,
            'Client updated successfully',
            req.url
        );
    }

    /**
     * Delete client (soft delete)
     * DELETE /r-admin/clients/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: Request) {
        await this.clientsService.delete(id);
        return this.responseBuilder.success(
            null,
            'Client deleted successfully',
            req.url
        );
    }
}