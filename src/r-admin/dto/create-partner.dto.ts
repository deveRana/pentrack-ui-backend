// ===== src/r-admin/dto/create-partner.dto.ts =====
import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches } from 'class-validator';
import { PHONE_REGEX } from '@admin/constants/admin.constants';

export class CreatePartnerDto {
    @IsString() @IsNotEmpty() companyName: string;
    @IsString() @IsNotEmpty() industry: string;
    @IsString() @IsNotEmpty() address: string;
    @IsString() @IsOptional() website?: string;
    @IsString() @IsNotEmpty() pointOfContact: string;
    @IsEmail() @IsNotEmpty() pointOfContactEmail: string;
    @IsString() @Matches(PHONE_REGEX) pointOfContactPhone: string;
}

export class UpdatePartnerDto extends CreatePartnerDto { }