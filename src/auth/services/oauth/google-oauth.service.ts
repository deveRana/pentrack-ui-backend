// src/auth/services/oauth/google-oauth.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { UserRole } from '@prisma/client';
import { OAuthBaseService } from './oauth-base.service';
import { PrismaService } from '@core/database/prisma.service';
import { AppLogger } from '@core/logger/logger.service';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { SessionService } from '@auth/services/session.service';
import {
    GoogleOAuthConfig,
    GoogleUserData,
    OAuthTokens,
} from '@auth/types/oauth.types';

/**
 * Google OAuth Service
 * Handles Google OAuth authentication for R-Admin and Pentester roles
 */
@Injectable()
export class GoogleOAuthService extends OAuthBaseService {
    private readonly oauth2Client: OAuth2Client;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(
        protected readonly prisma: PrismaService,
        protected readonly logger: AppLogger,
        protected readonly configService: ConfigService,
        protected readonly authRepository: AuthRepository,
        protected readonly sessionService: SessionService,
    ) {
        super(
            prisma,
            logger,
            configService,
            authRepository,
            sessionService,
            'GOOGLE',
        );

        // ✅ FIXED: Proper type handling with defaults
        this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
        this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
        this.redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || '';

        // ✅ Validate required config
        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            this.logger.error(
                'Missing Google OAuth configuration. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in .env',
                'GoogleOAuthService',
            );
        }

        this.oauth2Client = new OAuth2Client(
            this.clientId,
            this.clientSecret,
            this.redirectUri,
        );

        this.logger.log('Google OAuth Service initialized', 'GoogleOAuthService');
    }

    /**
     * Generate Google OAuth authorization URL
     * PUBLIC METHOD - Called by OAuthController
     */
    async getAuthorizationUrl(role: UserRole): Promise<{ url: string; state: string }> {
        // Create state for CSRF protection
        const state = await this.createState(role);

        // Generate auth URL
        const url = this.generateAuthUrl(state);

        return { url, state };
    }

    /**
     * Generate Google OAuth authorization URL (internal)
     */
    private generateAuthUrl(state: string): string {
        const config: GoogleOAuthConfig = {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUri: this.redirectUri,
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        };

        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: config.scope,
            state: state,
            prompt: 'consent',
        });

        this.logger.log(
            `Generated Google auth URL with state: ${state}`,
            'GoogleOAuthService',
        );

        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);

            this.logger.log('Successfully exchanged code for tokens', 'GoogleOAuthService');

            return {
                access_token: tokens.access_token || '',
                refresh_token: tokens.refresh_token || undefined,
                expires_in: tokens.expiry_date
                    ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
                    : undefined,
                id_token: tokens.id_token || undefined,
            };
        } catch (error) {
            this.logger.error(
                `Failed to exchange code for tokens: ${error.message}`,
                error.stack,
                'GoogleOAuthService',
            );
            throw new Error('Failed to exchange authorization code for tokens');
        }
    }

    /**
     * Verify ID token and extract user data
     * ✅ FIXED: Proper handling of optional id_token
     */
    async verifyIdToken(idToken: string | undefined): Promise<GoogleUserData> {
        if (!idToken) {
            throw new Error('ID token is required');
        }

        try {
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: idToken,
                audience: this.clientId,
            });

            const payload: TokenPayload | undefined = ticket.getPayload();

            if (!payload) {
                throw new Error('Invalid ID token payload');
            }

            const userData: GoogleUserData = {
                id: payload.sub,
                email: payload.email || '',
                verified_email: payload.email_verified || false,
                name: payload.name || '',
                given_name: payload.given_name || '',
                family_name: payload.family_name || '',
                picture: payload.picture || '',
            };

            this.logger.log(
                `Verified Google user: ${userData.email}`,
                'GoogleOAuthService',
            );

            return userData;
        } catch (error) {
            this.logger.error(
                `Failed to verify ID token: ${error.message}`,
                error.stack,
                'GoogleOAuthService',
            );
            throw new Error('Failed to verify Google ID token');
        }
    }

    /**
     * Complete OAuth flow
     */
    async handleCallback(
        code: string,
        state: string,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<any> {
        // Exchange code for tokens
        const tokens = await this.exchangeCodeForTokens(code);

        // Verify ID token and get user data
        const userData = await this.verifyIdToken(tokens.id_token);

        // Use base service to complete OAuth flow
        return await this.completeOAuthFlow(
            {
                provider: 'GOOGLE',
                providerId: userData.id,
                email: userData.email,
                firstName: userData.given_name,
                lastName: userData.family_name,
                profileImage: userData.picture,
            },
            state,
            userAgent,
            ipAddress,
        );
    }
}