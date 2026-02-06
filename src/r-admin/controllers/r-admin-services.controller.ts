import { Controller, Get, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { RAdminServicesService } from '../services/r-admin-services.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
@Controller('r-admin/service-categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminServicesController {
    constructor(private readonly servicesService: RAdminServicesService, private readonly responseBuilder: ResponseBuilder) { }
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: Request) {
        const services = await this.servicesService.findAll();
        return this.responseBuilder.success(services, undefined, req.url);
    }
}