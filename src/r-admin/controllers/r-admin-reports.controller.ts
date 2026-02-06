import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminReportsService } from '../services/r-admin-reports.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { QueryDto } from '../dto/query.dto';
@Controller('r-admin/reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminReportsController {
    constructor(private readonly reportsService: RAdminReportsService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@CurrentUser() user: User, @Query() query: QueryDto, @Req() req: Request) {
        const result = await this.reportsService.findAll(user.id, query);
        return this.responseBuilder.success({ stats: result.stats, data: result.data }, undefined, req.url);
    }
}