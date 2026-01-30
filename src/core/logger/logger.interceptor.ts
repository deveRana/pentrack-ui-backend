// src/core/logger/logger.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLogger) {
        this.logger.setContext('Interceptor');
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(`${method} ${url} - ${responseTime}ms`);
                },
                error: (error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(
                        `${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
                    );
                },
            }),
        );
    }
}