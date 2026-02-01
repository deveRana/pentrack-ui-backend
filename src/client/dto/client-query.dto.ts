// src/client/dto/client-query.dto.ts

import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ClientProjectQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    @IsIn(['all', 'NOT_STARTED', 'IN_PROGRESS', 'TESTING_COMPLETE', 'REPORT_SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED', 'OVERDUE'])
    status?: string;

    @IsOptional()
    @IsString()
    service?: string;
}

export class ClientReportQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    service?: string;

    @IsOptional()
    @IsString()
    @IsIn(['7days', '30days', '90days', 'all'])
    dateRange?: string;
}