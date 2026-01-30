// src/admin/dto/radmin-query.dto.ts

import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_RADMIN_LIMIT } from '../constants/admin.constants';

/**
 * DTO for R-Admin list query parameters
 */
export class RAdminQueryDto {
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
    limit?: number = DEFAULT_RADMIN_LIMIT;

    @IsOptional()
    @IsString({ message: 'Search query must be a string' })
    search?: string;
}
