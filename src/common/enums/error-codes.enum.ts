// src/common/enums/error-codes.enum.ts

/**
 * Error Codes Enum
 * 
 * Centralized error codes for the entire application
 * Used for machine-readable error identification
 * 
 * Format: CATEGORY_SPECIFIC_ERROR
 * Example: AUTH_INVALID_CREDENTIALS, USER_NOT_FOUND
 */
export enum ErrorCodes {
    // ============================================
    // GENERIC ERRORS
    // ============================================
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    // ============================================
    // AUTHENTICATION ERRORS
    // ============================================
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
    EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
    ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
    ACCOUNT_DELETED = 'ACCOUNT_DELETED',
    SESSION_INVALID = 'SESSION_INVALID',
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    TOKEN_INVALID = 'TOKEN_INVALID',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',

    // ============================================
    // USER ERRORS
    // ============================================
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    PHONE_ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',

    // ============================================
    // OTP ERRORS (PenTrack specific)
    // ============================================
    OTP_INVALID = 'OTP_INVALID',
    OTP_EXPIRED = 'OTP_EXPIRED',
    OTP_MAX_ATTEMPTS = 'OTP_MAX_ATTEMPTS',
    OTP_RATE_LIMIT = 'OTP_RATE_LIMIT',
    OTP_SEND_FAILED = 'OTP_SEND_FAILED',

    // ============================================
    // OAUTH ERRORS (PenTrack specific)
    // ============================================
    OAUTH_INIT_FAILED = 'OAUTH_INIT_FAILED',
    OAUTH_STATE_INVALID = 'OAUTH_STATE_INVALID',
    OAUTH_STATE_EXPIRED = 'OAUTH_STATE_EXPIRED',
    OAUTH_ROLE_MISMATCH = 'OAUTH_ROLE_MISMATCH',
    OAUTH_INVALID_ROLE = 'OAUTH_INVALID_ROLE',
    OAUTH_TOKEN_EXCHANGE_FAILED = 'OAUTH_TOKEN_EXCHANGE_FAILED',
    OAUTH_EMAIL_DOMAIN_BLOCKED = 'OAUTH_EMAIL_DOMAIN_BLOCKED',
    GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED',
    GOOGLE_TOKEN_INVALID = 'GOOGLE_TOKEN_INVALID',
    GOOGLE_ID_TOKEN_INVALID = 'GOOGLE_ID_TOKEN_INVALID',

    // ============================================
    // PERMISSION ERRORS
    // ============================================
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    ROLE_MISMATCH = 'ROLE_MISMATCH',

    // ============================================
    // ADMIN MODULE ERRORS ✅ NEW
    // ============================================
    RADMIN_NOT_FOUND = 'RADMIN_NOT_FOUND',
    RADMIN_EMAIL_DOMAIN_INVALID = 'RADMIN_EMAIL_DOMAIN_INVALID',
    INVALID_EMAIL_DOMAIN = 'INVALID_EMAIL_DOMAIN',
    INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
    INVALID_EXPORT_FORMAT = 'INVALID_EXPORT_FORMAT',

    // ============================================
    // FILE UPLOAD ERRORS
    // ============================================
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
    FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',

    // ============================================
    // RATE LIMITING ERRORS
    // ============================================
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // ============================================
    // DATABASE ERRORS
    // ============================================
    DATABASE_ERROR = 'DATABASE_ERROR',
    RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
    DUPLICATE_RECORD = 'DUPLICATE_RECORD',

    // ============================================
    // EMAIL ERRORS
    // ============================================
    EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
    EMAIL_DOMAIN_NOT_ALLOWED = 'EMAIL_DOMAIN_NOT_ALLOWED',

    // ============================================
    // PASSWORD ERRORS
    // ============================================
    PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
    PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
    PASSWORD_RESET_TOKEN_INVALID = 'PASSWORD_RESET_TOKEN_INVALID',

    // ============================================
    // PROFILE ERRORS
    // ============================================
    PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
    PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',

    // ============================================
    // CLIENT/PARTNER/PENTESTER ERRORS (PenTrack specific)
    // ============================================
    CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
    PARTNER_NOT_FOUND = 'PARTNER_NOT_FOUND',
    PENTESTER_NOT_FOUND = 'PENTESTER_NOT_FOUND',
    COMPANY_DOMAIN_MISMATCH = 'COMPANY_DOMAIN_MISMATCH',

    // ============================================
    // PROJECT ERRORS (Future - PenTrack)
    // ============================================
    PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
    PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',

    // ============================================
    // REPORT ERRORS (Future - PenTrack)
    // ============================================
    REPORT_NOT_FOUND = 'REPORT_NOT_FOUND',
    REPORT_UPLOAD_FAILED = 'REPORT_UPLOAD_FAILED',
}