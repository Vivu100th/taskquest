import { IsInt, Min, Max } from 'class-validator';

export class StartTaskDto {
    @IsInt()
    @Min(60)
    @Max(3600)
    durationSeconds: number;
}
