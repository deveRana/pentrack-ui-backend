import { Injectable } from '@nestjs/common';
import { RAdminServicesRepository } from '../repositories/r-admin-services.repository';
@Injectable()
export class RAdminServicesService {
    constructor(private readonly servicesRepository: RAdminServicesRepository) { }
    async findAll() {
        return this.servicesRepository.findAll();
    }
}