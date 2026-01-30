// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { OTPController } from './controllers/otp.controller';
import { OAuthController } from './controllers/oauth.controller';

// Services
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { OTPService } from './services/otp.service';

// OAuth Services
// import { OAuthBaseService } from './services/oauth/oauth-base.service'; // REMOVE THIS IMPORT
import { GoogleOAuthService } from './services/oauth/google-oauth.service';

// Repositories
import { AuthRepository } from './repositories/auth.repository';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Modules
import { CommonModule } from '@common/common.module';
import { MailModule } from '@core/mail/mail.module';
import { LoggerModule } from '@core/logger/logger.module';

@Module({
    imports: [
        CommonModule,
        ConfigModule,
        MailModule,
        LoggerModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: {
                    expiresIn: '7d',
                },
            }),
        }),
    ],
    controllers: [
        AuthController,
        OTPController,
        OAuthController,
    ],
    providers: [
        // Core Services
        AuthService,
        SessionService,
        OTPService,

        // OAuth Services - ONLY concrete implementations
        GoogleOAuthService, // KEEP THIS

        // Repositories
        AuthRepository,

        // Guards
        AuthGuard,
        RolesGuard,
    ],
    exports: [
        AuthService,
        SessionService,
        OTPService,
        AuthGuard,
        RolesGuard,
    ],
})
export class AuthModule { }