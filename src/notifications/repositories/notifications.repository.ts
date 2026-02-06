import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class NotificationsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: any) {
        const { userId, page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where: any = { userId };

        if (status === 'unread') where.read = false;
        if (status === 'read') where.read = true;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.notification.count({ where }),
        ]);

        return { notifications, total };
    }

    async getStats(userId: string) {
        const [totalCount, unreadCount] = await Promise.all([
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, read: false } }),
        ]);

        return { totalCount, unreadCount, readCount: totalCount - unreadCount };
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.prisma.notification.update({
            where: { id: notificationId, userId },
            data: { read: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, readAt: new Date() },
        });
    }
}