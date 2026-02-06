import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsUUID, Matches } from 'class-validator';
import { PHONE_REGEX } from '@admin/constants/admin.constants';
export class CreateClientDto {
    @IsString() @IsNotEmpty() companyName: string;
    @IsString() @IsNotEmpty() industry: string;
    @IsString() @IsNotEmpty() address: string;
    @IsString() @IsOptional() website?: string;
    @IsString() @IsNotEmpty() pointOfContact: string;
    @IsEmail() @IsNotEmpty() pointOfContactEmail: string;
    @IsString() @Matches(PHONE_REGEX) pointOfContactPhone: string;
    @IsBoolean() @IsOptional() hasPartner?: boolean;
    @IsUUID() @IsOptional() partnerId?: string;
}
export class UpdateClientDto extends CreateClientDto { }