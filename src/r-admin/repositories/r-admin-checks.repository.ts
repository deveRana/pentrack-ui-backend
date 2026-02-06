import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
@Injectable()
export class RAdminChecksRepository {
    constructor(private readonly prisma: PrismaService) { }
    async findAll() {
        return this.prisma.securityCheck.findMany();
    }
}