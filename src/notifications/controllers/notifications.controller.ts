import { Controller, Get, Patch, Param, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { NotificationsService } from '../services/notifications.service';
import { AuthGuard } from '@auth/guards/auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { NotificationQueryDto } from '../dto/notification-query.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @CurrentUser() user: User,
        @Query() query: NotificationQueryDto,
        @Req() req: Request,
    ) {
        const result = await this.notificationsService.findAll(user.id, query);
        return this.responseBuilder.success({ stats: result.stats, data: result.data }, undefined, req.url);
    }

    @Patch(':id/read')
    @HttpCode(HttpStatus.OK)
    async markAsRead(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const result = await this.notificationsService.markAsRead(user.id, id);
        return this.responseBuilder.success(result, result.message, req.url);
    }

    @Patch('mark-all-read')
    @HttpCode(HttpStatus.OK)
    async markAllAsRead(
        @CurrentUser() user: User,
        @Req() req: Request,
    ) {
        const result = await this.notificationsService.markAllAsRead(user.id);
        return this.responseBuilder.success(result, result.message, req.url);
    }
}