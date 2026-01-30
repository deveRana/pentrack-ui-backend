// src/core/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppLogger } from '../logger/logger.service';
import { otpTemplate } from './templates/otp.template';
import { radminWelcomeTemplate } from './templates/radmin-welcome.template';

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
     */
    async sendOTPEmail(email: string, otp: string, firstName?: string): Promise<void> {
        try {
            const { error } = await this.resend.emails.send({
                from: `"PenTrack 🔐" <${this.fromEmail}>`,
                replyTo: 'info@rivedix.com',
                to: email,
                subject: 'Your PenTrack Login Code',
                html: otpTemplate(otp, 10),
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

    /**
     * Send welcome email to newly created R-Admin
     */
    async sendRAdminWelcomeEmail(
        email: string,
        firstName: string,
        lastName: string,
    ): Promise<void> {
        try {
            const loginUrl = `${this.frontendUrl}/google`;

            const { error } = await this.resend.emails.send({
                from: `"PenTrack 🚀" <${this.fromEmail}>`,
                replyTo: 'info@rivedix.com',
                to: email,
                subject: 'Welcome to PenTrack - Your R-Admin Account',
                html: radminWelcomeTemplate(firstName, lastName, email, loginUrl),
            });

            if (error) {
                this.logger.error('Failed to send R-Admin welcome email', error.message);
                throw new InternalServerErrorException('Failed to send welcome email');
            }

            this.logger.log(`R-Admin welcome email sent to ${email}`);
        } catch (err) {
            this.logger.error('Failed to send R-Admin welcome email', err);
            throw new InternalServerErrorException('Failed to send welcome email');
        }
    }

    /**
     * Send account update notification email to R-Admin
     */
    async sendRAdminUpdateEmail(
        email: string,
        firstName: string,
        updateDetails: string,
    ): Promise<void> {
        try {
            const loginUrl = `${this.frontendUrl}/google`;

            const { error } = await this.resend.emails.send({
                from: `"PenTrack 🔔" <${this.fromEmail}>`,
                replyTo: 'info@rivedix.com',
                to: email,
                subject: 'PenTrack - Your Account Has Been Updated',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #4F46E5; }
        .info-box { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #4F46E5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Account Update Notification</h2>
        <p>Hi ${firstName},</p>
        <p>Your R-Admin account on PenTrack has been updated by the Super Admin.</p>
        
        <div class="info-box">
            <strong>Changes made:</strong><br>
            ${updateDetails}
        </div>
        
        <p>If you did not expect this change, please contact the administrator immediately.</p>
        
        <a href="${loginUrl}" class="button">Login to PenTrack</a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated notification from PenTrack.
        </p>
    </div>
</body>
</html>
                `.trim(),
            });

            if (error) {
                this.logger.error('Failed to send R-Admin update email', error.message);
                // Don't throw - this is non-critical
            } else {
                this.logger.log(`R-Admin update email sent to ${email}`);
            }
        } catch (err) {
            this.logger.error('Failed to send R-Admin update email', err);
            // Don't throw - this is non-critical
        }
    }
}