// src/client/controllers/client.controller.ts

import { Controller, Get, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { ClientService } from '../services/client.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';

@Controller('client')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientController {
    constructor(
        private readonly clientService: ClientService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@CurrentUser() user: User, @Req() req: Request) {
        const profile = await this.clientService.getProfile(user.id);
        return this.responseBuilder.success(profile, undefined, req.url);
    }

    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    async getDashboard(@CurrentUser() user: User, @Req() req: Request) {
        const dashboard = await this.clientService.getDashboard(user.id);
        return this.responseBuilder.success(dashboard, undefined, req.url);
    }
}