// src/core/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable() // Remove the scope parameter - makes it DEFAULT (singleton)
export class AppLogger implements LoggerService {
    private context?: string;
    private logEnabled: boolean;
    private logLevel: string;

    constructor(private readonly configService: ConfigService) {
        this.logEnabled = this.configService.get<string>('LOG_ENABLED', 'true') === 'true';
        this.logLevel = this.configService.get<string>('LOG_LEVEL', 'log');
    }

    setContext(context: string) {
        this.context = context;
    }

    log(message: any, context?: string) {
        if (!this.logEnabled || !this.shouldLog('log')) return;
        console.log(`[${context || this.context}] ${message}`);
    }

    error(message: any, trace?: string, context?: string) {
        if (!this.logEnabled || !this.shouldLog('error')) return;
        console.error(`[${context || this.context}] ${message}`, trace || '');
    }

    warn(message: any, context?: string) {
        if (!this.logEnabled || !this.shouldLog('warn')) return;
        console.warn(`[${context || this.context}] ${message}`);
    }

    debug(message: any, context?: string) {
        if (!this.logEnabled || !this.shouldLog('debug')) return;
        console.debug(`[${context || this.context}] ${message}`);
    }

    verbose(message: any, context?: string) {
        if (!this.logEnabled || !this.shouldLog('verbose')) return;
        console.log(`[${context || this.context}] [VERBOSE] ${message}`);
    }

    private shouldLog(level: string): boolean {
        const levels = ['error', 'warn', 'log', 'debug', 'verbose'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }
}