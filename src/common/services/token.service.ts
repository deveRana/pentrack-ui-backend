// src/common/services/token.service.ts
import { PrismaService } from '@core/database/prisma.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
    private jwtSecret: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    }

    // ============================================
    // JWT TOKEN METHODS (For Session/WebSocket)
    // ============================================

    /**
     * Decode JWT token (for WebSocket authentication)
     * Returns payload if valid, null if invalid
     */
    decodeToken(token: string): { sub: string; email: string; role: string } | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;
            return {
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Create JWT token (for sessions)
     */
    createJwtToken(userId: string, email: string, role: string): string {
        return jwt.sign(
            { sub: userId, email, role },
            this.jwtSecret,
            { expiresIn: '7d' } // 7 days
        );
    }

    // ============================================
    // RANDOM TOKEN GENERATION
    // ============================================

    /**
     * Generate a random secure token
     */
    generateSecureToken(length: number = 32): string {
        return randomBytes(length).toString('hex');
    }
}