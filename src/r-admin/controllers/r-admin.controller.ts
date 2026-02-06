import { Controller, Get, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminService } from '../services/r-admin.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
@Controller('r-admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminController {
    constructor(private readonly radminService: RAdminService, private readonly responseBuilder: ResponseBuilder) { }
    @Get('dashboard')
    @HttpCode(HttpStatus.OK)
    async getDashboard(@CurrentUser() user: User, @Req() req: Request) {
        const dashboard = await this.radminService.getDashboard(user.id);
        return this.responseBuilder.success(dashboard, undefined, req.url);
    }
}