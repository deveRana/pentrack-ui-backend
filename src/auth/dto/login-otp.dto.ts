// src/auth/dto/login-otp.dto.ts
import { IsEmail, IsString, MaxLength } from 'class-validator';

/**
 * DTO for requesting OTP (Step 1 of login)
 * Used by: Admin, Client, Partner
 */
export class RequestOTPDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;
}

/**
 * DTO for verifying OTP and logging in (Step 2 of login)
 * Used by: Admin, Client, Partner
 */
export class VerifyOTPDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;

    @IsString({ message: 'OTP code must be a string' })
    @MaxLength(6, { message: 'OTP code must be 6 characters' })
    code: string;
}