// ===== src/r-admin/dto/update-project.dto.ts =====
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { ProjectStatus, ProjectPriority } from '@prisma/client';

export class UpdateProjectDto {
    @IsString() @IsNotEmpty() name: string;
    @IsString() @IsOptional() description?: string;
    @IsUUID() @IsNotEmpty() clientId: string;
    @IsUUID() @IsOptional() pentesterId?: string;
    @IsString() @IsOptional() scopeOfWork?: string;
    @IsString() @IsOptional() objectives?: string;
    @IsString() @IsOptional() targetUrls?: string;
    @IsArray() @IsOptional() services?: string[];
    @IsEnum(ProjectStatus) @IsOptional() status?: ProjectStatus;
    @IsEnum(ProjectPriority) @IsOptional() priority?: ProjectPriority;
    @IsDateString() @IsOptional() startDate?: string;
    @IsDateString() @IsOptional() endDate?: string;
    @IsDateString() @IsOptional() deadline?: string;
}