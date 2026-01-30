// src/core/mail/templates/otp.template.ts

/**
 * OTP Email Template
 * 
 * Professional email template for sending OTP codes
 * Used for: Admin, Client, Partner login
 */
export const otpTemplate = (otp: string, expiryMinutes: number = 10): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your PenTrack Login Code</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f7fa;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        h1 {
            color: #1a202c;
            font-size: 24px;
            margin: 0 0 20px 0;
            font-weight: 600;
        }
        p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', monospace;
        }
        .otp-label {
            color: #e0e7ff;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .warning-box {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-text {
            color: #c53030;
            font-size: 14px;
            margin: 0;
        }
        .info-box {
            background-color: #ebf8ff;
            border-left: 4px solid #4299e1;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-text {
            color: #2c5282;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #718096;
            font-size: 14px;
            margin: 5px 0;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">🔐 PenTrack</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h1>Your Login Code</h1>
            <p>Hello,</p>
            <p>Use the following code to complete your login to PenTrack:</p>

            <!-- OTP Box -->
            <div class="otp-box">
                <div class="otp-label">Your One-Time Password</div>
                <p class="otp-code">${otp}</p>
            </div>

            <!-- Warning -->
            <div class="warning-box">
                <p class="warning-text">
                    ⚠️ This code will expire in ${expiryMinutes} minutes. Do not share this code with anyone.
                </p>
            </div>

            <!-- Info -->
            <div class="info-box">
                <p class="info-text">
                    💡 If you didn't request this code, please ignore this email or contact our support team.
                </p>
            </div>

            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The PenTrack Team</strong>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                This is an automated message from PenTrack.
            </p>
            <p class="footer-text">
                Need help? <a href="mailto:support@pentrack.com" class="footer-link">Contact Support</a>
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                © ${new Date().getFullYear()} PenTrack. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};