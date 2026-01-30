// src/auth/utils/auth.utils.ts

import { randomBytes } from 'crypto';
import { User } from '@prisma/client';

/**
 * Authentication Utility Functions
 * 
 * Common helpers used across auth services
 */

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate a secure random token
 * @param length - Length in bytes (default 32)
 * @returns Hex string token
 */
export function generateRandomToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
}

/**
 * Generate 6-digit OTP code
 * @returns String OTP code (000000-999999)
 */
export function generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// TIME UTILITIES
// ============================================

/**
 * Parse time string to milliseconds
 * @param timeStr - Time string (e.g., "24h", "30d", "5m")
 * @returns Milliseconds
 */
export function parseTimeToMs(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Invalid time format: ${timeStr}`);
    }
}

/**
 * Get expiration date from now
 * @param hours - Hours from now
 * @returns Date object
 */
export function getTokenExpiration(hours: number): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);
    return expiresAt;
}

/**
 * Check if date is expired
 * @param date - Date to check
 * @returns True if expired
 */
export function isDateExpired(date: Date): boolean {
    return new Date() > date;
}

// ============================================
// USER FORMATTING
// ============================================

/**
 * Format user object for API responses
 * Removes sensitive fields like password
 * ✅ FIXED: Added null check
 */
export function formatUserResponse(user: User | null): any {
    // ✅ Handle null case
    if (!user) {
        return null;
    }

    const {
        password,
        deletedAt,
        ...safeUser
    } = user;

    return safeUser;
}

// ============================================
// IP & USER AGENT SANITIZATION
// ============================================

/**
 * Sanitize IP address (handle IPv6, proxies, etc.)
 */
export function sanitizeIpAddress(ip: string | undefined): string {
    if (!ip) return 'unknown';

    // Remove IPv6 prefix if present
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }

    // Handle localhost
    if (ip === '::1' || ip === '127.0.0.1') {
        return 'localhost';
    }

    return ip;
}

/**
 * Sanitize user agent string (truncate if too long)
 */
export function sanitizeUserAgent(userAgent: string | undefined): string {
    if (!userAgent) return 'unknown';

    // Truncate to 500 characters
    return userAgent.length > 500
        ? userAgent.substring(0, 500) + '...'
        : userAgent;
}

// ============================================
// DEVICE INFO EXTRACTION
// ============================================

/**
 * Extract device name from user agent
 * @param userAgent - User agent string
 * @returns Human-readable device name
 */
export function extractDeviceName(userAgent: string | undefined): string {
    if (!userAgent) return 'Unknown Device';

    // Browser detection
    const browsers: Record<string, string> = {
        'Chrome': 'Chrome',
        'Firefox': 'Firefox',
        'Safari': 'Safari',
        'Edge': 'Edge',
        'Opera': 'Opera',
    };

    for (const [key, name] of Object.entries(browsers)) {
        if (userAgent.includes(key)) {
            // OS detection
            if (userAgent.includes('Windows')) return `${name} on Windows`;
            if (userAgent.includes('Mac')) return `${name} on Mac`;
            if (userAgent.includes('Linux')) return `${name} on Linux`;
            if (userAgent.includes('Android')) return `${name} on Android`;
            if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
                return `${name} on iOS`;
            }
            return name;
        }
    }

    return 'Unknown Device';
}

/**
 * Extract device type from user agent
 * @param userAgent - User agent string
 * @returns Device type: 'mobile' | 'tablet' | 'desktop'
 */
export function extractDeviceType(userAgent: string | undefined): string {
    if (!userAgent) return 'unknown';

    if (
        userAgent.includes('Mobile') ||
        userAgent.includes('Android') ||
        userAgent.includes('iPhone')
    ) {
        return 'mobile';
    }

    if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
        return 'tablet';
    }

    return 'desktop';
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format (international)
 */
export function isValidPhone(phone: string): boolean {
    // Accept formats: +919876543210, +1234567890
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

/**
 * Extract email domain
 */
export function getEmailDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Check if email is from allowed company domain
 * For PenTrack: Only @rivedix.com for R-Admin and Pentester
 */
export function isAllowedCompanyDomain(email: string, allowedDomain: string): boolean {
    const domain = getEmailDomain(email);
    return domain === allowedDomain.toLowerCase();
}