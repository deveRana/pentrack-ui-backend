// src/common/common.module.ts

import { Global, Module } from '@nestjs/common';
import { HashService } from './services/hash.service';
import { TokenService } from './services/token.service';
import { ResponseBuilder } from './utils/response-builder.util';
import { RequestContextModule } from '@core/context/request-context.module';
import { PrismaModule } from '@core/database/prisma.module';

/**
 * Common Module
 * 
 * Provides shared services and utilities across the entire application
 * Marked as @Global so these services are available everywhere without importing
 */
@Global()
@Module({
    imports: [
        RequestContextModule, // For ResponseBuilder
        PrismaModule, // For TokenService
    ],
    providers: [
        HashService,
        TokenService,
        ResponseBuilder,
    ],
    exports: [
        HashService,
        TokenService,
        ResponseBuilder,
    ],
})
export class CommonModule { }