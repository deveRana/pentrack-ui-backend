// src/admin/dto/create-radmin.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { AccountStatus } from '@prisma/client';
import { PHONE_REGEX, ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * DTO for creating R-Admin account
 */
export class CreateRAdminDto {
    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(50, { message: 'First name must not exceed 50 characters' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
    lastName: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string; // Will be validated for @rivedix.com domain in service

    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(PHONE_REGEX, { message: ADMIN_ERROR_MESSAGES.INVALID_PHONE_FORMAT })
    phone: string; // Expected format: +919876543210

    @IsEnum(AccountStatus, { message: 'Invalid account status' })
    @IsOptional()
    status?: AccountStatus; // Default: ACTIVE
}
