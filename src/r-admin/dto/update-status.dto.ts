// ===== src/r-admin/dto/update-status.dto.ts =====
import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
    @IsEnum(ProjectStatus) @IsNotEmpty() status: ProjectStatus;
    @IsString() @IsOptional() notes?: string;
}