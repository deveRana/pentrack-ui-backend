// src/admin/services/radmin.service.ts

import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { RAdminRepository } from '../repositories/radmin.repository';
import { SystemLogsRepository } from '../repositories/system-logs.repository';
import { MailService } from '@core/mail/mail.service';
import { CreateRAdminDto } from '../dto/create-radmin.dto';
import { UpdateRAdminDto } from '../dto/update-radmin.dto';
import { RAdminQueryDto } from '../dto/radmin-query.dto';
import { AccountStatus, SystemLogType, SystemLogStatus } from '@prisma/client';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import {
    RADMIN_ALLOWED_DOMAIN,
    DEFAULT_RADMIN_STATUS,
    ADMIN_ERROR_MESSAGES,
} from '../constants/admin.constants';
import { getEmailDomain } from '@auth/utils/auth.utils';
import { AppLogger } from '@core/logger/logger.service';

/**
 * R-Admin Service
 * Handles business logic for R-Admin CRUD operations
 */
@Injectable()
export class RAdminService {
    constructor(
        private readonly radminRepository: RAdminRepository,
        private readonly systemLogsRepository: SystemLogsRepository,
        private readonly mailService: MailService,
        private readonly logger: AppLogger,
    ) { }

    // ============================================
    // R-ADMIN CRUD OPERATIONS
    // ============================================

    /**
     * Get all R-Admins with pagination
     */
    async findAll(query: RAdminQueryDto) {
        const { page = 1, limit = 10, search } = query;

        const { radmins, total } = await this.radminRepository.findAllRAdmins({
            page,
            limit,
            search,
        });

        // Format response to match frontend types
        const formattedRAdmins = radmins.map((radmin) => ({
            id: radmin.id,
            firstName: radmin.firstName,
            lastName: radmin.lastName,
            name: `${radmin.firstName} ${radmin.lastName}`,
            email: radmin.email,
            phone: radmin.phone,
            status: radmin.status.toLowerCase() as 'active' | 'inactive',
            projects: radmin._count.managedProjects,
            createdAt: radmin.createdAt.toISOString(),
            updatedAt: radmin.updatedAt.toISOString(),
            createdBy: radmin.createdById,
            lastLogin: radmin.lastLogin?.toISOString(),
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: formattedRAdmins,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    /**
     * Get R-Admin by ID
     */
    async findOne(id: string) {
        const radmin = await this.radminRepository.findRAdminById(id);

        if (!radmin) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: ADMIN_ERROR_MESSAGES.RADMIN_NOT_FOUND,
            });
        }

        return {
            id: radmin.id,
            firstName: radmin.firstName,
            lastName: radmin.lastName,
            name: `${radmin.firstName} ${radmin.lastName}`,
            email: radmin.email,
            phone: radmin.phone,
            status: radmin.status.toLowerCase() as 'active' | 'inactive',
            createdAt: radmin.createdAt.toISOString(),
            updatedAt: radmin.updatedAt.toISOString(),
        };
    }

    /**
     * Create new R-Admin
     */
    async create(dto: CreateRAdminDto, adminId: string, ipAddress?: string) {
        // Validate email domain
        const emailDomain = getEmailDomain(dto.email);
        if (emailDomain !== RADMIN_ALLOWED_DOMAIN) {
            throw new BadRequestException({
                code: 'INVALID_EMAIL_DOMAIN',
                message: ADMIN_ERROR_MESSAGES.RADMIN_EMAIL_DOMAIN_INVALID,
            });
        }

        // Check if email already exists
        const existingByEmail = await this.radminRepository.findRAdminByEmail(dto.email);
        if (existingByEmail) {
            throw new ConflictException({
                code: ErrorCodes.EMAIL_ALREADY_EXISTS,
                message: ADMIN_ERROR_MESSAGES.RADMIN_EMAIL_EXISTS,
            });
        }

        // Check if phone already exists
        const existingByPhone = await this.radminRepository.findRAdminByPhone(dto.phone);
        if (existingByPhone) {
            throw new ConflictException({
                code: ErrorCodes.PHONE_ALREADY_EXISTS,
                message: ADMIN_ERROR_MESSAGES.RADMIN_PHONE_EXISTS,
            });
        }

        // Create R-Admin
        const radmin = await this.radminRepository.createRAdmin({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            companyDomain: RADMIN_ALLOWED_DOMAIN,
            status: dto.status || (DEFAULT_RADMIN_STATUS as AccountStatus),
            createdById: adminId,
        });

        // Log creation
        await this.systemLogsRepository.createLog({
            userId: adminId,
            event: 'R_ADMIN_CREATED',
            eventType: SystemLogType.CREATE,
            description: `Created R-Admin account for ${radmin.firstName} ${radmin.lastName} (${radmin.email})`,
            status: SystemLogStatus.SUCCESS,
            metadata: {
                radminId: radmin.id,
                email: radmin.email,
            },
            ipAddress,
        });

        // Send welcome email (async, don't block)
        this.mailService
            .sendRAdminWelcomeEmail(radmin.email, radmin.firstName, radmin.lastName)
            .catch((err) => {
                this.logger.error(
                    `Failed to send welcome email to ${radmin.email}`,
                    err,
                    'RAdminService',
                );
            });

        this.logger.log(
            `R-Admin created: ${radmin.email} by Admin: ${adminId}`,
            'RAdminService',
        );

        return {
            id: radmin.id,
            firstName: radmin.firstName,
            lastName: radmin.lastName,
            name: `${radmin.firstName} ${radmin.lastName}`,
            email: radmin.email,
            phone: radmin.phone,
            status: radmin.status.toLowerCase() as 'active' | 'inactive',
            createdAt: radmin.createdAt.toISOString(),
        };
    }

    /**
     * Update R-Admin
     */
    async update(
        id: string,
        dto: UpdateRAdminDto,
        adminId: string,
        ipAddress?: string,
    ) {
        // Check if R-Admin exists
        const existing = await this.radminRepository.findRAdminById(id);
        if (!existing) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: ADMIN_ERROR_MESSAGES.RADMIN_NOT_FOUND,
            });
        }

        // Check if phone is being changed and already exists
        if (dto.phone !== existing.phone) {
            const existingByPhone = await this.radminRepository.findRAdminByPhone(dto.phone);
            if (existingByPhone && existingByPhone.id !== id) {
                throw new ConflictException({
                    code: ErrorCodes.PHONE_ALREADY_EXISTS,
                    message: ADMIN_ERROR_MESSAGES.RADMIN_PHONE_EXISTS,
                });
            }
        }

        // Update R-Admin
        const radmin = await this.radminRepository.updateRAdmin(id, {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            status: dto.status || existing.status,
        });

        // Log update
        await this.systemLogsRepository.createLog({
            userId: adminId,
            event: 'R_ADMIN_UPDATED',
            eventType: SystemLogType.UPDATE,
            description: `Updated R-Admin account for ${radmin.firstName} ${radmin.lastName}`,
            status: SystemLogStatus.SUCCESS,
            metadata: {
                radminId: radmin.id,
                changes: dto,
            },
            ipAddress,
        });

        // Send update notification email (async)
        const updateDetails = this.buildUpdateDetailsText(existing, dto);
        this.mailService
            .sendRAdminUpdateEmail(radmin.email, radmin.firstName, updateDetails)
            .catch((err) => {
                this.logger.error(
                    `Failed to send update email to ${radmin.email}`,
                    err,
                    'RAdminService',
                );
            });

        this.logger.log(`R-Admin updated: ${radmin.email} by Admin: ${adminId}`, 'RAdminService');

        return {
            id: radmin.id,
            firstName: radmin.firstName,
            lastName: radmin.lastName,
            name: `${radmin.firstName} ${radmin.lastName}`,
            email: radmin.email,
            phone: radmin.phone,
            status: radmin.status.toLowerCase() as 'active' | 'inactive',
            updatedAt: radmin.updatedAt.toISOString(),
        };
    }

    /**
     * Delete R-Admin (soft delete)
     */
    async delete(id: string, adminId: string, ipAddress?: string) {
        // Check if R-Admin exists
        const existing = await this.radminRepository.findRAdminById(id);
        if (!existing) {
            throw new NotFoundException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: ADMIN_ERROR_MESSAGES.RADMIN_NOT_FOUND,
            });
        }

        // Soft delete
        await this.radminRepository.deleteRAdmin(id);

        // Log deletion
        await this.systemLogsRepository.createLog({
            userId: adminId,
            event: 'R_ADMIN_DELETED',
            eventType: SystemLogType.DELETE,
            description: `Deleted R-Admin account: ${existing.firstName} ${existing.lastName} (${existing.email})`,
            status: SystemLogStatus.SUCCESS,
            metadata: {
                radminId: id,
                email: existing.email,
            },
            ipAddress,
        });

        this.logger.log(
            `R-Admin deleted: ${existing.email} by Admin: ${adminId}`,
            'RAdminService',
        );

        return {
            message: 'R-Admin deleted successfully',
        };
    }

    /**
     * Get R-Admin statistics
     */
    async getStats() {
        const stats = await this.radminRepository.getRAdminStats();

        return {
            total: stats.total,
            active: stats.active,
            inactive: stats.inactive,
            totalProjects: stats.totalProjects,
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Build update details text for email
     */
    private buildUpdateDetailsText(existing: any, dto: UpdateRAdminDto): string {
        const changes: string[] = [];

        if (dto.firstName !== existing.firstName || dto.lastName !== existing.lastName) {
            changes.push(
                `Name changed from "${existing.firstName} ${existing.lastName}" to "${dto.firstName} ${dto.lastName}"`,
            );
        }

        if (dto.phone !== existing.phone) {
            changes.push(`Phone changed from "${existing.phone}" to "${dto.phone}"`);
        }

        if (dto.status && dto.status !== existing.status) {
            changes.push(
                `Status changed from "${existing.status}" to "${dto.status}"`,
            );
        }

        return changes.join('<br>');
    }
}