import { IsInt, Min, Max } from 'class-validator';

export class StartTaskDto {
    @IsInt()
    @Min(60)
    @Max(14400)
    durationSeconds: number;
}
