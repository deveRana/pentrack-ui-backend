import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCheckDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    serviceCategory: string;

    @IsString()
    @IsNotEmpty()
    subService: string;

    @IsBoolean()
    @IsOptional()
    isMandatory?: boolean;
}

export class UpdateCheckDto extends CreateCheckDto { }