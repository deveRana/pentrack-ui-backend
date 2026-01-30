// src/admin/constants/admin.constants.ts

/**
 * Admin Module Constants
 * 
 * Contains all constants used in the admin module
 * - Allowed domains for R-Admin
 * - Default values
 * - Validation rules
 */

// ============================================
// ALLOWED DOMAINS
// ============================================

/**
 * Allowed company domain for R-Admin accounts
 * R-Admins MUST have email from this domain
 */
export const RADMIN_ALLOWED_DOMAIN = 'rivedix.com';

/**
 * Allowed company domains for Pentester accounts
 * (Same as R-Admin for now, but kept separate for future flexibility)
 */
export const PENTESTER_ALLOWED_DOMAIN = 'rivedix.com';

// ============================================
// DEFAULT VALUES
// ============================================

/**
 * Default status for newly created R-Admin accounts
 */
export const DEFAULT_RADMIN_STATUS = 'ACTIVE';

/**
 * Default pagination limit for system logs
 */
export const DEFAULT_LOGS_LIMIT = 15;

/**
 * Default pagination limit for R-Admin list
 */
export const DEFAULT_RADMIN_LIMIT = 10;

// ============================================
// VALIDATION RULES
// ============================================

/**
 * Phone number validation regex (Indian format)
 * Must start with 6-9, followed by 9 digits
 */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Country code for phone numbers
 */
export const PHONE_COUNTRY_CODE = '+91';

/**
 * Maximum file size for exports (100MB)
 */
export const MAX_EXPORT_FILE_SIZE = 100 * 1024 * 1024;

/**
 * System log export formats
 */
export const ALLOWED_EXPORT_FORMATS = ['csv', 'json', 'pdf'] as const;

export type ExportFormat = typeof ALLOWED_EXPORT_FORMATS[number];

// ============================================
// ERROR MESSAGES
// ============================================

export const ADMIN_ERROR_MESSAGES = {
    RADMIN_EMAIL_DOMAIN_INVALID: `R-Admin email must be from @${RADMIN_ALLOWED_DOMAIN} domain`,
    PENTESTER_EMAIL_DOMAIN_INVALID: `Pentester email must be from @${PENTESTER_ALLOWED_DOMAIN} domain`,
    RADMIN_NOT_FOUND: 'R-Admin not found',
    RADMIN_EMAIL_EXISTS: 'Email already exists',
    RADMIN_PHONE_EXISTS: 'Phone number already exists',
    INVALID_PHONE_FORMAT: 'Invalid phone number format. Must be 10 digits starting with 6-9',
    INVALID_EXPORT_FORMAT: 'Invalid export format. Allowed: csv, json, pdf',
} as const;

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Email subject for R-Admin account creation
 */
export const RADMIN_WELCOME_EMAIL_SUBJECT = 'Welcome to PenTrack - Your Account Details';

/**
 * Email subject for R-Admin account update
 */
export const RADMIN_UPDATE_EMAIL_SUBJECT = 'PenTrack - Your Account Has Been Updated';