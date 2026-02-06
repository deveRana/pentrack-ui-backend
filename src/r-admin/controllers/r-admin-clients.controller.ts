import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
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
import { QueryDto } from '../dto/query.dto';
@Controller('r-admin/clients')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminClientsController {
    constructor(private readonly clientsService: RAdminClientsService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryDto, @Req() req: Request) {
        const result = await this.clientsService.findAll(query);
        return this.responseBuilder.success({ stats: result.stats, data: result.data }, undefined, req.url);
    }
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@CurrentUser() user: User, @Body() dto: CreateClientDto, @Req() req: Request) {
        const client = await this.clientsService.create(dto, user.id);
        return this.responseBuilder.success(client, 'Client created successfully', req.url);
    }
}