// ===== src/r-admin/dto/approve-report.dto.ts =====
import { IsBoolean, IsArray, IsString, IsOptional, IsEmail } from 'class-validator';

export class ApproveReportDto {
    @IsBoolean() publishToPortal: boolean;
    @IsBoolean() sendToSpoc: boolean;
    @IsArray() @IsEmail({}, { each: true }) customEmails: string[];
    @IsString() @IsOptional() notes?: string;
}