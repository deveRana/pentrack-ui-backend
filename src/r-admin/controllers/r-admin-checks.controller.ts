import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { RAdminChecksService } from '../services/r-admin-checks.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { CreateCheckDto, UpdateCheckDto } from '../dto/create-check.dto';

@Controller('r-admin/checks')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.R_ADMIN)
export class RAdminChecksController {
    constructor(
        private readonly checksService: RAdminChecksService,
        private readonly responseBuilder: ResponseBuilder
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: Request) {
        const checks = await this.checksService.findAll();
        return this.responseBuilder.success(checks, undefined, req.url);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Req() req: Request) {
        const check = await this.checksService.findOne(id);
        return this.responseBuilder.success(check, undefined, req.url);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateCheckDto,
        @Req() req: Request
    ) {
        const check = await this.checksService.create(dto, user.id);
        return this.responseBuilder.success(
            check,
            'Security check created successfully',
            req.url
        );
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCheckDto,
        @Req() req: Request
    ) {
        const check = await this.checksService.update(id, dto);
        return this.responseBuilder.success(
            check,
            'Security check updated successfully',
            req.url
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: Request) {
        await this.checksService.delete(id);
        return this.responseBuilder.success(
            null,
            'Security check deleted successfully',
            req.url
        );
    }
}