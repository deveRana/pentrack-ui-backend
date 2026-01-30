// src/core/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppLogger } from '../logger/logger.service';
import { otpTemplate } from './templates/otp.template';

@Injectable()
export class MailService {
    private resend: Resend;
    private fromEmail: string;
    private frontendUrl: string;

    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
    ) {
        const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
        const emailFrom = this.configService.get<string>('EMAIL_FROM');

        if (!resendApiKey || !emailFrom) {
            throw new Error('RESEND_API_KEY and EMAIL_FROM must be set in .env');
        }

        this.resend = new Resend(resendApiKey);
        this.fromEmail = emailFrom;
        this.frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    }

    /**
     * Send OTP email for login
     * ✅ FIXED: otpTemplate expects (otp: string, expiryMinutes: number)
     */
    async sendOTPEmail(email: string, otp: string, firstName?: string): Promise<void> {
        try {
            const { error } = await this.resend.emails.send({
                from: `"PenTrack 🔐" <${this.fromEmail}>`,
                replyTo: 'info@rivedix.com',
                to: email,
                subject: 'Your PenTrack Login Code',
                html: otpTemplate(otp, 10), // ✅ Pass 10 minutes as expiry
            });

            if (error) {
                this.logger.error('Failed to send OTP email', error.message);
                throw new InternalServerErrorException('Failed to send OTP email');
            }

            this.logger.log(`OTP email sent to ${email}`);
        } catch (err) {
            this.logger.error('Failed to send OTP email', err);
            throw new InternalServerErrorException('Failed to send OTP email');
        }
    }
}