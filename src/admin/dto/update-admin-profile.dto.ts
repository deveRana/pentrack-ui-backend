// src/admin/dto/update-admin-profile.dto.ts

import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { PHONE_REGEX, ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * DTO for updating Admin profile
 * Admin can update: firstName, lastName, phone
 * Email cannot be changed
 */
export class UpdateAdminProfileDto {
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

    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(PHONE_REGEX, { message: ADMIN_ERROR_MESSAGES.INVALID_PHONE_FORMAT })
    phone: string; // Expected format: +919876543210 (with country code)
}