// src/client/client.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/database/prisma.module';
import { LoggerModule } from '@core/logger/logger.module';
import { AuthModule } from '@auth/auth.module';

// Controllers
import { ClientController } from './controllers/client.controller';
import { ClientProjectsController } from './controllers/client-projects.controller';
import { ClientReportsController } from './controllers/client-reports.controller';

// Services
import { ClientService } from './services/client.service';
import { ClientProjectsService } from './services/client-projects.service';
import { ClientReportsService } from './services/client-reports.service';

// Repositories
import { ClientRepository } from './repositories/client.repository';
import { ClientProjectsRepository } from './repositories/client-projects.repository';
import { ClientReportsRepository } from './repositories/client-reports.repository';

@Module({
    imports: [
        PrismaModule,
        LoggerModule,
        AuthModule,
    ],
    controllers: [
        ClientController,
        ClientProjectsController,
        ClientReportsController,
    ],
    providers: [
        ClientService,
        ClientProjectsService,
        ClientReportsService,
        ClientRepository,
        ClientProjectsRepository,
        ClientReportsRepository,
    ],
    exports: [
        ClientService,
        ClientProjectsService,
        ClientReportsService,
    ],
})
export class ClientModule { }