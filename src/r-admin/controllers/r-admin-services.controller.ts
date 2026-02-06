import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminServicesService } from '../services/r-admin-services.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';

@Controller('r-admin/service-categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminServicesController {
    constructor(
        private readonly servicesService: RAdminServicesService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: Request) {
        const services = await this.servicesService.findAll();
        return this.responseBuilder.success(services, undefined, req.url);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const service = await this.servicesService.findOne(id);
        return this.responseBuilder.success(service, undefined, req.url);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateServiceCategoryDto,
        @Req() req: Request
    ) {
        const serviceCategory = await this.servicesService.create(dto, user.id);
        return this.responseBuilder.success(
            serviceCategory,
            'Service category created successfully',
            req.url
        );
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() dto: CreateServiceCategoryDto,
        @Req() req: Request
    ) {
        const serviceCategory = await this.servicesService.update(id, dto, user.id);
        return this.responseBuilder.success(
            serviceCategory,
            'Service category updated successfully',
            req.url
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: Request) {
        await this.servicesService.delete(id);
        return this.responseBuilder.success(
            null,
            'Service category deleted successfully',
            req.url
        );
    }
}