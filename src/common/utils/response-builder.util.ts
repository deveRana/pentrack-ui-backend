// src/common/utils/response-builder.util.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '@core/context/request-context.service';
import {
    ISuccessResponse,
    IErrorResponse,
    IWarningResponse,
    IInfoResponse,
    IResponseMeta,
    IPaginatedData,
    IPaginationMeta,
} from '@common/types/response.types';

/**
 * Response Builder Utility
 * 
 * Centralized utility for building standardized API responses
 * Automatically handles meta field based on environment configuration
 */
@Injectable()
export class ResponseBuilder {
    private readonly includeMeta: boolean;
    private readonly includeMetaInProduction: boolean;
    private readonly includeRequestId: boolean;
    private readonly includeTimestamp: boolean;
    private readonly includePath: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly contextService: RequestContextService,
    ) {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

        // Default: Include meta in dev/staging, exclude in production
        this.includeMetaInProduction = this.configService.get<string>('INCLUDE_META_IN_PRODUCTION', 'false') === 'true';
        this.includeMeta = nodeEnv !== 'production' || this.includeMetaInProduction;

        // Granular control over meta fields
        this.includeRequestId = this.configService.get<string>('INCLUDE_REQUEST_ID', 'true') === 'true';
        this.includeTimestamp = this.configService.get<string>('INCLUDE_TIMESTAMP', 'true') === 'true';
        this.includePath = this.configService.get<string>('INCLUDE_PATH', nodeEnv !== 'production' ? 'true' : 'false') === 'true';
    }

    // ============================================
    // META BUILDER
    // ============================================

    /**
     * Build meta object based on environment configuration
     * Returns undefined if meta should be excluded
     */
    private buildMeta(path?: string): IResponseMeta | undefined {
        if (!this.includeMeta) {
            return undefined;
        }

        const context = this.contextService.getContext();
        const meta: Partial<IResponseMeta> = {};

        if (this.includeTimestamp) {
            meta.timestamp = new Date().toISOString();
        }

        if (this.includeRequestId && context?.requestId) {
            meta.requestId = context.requestId;
        }

        if (this.includePath && path) {
            meta.path = path;
        }

        if (Object.keys(meta).length === 0) {
            return undefined;
        }

        return meta as IResponseMeta;
    }

    // ============================================
    // SUCCESS RESPONSES
    // ============================================

    /**
     * Build success response
     */
    success<T>(
        data: T,
        message?: string,
        path?: string,
    ): Omit<ISuccessResponse<T>, 'success'> {
        const meta = this.buildMeta(path);

        const response: any = {
            success: true,
            data,
        };

        if (message) {
            response.message = message;
        }

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    /**
     * Build paginated success response
     */
    paginated<T>(
        items: T[],
        pagination: IPaginationMeta,
        message?: string,
        path?: string,
    ): Omit<ISuccessResponse<IPaginatedData<T>>, 'success'> {
        const data: IPaginatedData<T> = {
            items,
            pagination,
        };

        return this.success(data, message, path);
    }

    // ============================================
    // WARNING RESPONSES
    // ============================================

    /**
     * Build warning response (success with non-critical issues)
     */
    warning<T>(
        data: T,
        warningCode: string,
        warningMessage: string,
        path?: string,
    ): Omit<IWarningResponse<T>, 'success'> {
        const meta = this.buildMeta(path);

        const response: any = {
            success: true,
            data,
            warning: {
                code: warningCode,
                message: warningMessage,
            },
        };

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    // ============================================
    // INFO RESPONSES
    // ============================================

    /**
     * Build info response (success with additional information)
     */
    info<T>(
        data: T,
        infoCode: string,
        infoMessage: string,
        path?: string,
    ): Omit<IInfoResponse<T>, 'success'> {
        const meta = this.buildMeta(path);

        const response: any = {
            success: true,
            data,
            info: {
                code: infoCode,
                message: infoMessage,
            },
        };

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    // ============================================
    // ERROR RESPONSES (Used by Exception Filters)
    // ============================================

    /**
     * Build error response
     */
    error(
        code: string,
        message: string,
        statusCode: number,
        path?: string,
        details?: any,
    ): Omit<IErrorResponse, 'success'> {
        const meta = this.buildMeta(path);

        const response: any = {
            success: false,
            error: {
                code,
                message,
                statusCode,
                ...(details && { details }),
            },
        };

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if meta should be included in responses
     */
    shouldIncludeMeta(): boolean {
        return this.includeMeta;
    }

    /**
     * Get current environment
     */
    getEnvironment(): string {
        return this.configService.get<string>('NODE_ENV', 'development');
    }

    /**
     * Build pagination meta from query params
     */
    buildPaginationMeta(
        total: number,
        page: number,
        limit: number,
    ): IPaginationMeta {
        const totalPages = Math.ceil(total / limit);

        return {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}