import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/database/prisma.module';
import { MailModule } from '@core/mail/mail.module';
import { LoggerModule } from '@core/logger/logger.module';
import { AuthModule } from '@auth/auth.module';

import { RAdminController } from './controllers/r-admin.controller';
import { RAdminProjectsController } from './controllers/r-admin-projects.controller';
import { RAdminReportsController } from './controllers/r-admin-reports.controller';
import { RAdminClientsController } from './controllers/r-admin-clients.controller';
import { RAdminPentestersController } from './controllers/r-admin-pentesters.controller';
import { RAdminPartnersController } from './controllers/r-admin-partners.controller';
import { RAdminServicesController } from './controllers/r-admin-services.controller';
import { RAdminChecksController } from './controllers/r-admin-checks.controller';
import { RAdminReviewsController } from './controllers/r-admin-reviews.controller';

import { RAdminService } from './services/r-admin.service';
import { RAdminProjectsService } from './services/r-admin-projects.service';
import { RAdminReportsService } from './services/r-admin-reports.service';
import { RAdminClientsService } from './services/r-admin-clients.service';
import { RAdminPentestersService } from './services/r-admin-pentesters.service';
import { RAdminPartnersService } from './services/r-admin-partners.service';
import { RAdminServicesService } from './services/r-admin-services.service';
import { RAdminChecksService } from './services/r-admin-checks.service';
import { RAdminReviewsService } from './services/r-admin-reviews.service';

import { RAdminRepository } from './repositories/r-admin.repository';
import { RAdminProjectsRepository } from './repositories/r-admin-projects.repository';
import { RAdminReportsRepository } from './repositories/r-admin-reports.repository';
import { RAdminClientsRepository } from './repositories/r-admin-clients.repository';
import { RAdminPentestersRepository } from './repositories/r-admin-pentesters.repository';
import { RAdminPartnersRepository } from './repositories/r-admin-partners.repository';
import { RAdminServicesRepository } from './repositories/r-admin-services.repository';
import { RAdminChecksRepository } from './repositories/r-admin-checks.repository';

@Module({
    imports: [PrismaModule, MailModule, LoggerModule, AuthModule],
    controllers: [
        RAdminController,
        RAdminProjectsController,
        RAdminReportsController,
        RAdminClientsController,
        RAdminPentestersController,
        RAdminPartnersController,
        RAdminServicesController,
        RAdminChecksController,
        RAdminReviewsController,
    ],
    providers: [
        RAdminService,
        RAdminProjectsService,
        RAdminReportsService,
        RAdminClientsService,
        RAdminPentestersService,
        RAdminPartnersService,
        RAdminServicesService,
        RAdminChecksService,
        RAdminReviewsService,
        RAdminRepository,
        RAdminProjectsRepository,
        RAdminReportsRepository,
        RAdminClientsRepository,
        RAdminPentestersRepository,
        RAdminPartnersRepository,
        RAdminServicesRepository,
        RAdminChecksRepository,
    ],
})
export class RAdminModule { }