import { Controller, Get, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { RAdminChecksService } from '../services/r-admin-checks.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
@Controller('r-admin/checks')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminChecksController {
    constructor(private readonly checksService: RAdminChecksService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: Request) {
        const checks = await this.checksService.findAll();
        return this.responseBuilder.success(checks, undefined, req.url);
    }
}