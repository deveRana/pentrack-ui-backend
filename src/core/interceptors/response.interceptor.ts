// src/core/interceptors/response.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseBuilder } from '@common/utils/response-builder.util';

/**
 * Response Interceptor
 * 
 * Automatically wraps all successful responses in a standardized format
 * Handles different response types (success, warning, info)
 * 
 * DOES NOT wrap:
 * - Error responses (handled by exception filters)
 * - Responses that already have success: true/false
 * - File downloads (binary responses)
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(private readonly responseBuilder: ResponseBuilder) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // Skip wrapping if data is null/undefined
                if (data === null || data === undefined) {
                    return this.responseBuilder.success(null);
                }

                // Skip wrapping if already in standard format (has 'success' field)
                if (typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Skip wrapping for file downloads (binary data)
                if (data instanceof Buffer || data instanceof Uint8Array) {
                    return data;
                }

                // Check for warning response
                if (typeof data === 'object' && 'warning' in data) {
                    const { warning, ...rest } = data;
                    return this.responseBuilder.warning(
                        rest,
                        warning.code,
                        warning.message,
                    );
                }

                // Check for info response
                if (typeof data === 'object' && 'info' in data) {
                    const { info, ...rest } = data;
                    return this.responseBuilder.info(
                        rest,
                        info.code,
                        info.message,
                    );
                }

                // Check for message-only response
                if (typeof data === 'object' && 'message' in data && Object.keys(data).length === 1) {
                    return this.responseBuilder.success(null, data.message);
                }

                // Check for data + message response
                if (typeof data === 'object' && 'data' in data && 'message' in data) {
                    return this.responseBuilder.success(data.data, data.message);
                }

                // Default: wrap data in success response
                return this.responseBuilder.success(data);
            }),
        );
    }
}