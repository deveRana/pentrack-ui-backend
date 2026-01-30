
// src/admin/dto/system-log-query.dto.ts

import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { SystemLogType, SystemLogStatus } from '@prisma/client';
import { DEFAULT_LOGS_LIMIT } from '../constants/admin.constants';

/**
 * DTO for System Logs query parameters
 */
export class SystemLogQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit must not exceed 100' })
    limit?: number = DEFAULT_LOGS_LIMIT;

    @IsOptional()
    @IsEnum(SystemLogType, { message: 'Invalid log type' })
    type?: SystemLogType;

    @IsOptional()
    @IsEnum(SystemLogStatus, { message: 'Invalid log status' })
    status?: SystemLogStatus;

    @IsOptional()
    @IsString({ message: 'User ID must be a string' })
    userId?: string;

    @IsOptional()
    @IsString({ message: 'Search query must be a string' })
    searchQuery?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'End date must be a valid ISO date string' })
    endDate?: string;
}

/**
 * DTO for log export query parameters
 */
export class ExportLogsQueryDto extends SystemLogQueryDto {
    @IsOptional()
    @IsEnum(['csv', 'json', 'pdf'], { message: 'Invalid export format. Allowed: csv, json, pdf' })
    format?: 'csv' | 'json' | 'pdf' = 'csv';
}