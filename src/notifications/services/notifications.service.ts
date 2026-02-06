import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsRepository: NotificationsRepository) { }

    async findAll(userId: string, query: any) {
        const { notifications, total } = await this.notificationsRepository.findAll({ userId, ...query });
        const stats = await this.notificationsRepository.getStats(userId);

        const data = notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: this.getRelativeTime(n.createdAt),
            read: n.read,
            link: n.link || '',
        }));

        return {
            stats,
            data,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
                hasNextPage: query.page < Math.ceil(total / query.limit),
                hasPreviousPage: query.page > 1,
            },
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        await this.notificationsRepository.markAsRead(notificationId, userId);
        return { message: 'Notification marked as read' };
    }

    async markAllAsRead(userId: string) {
        await this.notificationsRepository.markAllAsRead(userId);
        return { message: 'All notifications marked as read' };
    }

    private getRelativeTime(date: Date): string {
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + ' minutes ago';
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return diffHours + ' hours ago';
        return Math.floor(diffHours / 24) + ' days ago';
    }
}