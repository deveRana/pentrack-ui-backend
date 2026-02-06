import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
export class CreateProjectDto {
    @IsString() @IsNotEmpty() name: string;
    @IsString() @IsOptional() description?: string;
    @IsUUID() @IsNotEmpty() clientId: string;
    @IsUUID() @IsOptional() pentesterId?: string;
    @IsString() @IsOptional() scopeOfWork?: string;
}
export class UpdateProjectDto extends CreateProjectDto { }