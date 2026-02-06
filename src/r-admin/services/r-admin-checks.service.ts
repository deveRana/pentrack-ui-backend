import { Injectable, NotFoundException } from '@nestjs/common';
import { RAdminChecksRepository } from '../repositories/r-admin-checks.repository';
import { CreateCheckDto, UpdateCheckDto } from '../dto/create-check.dto';

@Injectable()
export class RAdminChecksService {
    constructor(private readonly checksRepository: RAdminChecksRepository) { }

    async findAll() {
        return this.checksRepository.findAll();
    }

    async findOne(id: string) {
        const check = await this.checksRepository.findOne(id);
        if (!check) {
            throw new NotFoundException(`Security check with ID ${id} not found`);
        }
        return check;
    }

    async create(dto: CreateCheckDto, createdById: string) {
        return this.checksRepository.create(dto, createdById);
    }

    async update(id: string, dto: UpdateCheckDto) {
        await this.findOne(id);
        return this.checksRepository.update(id, dto);
    }

    async delete(id: string) {
        await this.findOne(id);
        return this.checksRepository.delete(id);
    }
}