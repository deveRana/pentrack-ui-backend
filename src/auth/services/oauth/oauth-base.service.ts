// src/auth/services/oauth/oauth-base.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@core/database/prisma.service';
import { SessionService } from '../session.service';
import { AuthRepository } from '@auth/repositories/auth.repository';
import { AppLogger } from '@core/logger/logger.service';
import { randomBytes } from 'crypto';
import type {
    OAuthProvider,
    OAuthUserData,
    OAuthState,
    OAuthLoginResult,
} from '../../types/oauth.types';
import { UserRole, AccountStatus, OAuthProviderType } from '@prisma/client';
import { formatUserResponse } from '../../utils/auth.utils';

/**
 * Base OAuth Service
 * Provides shared logic for all OAuth providers
 * Uses in-memory storage for state management (no Redis dependency)
 */
@Injectable()
export class OAuthBaseService {
    private readonly STATE_EXPIRY = 300000; // 5 minutes in milliseconds
    private readonly ALLOWED_DOMAIN = 'rivedix.com'; // Only @rivedix.com for R-Admin/Pentester

    // In-memory store for OAuth state
    protected inMemoryStore: Map<string, { data: OAuthState; expires: number }> = new Map();

    constructor(
        protected readonly prisma: PrismaService,
        protected readonly logger: AppLogger,
        protected readonly configService: ConfigService,
        protected readonly authRepository: AuthRepository,
        protected readonly sessionService: SessionService,
        protected readonly provider: OAuthProvider,
    ) {
        // Cleanup expired entries every minute
        setInterval(() => this.cleanupExpiredStates(), 60000);
        this.logger.log(`OAuth using in-memory storage for state management (${provider})`, 'OAuthBaseService');
    }

    // ============================================
    // STATE MANAGEMENT (CSRF Protection)
    // ============================================

    /**
     * Cleanup expired in-memory states
     */
    private cleanupExpiredStates() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.inMemoryStore.entries()) {
            if (value.expires < now) {
                this.inMemoryStore.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.logger.log(`Cleaned ${cleaned} expired OAuth states`, 'OAuthBaseService');
        }
    }

    /**
     * Generate OAuth state token and store in memory
     */
    async createState(
        role: UserRole,
        redirectUrl?: string,
    ): Promise<string> {
        const state = randomBytes(32).toString('hex');
        const nonce = randomBytes(16).toString('hex');

        const stateData: OAuthState = {
            role,
            timestamp: Date.now(),
            nonce,
            redirectUrl,
        };

        const key = `oauth:${this.provider}:state:${state}`;

        // Store in memory
        this.inMemoryStore.set(key, {
            data: stateData,
            expires: Date.now() + this.STATE_EXPIRY,
        });

        this.logger.log(`OAuth state created for ${this.provider}: ${state}`, 'OAuthBaseService');

        return state;
    }

    /**
     * Validate and consume OAuth state
     */
    async validateAndConsumeState(
        state: string,
    ): Promise<OAuthState> {
        const key = `oauth:${this.provider}:state:${state}`;

        // Get from memory
        const stored = this.inMemoryStore.get(key);

        if (!stored) {
            this.logger.warn(`Invalid OAuth state attempted: ${state}`, 'OAuthBaseService');
            throw new UnauthorizedException({
                code: 'OAUTH_STATE_INVALID',
                message: 'Invalid or expired OAuth state. Please try logging in again.',
            });
        }

        if (stored.expires < Date.now()) {
            this.inMemoryStore.delete(key);
            this.logger.warn(`Expired OAuth state attempted: ${state}`, 'OAuthBaseService');
            throw new UnauthorizedException({
                code: 'OAUTH_STATE_EXPIRED',
                message: 'OAuth session expired. Please try logging in again.',
            });
        }

        // Delete state (single use)
        this.inMemoryStore.delete(key);

        const stateData = stored.data;

        // Check if state is not too old (extra security)
        const age = Date.now() - stateData.timestamp;
        if (age > this.STATE_EXPIRY) {
            throw new UnauthorizedException({
                code: 'OAUTH_STATE_EXPIRED',
                message: 'OAuth session expired. Please try logging in again.',
            });
        }

        this.logger.log(`OAuth state validated for ${this.provider}`, 'OAuthBaseService');

        return stateData;
    }

    // ============================================
    // COMPLETE OAUTH FLOW
    // ============================================

    /**
     * Complete OAuth flow after provider callback
     */
    protected async completeOAuthFlow(
        oauthData: OAuthUserData,
        state: string,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<OAuthLoginResult> {
        // Validate state
        const stateData = await this.validateAndConsumeState(state);

        // Find or create user
        return await this.findOrCreateUser(oauthData, stateData.role, ipAddress);
    }

    // ============================================
    // FIND OR CREATE USER
    // ============================================

    /**
     * Find existing user or create new one from OAuth data
     * Handles account linking if email already exists
     * 
     * PenTrack Rules:
     * - R-Admin and Pentester MUST have @rivedix.com email
     * - Other roles are not allowed via OAuth
     */
    async findOrCreateUser(
        oauthData: OAuthUserData,
        role: UserRole,
        ipAddress?: string,
    ): Promise<OAuthLoginResult> {
        let isNewUser = false;
        let linkedAccount = false;

        // ✅ Validate email domain for R-Admin/Pentester
        if (role === UserRole.R_ADMIN || role === UserRole.PENTESTER) {
            const emailDomain = oauthData.email.split('@')[1];
            if (emailDomain !== this.ALLOWED_DOMAIN) {
                throw new UnauthorizedException({
                    code: 'OAUTH_DOMAIN_NOT_ALLOWED',
                    message: `Only @${this.ALLOWED_DOMAIN} email addresses are allowed for ${role} role.`,
                });
            }
        } else {
            // OAuth is only for R-Admin and Pentester
            throw new UnauthorizedException({
                code: 'OAUTH_ROLE_NOT_ALLOWED',
                message: `OAuth login is only available for R-Admin and Pentester roles.`,
            });
        }

        // 1. Try to find user by email
        let user = await this.prisma.user.findUnique({
            where: { email: oauthData.email },
            include: {
                clientProfile: true,
                partnerProfile: true,
                pentesterProfile: true,
            },
        });

        if (user) {
            // 2. Check if email account already has this provider linked
            const hasProvider = await this.hasOAuthProvider(user.id, oauthData.provider);

            if (!hasProvider) {
                // 3. Link OAuth provider to existing account
                await this.linkOAuthProvider(
                    user.id,
                    oauthData.provider,
                    oauthData.providerId,
                    oauthData.email,
                    `${oauthData.firstName} ${oauthData.lastName}`,
                    oauthData.profileImage,
                );

                linkedAccount = true;

                this.logger.log(
                    `Linked ${oauthData.provider} to existing user: ${user.email}`,
                    'OAuthBaseService',
                );
            }

            // 4. Check role mismatch
            if (user.role !== role) {
                this.logger.warn(
                    `OAuth role mismatch for ${user.email}: expected ${role}, got ${user.role}`,
                    'OAuthBaseService',
                );
                throw new UnauthorizedException({
                    code: 'OAUTH_ROLE_MISMATCH',
                    message: `This account is registered as ${user.role}. Please use the correct role to login.`,
                });
            }

            // 5. Update last login
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLogin: new Date(),
                    lastLoginIp: ipAddress,
                },
            });
        } else {
            // 6. Create new user with OAuth provider
            user = await this.createOAuthUser(oauthData, role, ipAddress);

            if (!user) {
                throw new Error('Failed to create OAuth user');
            }

            isNewUser = true;

            this.logger.log(
                `Created new user via ${oauthData.provider}: ${user.email}`,
                'OAuthBaseService',
            );
        }

        if (!user) {
            throw new Error('User not found or created');
        }

        // 7. Create session
        const sessionToken = await this.sessionService.createSession(
            user.id,
            false, // OAuth doesn't use "remember me"
            undefined,
            ipAddress,
        );

        return {
            user: formatUserResponse(user),
            sessionToken,
            isNewUser,
            linkedAccount,
        };
    }

    // ============================================
    // OAUTH PROVIDER MANAGEMENT
    // ============================================

    /**
     * Check if user has specific OAuth provider linked
     */
    private async hasOAuthProvider(
        userId: string,
        provider: OAuthProvider,
    ): Promise<boolean> {
        const existingProvider = await this.prisma.oAuthProvider.findUnique({
            where: {
                userId_provider: {
                    userId,
                    provider: provider as unknown as OAuthProviderType,
                },
            },
        });

        return !!existingProvider;
    }

    /**
     * Link OAuth provider to existing user
     */
    private async linkOAuthProvider(
        userId: string,
        provider: OAuthProvider,
        providerId: string,
        email: string,
        name: string,
        picture?: string,
    ): Promise<void> {
        await this.prisma.oAuthProvider.create({
            data: {
                userId,
                provider: provider as unknown as OAuthProviderType,
                providerId,
                email,
                name,
                picture,
            },
        });

        this.logger.log(
            `Linking ${provider} (${providerId}) to user ${userId}`,
            'OAuthBaseService',
        );
    }

    // ============================================
    // CREATE OAUTH USER
    // ============================================

    /**
     * Create new user from OAuth data
     */
    private async createOAuthUser(
        oauthData: OAuthUserData,
        role: UserRole,
        ipAddress?: string,
    ): Promise<any> {
        return this.prisma.$transaction(async (tx) => {
            // Extract company email and domain from @rivedix.com email
            const companyEmail = oauthData.email;
            const companyDomain = oauthData.email.split('@')[1];

            // 1. Create user (no password for OAuth)
            const user = await tx.user.create({
                data: {
                    email: oauthData.email,
                    password: null, // No password for OAuth users
                    firstName: oauthData.firstName,
                    lastName: oauthData.lastName,
                    phone: '', // Will be filled later if needed
                    profileImage: oauthData.profileImage,
                    role,
                    companyEmail,
                    companyDomain,
                    isEmailVerified: true, // OAuth emails are pre-verified
                    emailVerifiedAt: new Date(),
                    status: AccountStatus.ACTIVE,
                    lastLoginIp: ipAddress,
                },
            });

            // 2. Link OAuth provider
            await tx.oAuthProvider.create({
                data: {
                    userId: user.id,
                    provider: oauthData.provider as unknown as OAuthProviderType,
                    providerId: oauthData.providerId,
                    email: oauthData.email,
                    name: `${oauthData.firstName} ${oauthData.lastName}`,
                    picture: oauthData.profileImage,
                },
            });

            // 3. Create role-specific profile
            if (role === UserRole.PENTESTER) {
                await tx.pentester.create({
                    data: {
                        userId: user.id,
                        specialization: '', // To be filled later
                        location: '',
                        bio: null,
                    },
                });
            }

            return user;
        });
    }
}