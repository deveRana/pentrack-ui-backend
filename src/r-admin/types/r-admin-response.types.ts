export interface RAdminDashboardStats {
    activeProjects: number;
    pendingReviews: number;
    overdueProjects: number;
    upcomingDeadlines: number;
}
export interface ClientListItem {
    id: string;
    companyName: string;
    industry: string;
    address: string;
    pointOfContact: string;
    pointOfContactEmail: string;
    pointOfContactPhone: string;
    totalProjects: number;
    activeProjects: number;
    status: string;
    createdAt: string;
}
export interface PentesterListItem {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    activeProjects: number;
    completedProjects: number;
    status: string;
    createdAt: string;
}
export interface ProjectListItem {
    id: string;
    name: string;
    client: string;
    services: string[];
    pentester: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    progress: number;
}