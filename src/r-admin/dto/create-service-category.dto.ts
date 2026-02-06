import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class SubServiceDto {
    @IsNumber()
    id: number; // Temporary ID from frontend (negative numbers like -1, -2)

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class CreateServiceCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubServiceDto)
    subServices: SubServiceDto[];
}

export class UpdateServiceCategoryDto extends CreateServiceCategoryDto { } 