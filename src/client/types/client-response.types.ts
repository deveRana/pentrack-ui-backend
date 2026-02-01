// src/client/types/client-response.types.ts

export interface ClientProfileResponse {
    id: string;
    clientId: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
    userType: 'client' | 'partner';
    pointOfContact: string;
    pointOfContactEmail: string;
    pointOfContactPhone: string;
    joinedDate: string;
    totalProjects: number;
    activeProjects: number;
}

export interface ClientDashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalReports: number;
}

export interface ClientQuickStats {
    projectsThisYear: number;
    successRate: number;
    avgCompletion: string;
}

export interface ClientProjectListItem {
    id: string;
    name: string;
    client: string;
    service: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    dueDate: string;
    pentester: string;
    pentesterEmail: string;
    description: string;
    hasReport: boolean;
}

export interface ProjectTimeline {
    id: string;
    status: string;
    date: string | null;
    completed: boolean;
    description: string;
}

export interface ProjectReport {
    id: string;
    version: string;
    publishedDate: string;
    fileSize: string;
    fileName: string;
}

export interface ClientProjectDetails extends ClientProjectListItem {
    scopeOfWork: string;
    objectives: string;
    targetUrls: string;
    priority: string;
    timeline: ProjectTimeline[];
    reports: ProjectReport[];
}

export interface ClientReportListItem {
    id: string;
    projectName: string;
    projectId: string;
    service: string;
    version: string;
    publishedDate: string;
    fileSize: string;
    fileName: string;
    description: string;
}

export interface ClientDashboardResponse {
    stats: ClientDashboardStats;
    recentProjects: ClientProjectListItem[];
    recentReports: ClientReportListItem[];
    quickStats: ClientQuickStats;
}

export interface ClientProjectsStatsResponse {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    notStarted: number;
    inProgress: number;
    underReview: number;
}

export interface ClientReportsStatsResponse {
    totalReports: number;
    thisMonth: number;
    thisYear: number;
}