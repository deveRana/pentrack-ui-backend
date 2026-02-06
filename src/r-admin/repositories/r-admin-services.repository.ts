import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminServicesRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll() {
        return this.prisma.serviceCategory.findMany({ include: { subServices: true } });
    }
}