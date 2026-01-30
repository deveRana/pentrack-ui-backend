// src/core/mail/templates/radmin-welcome.template.ts

/**
 * R-Admin Welcome Email Template
 * 
 * Sent when a new R-Admin account is created by Super Admin
 * Includes account details and login instructions
 */

export function radminWelcomeTemplate(
    firstName: string,
    lastName: string,
    email: string,
    loginUrl: string,
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PenTrack</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
        }
        h1 {
            color: #1F2937;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .welcome-text {
            color: #6B7280;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #F3F4F6;
            border-left: 4px solid #4F46E5;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .info-box h3 {
            margin-top: 0;
            color: #1F2937;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            margin: 10px 0;
        }
        .info-label {
            font-weight: 600;
            color: #4B5563;
            min-width: 120px;
        }
        .info-value {
            color: #1F2937;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #4338CA;
        }
        .instructions {
            background-color: #EEF2FF;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .instructions h3 {
            color: #4F46E5;
            margin-top: 0;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
            color: #4B5563;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
        }
        .footer a {
            color: #4F46E5;
            text-decoration: none;
        }
        .security-notice {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #92400E;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🔐 PenTrack</div>
            <h1>Welcome to PenTrack!</h1>
            <p class="welcome-text">
                Hi ${firstName},<br>
                Your R-Admin (Regional Administrator) account has been created successfully.
            </p>
        </div>

        <!-- Account Details -->
        <div class="info-box">
            <h3>Your Account Details</h3>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${firstName} ${lastName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Role:</span>
                <span class="info-value">Regional Administrator (R-Admin)</span>
            </div>
        </div>

        <!-- Login Instructions -->
        <div class="instructions">
            <h3>How to Access Your Account</h3>
            <ol>
                <li>Click the "Login to PenTrack" button below</li>
                <li>Use Google OAuth to sign in with your <strong>@rivedix.com</strong> email</li>
                <li>You'll be redirected to your dashboard</li>
            </ol>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to PenTrack</a>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
            <strong>⚠️ Security Notice:</strong><br>
            You must use Google OAuth with your @rivedix.com company email to login. 
            OTP login is not available for R-Admin accounts.
        </div>

        <!-- What You Can Do -->
        <div class="info-box">
            <h3>As an R-Admin, you can:</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #4B5563;">
                <li>Manage clients and partners</li>
                <li>Create and assign projects</li>
                <li>Oversee pentester activities</li>
                <li>Review and approve reports</li>
                <li>Monitor project timelines</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                Need help? Contact us at 
                <a href="mailto:support@rivedix.com">support@rivedix.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #9CA3AF;">
                This is an automated email from PenTrack. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}