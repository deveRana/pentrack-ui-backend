// ===== src/r-admin/dto/reject-report.dto.ts =====
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectReportDto {
    @IsString() @IsNotEmpty() comments: string;
}