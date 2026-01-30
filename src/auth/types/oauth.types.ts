// src/auth/types/oauth.types.ts

import { UserRole } from '@prisma/client';

/**
 * OAuth provider names
 */
export type OAuthProvider = 'GOOGLE' | 'MICROSOFT'; // Simple string type

/**
 * OAuth user data from provider
 */
export interface OAuthUserData {
    providerId: string; // Unique ID from provider (Google's "sub")
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    provider: OAuthProvider;
}

/**
 * OAuth state data (stored in memory/Redis for CSRF protection)
 */
export interface OAuthState {
    role: UserRole;
    timestamp: number;
    nonce: string; // Additional security
    redirectUrl?: string; // Where to redirect after auth
}

/**
 * OAuth login result
 */
export interface OAuthLoginResult {
    user: any;
    sessionToken: string;
    isNewUser: boolean;
    linkedAccount: boolean; // True if linked to existing account
}

/**
 * OAuth token response from provider
 */
export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    id_token?: string; // For OpenID Connect (Google)
}

// ============================================
// GOOGLE OAUTH SPECIFIC TYPES
// ============================================

/**
 * Google OAuth configuration
 */
export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
}

/**
 * Google user data from ID token
 */
export interface GoogleUserData {
    id: string; // Google's "sub" claim
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

/**
 * OAuth tokens from Google
 */
export interface OAuthTokens {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
}