
// ===== src/r-admin/dto/update-profile.dto.ts =====
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { PHONE_REGEX } from '@admin/constants/admin.constants';

export class UpdateRAdminProfileDto {
    @IsString() @IsNotEmpty() firstName: string;
    @IsString() @IsNotEmpty() lastName: string;
    @IsString() @Matches(PHONE_REGEX) phone: string;
    @IsString() @IsOptional() region?: string;
}