// src/common/services/hash.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashService {
    private readonly saltRounds: number;

    constructor(private configService: ConfigService) {
        this.saltRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 10;
    }

    /**
     * Hash a plain text password using bcrypt
     * bcrypt generates a different hash each time (due to salt)
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Compare plain text password with hashed password
     */
    async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Hash a token using SHA-256 (deterministic hashing)
     * This ensures the same token always produces the same hash
     * Use this for OTP codes, verification tokens, reset tokens, etc.
     */
    hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    /**
     * Compare plain token with hashed token
     * For SHA-256, we just hash the plain token and compare directly
     */
    compareToken(token: string, hashedToken: string): boolean {
        const hashedInput = this.hashToken(token);
        return hashedInput === hashedToken;
    }
}