import { Injectable } from '@nestjs/common';
import { RAdminPartnersRepository } from '../repositories/r-admin-partners.repository';
@Injectable()
export class RAdminPartnersService {
    constructor(private readonly partnersRepository: RAdminPartnersRepository) { }
    async findAll(query: any) {
        const { partners, total } = await this.partnersRepository.findAll(query);
        return { stats: { total }, data: partners, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), hasNextPage: query.page < Math.ceil(total / query.limit), hasPreviousPage: query.page > 1 } };
    }
}