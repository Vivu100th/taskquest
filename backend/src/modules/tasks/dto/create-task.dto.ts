import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum Difficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    EPIC = 'EPIC',
}

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    categoryId: string;

    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsInt()
    @Min(0)
    basePoints: number;

    @IsBoolean()
    @IsOptional()
    requiresPhoto?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresGps?: boolean;

    @IsString()
    @IsOptional()
    startTime?: string;

    @IsString()
    @IsOptional()
    endTime?: string;

    @IsInt()
    @IsOptional()
    duration?: number;

    @IsBoolean()
    @IsOptional()
    isAllDay?: boolean;
}
