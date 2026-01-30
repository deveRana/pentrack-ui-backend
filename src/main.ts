// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from '@core/logger/logger.service';
import { LoggerInterceptor } from '@core/logger/logger.interceptor';
import { GlobalExceptionFilter } from '@core/filters/global-exception.filter';
import { ValidationExceptionFilter } from '@core/filters/validation-exception.filter';
import { ResponseInterceptor } from '@core/interceptors/response.interceptor';
import { TimeoutInterceptor } from '@core/interceptors/timeout.interceptor';
import { RequestContextService } from '@core/context/request-context.service';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';

/**
 * Flatten nested validation errors into a single array
 */
function flattenValidationErrors(errors: ValidationError[]): string[] {
  const result: string[] = [];
  for (const err of errors) {
    if (err.constraints) {
      result.push(...Object.values(err.constraints));
    }
    if (err.children && err.children.length) {
      result.push(...flattenValidationErrors(err.children));
    }
  }
  return result;
}

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: false,
  });

  // Get services from DI container
  const logger = app.get(AppLogger);
  const contextService = app.get(RequestContextService);
  const responseBuilder = app.get(ResponseBuilder);

  // Use custom logger
  app.useLogger(logger);

  // ===========================================
  // SECURITY MIDDLEWARES
  // ===========================================

  // Remove framework info from headers
  app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // Basic security headers (manual implementation until helmet is installed)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    next();
  });

  // ===========================================
  // CORS CONFIGURATION
  // ===========================================

  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [
    'http://localhost:3000',
  ];

  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`, 'Bootstrap');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`, 'CORS');
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Forwarded-For',
      'Cookie',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'Set-Cookie',
    ],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ===========================================
  // UTILITY MIDDLEWARES
  // ===========================================

  app.use(cookieParser());

  // ===========================================
  // GLOBAL INTERCEPTORS
  // ===========================================

  // Request/Response logger
  app.useGlobalInterceptors(new LoggerInterceptor(logger));

  // Timeout interceptor (30 seconds)
  app.useGlobalInterceptors(new TimeoutInterceptor(30000));

  // Response wrapper with ResponseBuilder
  app.useGlobalInterceptors(new ResponseInterceptor(responseBuilder));

  // ===========================================
  // GLOBAL FILTERS
  // ===========================================

  // Validation errors with ResponseBuilder
  app.useGlobalFilters(
    new ValidationExceptionFilter(logger, contextService, responseBuilder),
  );

  // All other errors with ResponseBuilder
  app.useGlobalFilters(
    new GlobalExceptionFilter(logger, contextService, responseBuilder),
  );

  // ===========================================
  // GLOBAL PIPES
  // ===========================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      exceptionFactory: (errors: ValidationError[] = []) => {
        const messages = flattenValidationErrors(errors);
        return new BadRequestException(messages);
      },
    }),
  );

  // ===========================================
  // GRACEFUL SHUTDOWN
  // ===========================================

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server', 'Bootstrap');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server', 'Bootstrap');
    await app.close();
    process.exit(0);
  });

  // ===========================================
  // START SERVER
  // ===========================================

  const port = process.env.PORT || 4000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  logger.log(
    `🚀 PenTrack Backend running on http://${host}:${port}`,
    'Bootstrap',
  );
  logger.log(
    `📝 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
  logger.log(
    `🔍 Log level: ${process.env.LOG_LEVEL || 'log'}`,
    'Bootstrap',
  );
  logger.log(
    `🍪 Cookie domain: ${process.env.COOKIE_DOMAIN || 'not set (local dev)'}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start PenTrack application:', error);
  process.exit(1);
});