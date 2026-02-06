import { Injectable } from '@nestjs/common';
import { RAdminReportsRepository } from '../repositories/r-admin-reports.repository';
@Injectable()
export class RAdminReportsService {
    constructor(private readonly reportsRepository: RAdminReportsRepository) { }
    async findAll(userId: string, query: any) {
        const { reports, total } = await this.reportsRepository.findAll({ radminId: userId, ...query });
        return { stats: { total }, data: reports, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNextPage: query.page < Math.ceil(total / query.limit), hasPreviousPage: query.page > 1 } };
    }
}