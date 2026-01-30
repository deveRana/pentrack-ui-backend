// src/admin/admin.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/database/prisma.module';
import { MailModule } from '@core/mail/mail.module';
import { LoggerModule } from '@core/logger/logger.module';
import { AuthModule } from '@auth/auth.module'; // ✅ ADDED: Import AuthModule for guards

// Controllers
import { AdminController } from './controllers/admin.controller';
import { RAdminController } from './controllers/radmin.controller';
import { SystemLogsController } from './controllers/system-logs.controller';

// Services
import { AdminService } from './services/admin.service';
import { RAdminService } from './services/radmin.service';
import { SystemLogsService } from './services/system-logs.service';

// Repositories
import { AdminRepository } from './repositories/admin.repository';
import { RAdminRepository } from './repositories/radmin.repository';
import { SystemLogsRepository } from './repositories/system-logs.repository';

/**
 * Admin Module
 * 
 * Handles all Super Admin operations:
 * - Admin profile management
 * - Admin dashboard
 * - R-Admin CRUD operations
 * - System logs viewing and export
 * 
 * Routes:
 * - GET    /admin/profile          - Get admin profile
 * - PUT    /admin/profile          - Update admin profile
 * - GET    /admin/dashboard        - Get dashboard data
 * - GET    /admin/r-admins         - List all R-Admins
 * - GET    /admin/r-admins/stats   - Get R-Admin statistics
 * - GET    /admin/r-admins/:id     - Get R-Admin by ID
 * - POST   /admin/r-admins         - Create R-Admin
 * - PUT    /admin/r-admins/:id     - Update R-Admin
 * - DELETE /admin/r-admins/:id     - Delete R-Admin
 * - GET    /admin/logs             - List system logs
 * - GET    /admin/logs/export      - Export system logs
 */
@Module({
    imports: [
        PrismaModule,
        MailModule,
        LoggerModule,
        AuthModule, // ✅ ADDED: Required for AuthGuard and RolesGuard
    ],
    controllers: [
        AdminController,
        RAdminController,
        SystemLogsController,
    ],
    providers: [
        // Services
        AdminService,
        RAdminService,
        SystemLogsService,

        // Repositories
        AdminRepository,
        RAdminRepository,
        SystemLogsRepository,
    ],
    exports: [
        // Export services in case other modules need them
        AdminService,
        RAdminService,
        SystemLogsService,
    ],
})
export class AdminModule { }