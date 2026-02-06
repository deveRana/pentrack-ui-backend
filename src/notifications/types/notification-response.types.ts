export interface NotificationResponse {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    link: string;
}

export interface NotificationStats {
    totalCount: number;
    unreadCount: number;
    readCount: number;
}