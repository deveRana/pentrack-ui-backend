import { Injectable } from '@nestjs/common';
import { RAdminChecksRepository } from '../repositories/r-admin-checks.repository';
@Injectable()
export class RAdminChecksService {
    constructor(private readonly checksRepository: RAdminChecksRepository) { }
    async findAll() {
        return this.checksRepository.findAll();
    }
}