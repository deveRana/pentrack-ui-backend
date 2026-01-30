// src/config/cookie.config.ts

import type { CookieOptions } from 'express';

/**
 * Centralized cookie configuration for the application
 * Ensures consistent cookie settings across all controllers
 */
export class CookieConfig {
    /**
     * Get standard cookie options for session tokens
     * @param rememberMe - If true, extends cookie lifetime to 30 days
     * @returns CookieOptions object
     */
    static getSessionCookieOptions(rememberMe: boolean = false): CookieOptions {
        // Use COOKIE_SECURE env var instead of NODE_ENV check
        const isSecure = process.env.COOKIE_SECURE === 'true';
        const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

        const options: CookieOptions = {
            httpOnly: true,
            secure: isSecure, // Respect COOKIE_SECURE env var
            sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
            maxAge: rememberMe
                ? 30 * 24 * 60 * 60 * 1000 // 30 days
                : 24 * 60 * 60 * 1000, // 24 hours
            path: '/',
        };

        // Add domain for production (allows subdomain sharing)
        if (cookieDomain) {
            options.domain = cookieDomain;
        }

        return options;
    }

    /**
     * Get cookie options for clearing/deleting cookies
     * Must match the original cookie options to properly clear them
     * @returns CookieOptions object
     */
    static getClearCookieOptions(): CookieOptions {
        const isSecure = process.env.COOKIE_SECURE === 'true';
        const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

        const options: CookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
            path: '/',
        };

        // Add domain for production
        if (cookieDomain) {
            options.domain = cookieDomain;
        }

        return options;
    }

    /**
     * Get cookie options for temporary tokens (like CSRF tokens)
     * Shorter lifetime, not HTTP-only (needs to be accessible by JS)
     * @returns CookieOptions object
     */
    static getTokenCookieOptions(): CookieOptions {
        const isSecure = process.env.COOKIE_SECURE === 'true';
        const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

        const options: CookieOptions = {
            httpOnly: false, // Accessible by JavaScript
            secure: isSecure,
            sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        };

        if (cookieDomain) {
            options.domain = cookieDomain;
        }

        return options;
    }

    /**
     * Get cookie name constants
     */
    static readonly COOKIE_NAMES = {
        SESSION: 'session_token',
        REFRESH: 'refresh_token',
        CSRF: 'csrf_token',
    } as const;
}