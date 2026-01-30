// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from '@core/database/prisma.module';
import { LoggerModule } from '@core/logger/logger.module';
import { RequestContextModule } from '@core/context/request-context.module';
import { MailModule } from '@core/mail/mail.module';

// CommonModule - Must be EARLY (before feature modules)
import { CommonModule } from './common/common.module';

// Feature modules
import { AuthModule } from './auth/auth.module';

// Middleware
import { RequestContextMiddleware } from '@core/context/request-context.middleware';
import { LoggerMiddleware } from '@core/logger/logger.middleware';

// Guards
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),

    // CommonModule MUST BE EARLY - Provides shared services globally
    CommonModule,

    // Core modules
    RequestContextModule,
    LoggerModule,
    PrismaModule,
    MailModule,

    // Feature modules
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}