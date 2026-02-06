// src/common/types/response.types.ts

// ============================================
// BASE TYPES
// ============================================

/**
 * Standard metadata included in all responses
 */
export interface IResponseMeta {
    timestamp?: string;
    requestId?: string;
    path?: string;
}

// ============================================
// SUCCESS RESPONSE
// ============================================

/**
 * Standard success response structure
 */
export interface ISuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
    meta?: IResponseMeta;
}

// ============================================
// ERROR RESPONSE
// ============================================

/**
 * Standard error response structure
 */
export interface IErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode: number;
        details?: any;
    };
    meta?: IResponseMeta;
}

// ============================================
// WARNING RESPONSE
// ============================================

/**
 * Response with warning - operation succeeded but with non-critical issues
 */
export interface IWarningResponse<T = any> {
    success: true;
    data: T;
    warning: {
        code: string;
        message: string;
    };
    meta?: IResponseMeta;
}

// ============================================
// INFO RESPONSE
// ============================================

/**
 * Response with informational message
 */
export interface IInfoResponse<T = any> {
    success: true;
    data: T;
    info: {
        code: string;
        message: string;
    };
    meta?: IResponseMeta;
}

// ============================================
// VALIDATION ERROR
// ============================================

/**
 * Validation error details
 */
export interface IValidationError {
    field: string;
    message: string;
    value?: any;
    constraint?: string;
}

// ============================================
// PAGINATION METADATA
// ============================================

/**
 * Pagination metadata for list endpoints
 */
export interface IPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Paginated response data structure
 */
export interface IPaginatedData<T> {
    items: T[];
    pagination: IPaginationMeta;
}

// ============================================
// TYPE UNIONS
// ============================================

/**
 * Union of all possible response types
 */
export type ApiResponse<T = any> =
    | ISuccessResponse<T>
    | IErrorResponse
    | IWarningResponse<T>
    | IInfoResponse<T>;

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
    response: ApiResponse<T>
): response is ISuccessResponse<T> | IWarningResponse<T> | IInfoResponse<T> {
    return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
    response: ApiResponse
): response is IErrorResponse {
    return response.success === false;
}

/**
 * Type guard to check if response has a warning
 */
export function hasWarning<T>(
    response: ApiResponse<T>
): response is IWarningResponse<T> {
    return response.success === true && 'warning' in response;
}

/**
 * Type guard to check if response has info
 */
export function hasInfo<T>(
    response: ApiResponse<T>
): response is IInfoResponse<T> {
    return response.success === true && 'info' in response;
}