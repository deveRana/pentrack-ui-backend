// src/core/filters/validation-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@core/logger/logger.service';
import { RequestContextService } from '@core/context/request-context.service';
import { ResponseBuilder } from '@common/utils/response-builder.util';
import { ErrorCodes } from '@common/enums/error-codes.enum';

/**
 * Validation Exception Filter
 * 
 * Specifically handles validation errors from class-validator
 * Formats validation errors into user-friendly messages
 * Takes precedence over global exception filter for BadRequestException
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly logger: AppLogger,
        private readonly contextService: RequestContextService,
        private readonly responseBuilder: ResponseBuilder,
    ) { }

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Get request context
        const context = this.contextService.getContext();
        const requestId = context?.requestId || 'unknown';

        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        // Check if this is a validation error
        const isValidationError =
            Array.isArray(exceptionResponse.message) ||
            (typeof exceptionResponse === 'object' && 'message' in exceptionResponse);

        let errorCode: string;
        let errorMessage: string;
        let errorDetails: any = undefined;

        if (isValidationError) {
            errorCode = ErrorCodes.VALIDATION_ERROR;

            // Format validation errors
            if (Array.isArray(exceptionResponse.message)) {
                // Multiple validation errors
                errorMessage = exceptionResponse.message[0]; // First error as main message
                errorDetails = {
                    errors: exceptionResponse.message,
                };
            } else if (typeof exceptionResponse.message === 'string') {
                // Single validation error
                errorMessage = exceptionResponse.message;
            } else {
                errorMessage = 'Validation failed';
                errorDetails = exceptionResponse.message;
            }
        } else {
            // Not a validation error, treat as generic bad request
            errorCode = exceptionResponse.code || ErrorCodes.BAD_REQUEST;
            errorMessage =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : exceptionResponse.message || 'Bad request';
            errorDetails = exceptionResponse.details;
        }

        // Log validation error
        this.logger.warn(
            `[${requestId}] Validation error on ${request.method} ${request.url}: ${errorMessage}`,
            'ValidationExceptionFilter',
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
}