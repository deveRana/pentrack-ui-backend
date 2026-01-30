// src/core/filters/global-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@core/logger/logger.service';
import { RequestContextService } from '@core/context/request-context.service';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { ErrorCodes } from '@common/enums/error-codes.enum';

/**
 * Global Exception Filter
 * 
 * Catches ALL exceptions in the application and formats them into standardized error responses
 * Handles both HTTP exceptions and unexpected errors
 * Logs errors with context for debugging
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly logger: AppLogger,
        private readonly contextService: RequestContextService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Get request context
        const context = this.contextService.getContext();
        const requestId = context?.requestId || 'unknown';

        // Determine status code
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Extract error details
        let errorCode: string;
        let errorMessage: string;
        let errorDetails: any = undefined;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                errorCode = responseObj.code || this.getDefaultErrorCode(status);
                errorMessage = responseObj.message || exception.message;
                errorDetails = responseObj.details;
            } else {
                errorCode = this.getDefaultErrorCode(status);
                errorMessage = exceptionResponse as string;
            }
        } else {
            errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
            errorMessage = 'An unexpected error occurred. Please try again later.';
        }

        // Log error
        this.logger.error(
            `[${requestId}] ${request.method} ${request.url} - ${status} ${errorCode}: ${errorMessage}`,
            exception.stack,
            'GlobalExceptionFilter',
        );

        // Send standardized error response
        response.status(status).json(
            this.responseBuilder.error(
                errorCode,
                errorMessage,
                status,
                request.url,
                errorDetails,
            ),
        );
    }

    /**
     * Get default error code based on HTTP status
     */
    private getDefaultErrorCode(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return ErrorCodes.BAD_REQUEST;
            case HttpStatus.UNAUTHORIZED:
                return ErrorCodes.UNAUTHORIZED;
            case HttpStatus.FORBIDDEN:
                return ErrorCodes.FORBIDDEN;
            case HttpStatus.NOT_FOUND:
                return ErrorCodes.NOT_FOUND;
            case HttpStatus.CONFLICT:
                return ErrorCodes.CONFLICT;
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return ErrorCodes.INTERNAL_SERVER_ERROR;
            default:
                return 'UNKNOWN_ERROR';
        }
    }
}