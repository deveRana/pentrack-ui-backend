import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { RAdminPartnersService } from '../services/r-admin-partners.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { QueryDto } from '../dto/query.dto';
@Controller('r-admin/partners')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminPartnersController {
    constructor(private readonly partnersService: RAdminPartnersService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryDto, @Req() req: Request) {
        const result = await this.partnersService.findAll(query);
        return this.responseBuilder.success({ stats: result.stats, data: result.data }, undefined, req.url);
    }
}