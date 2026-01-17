import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitTaskDto {
    @IsString()
    @IsNotEmpty()
    proofUrl: string;

    @IsOptional()
    proofMeta?: {
        latitude?: number;
        longitude?: number;
        timestamp?: string;
    };
}

export class ReviewTaskDto {
    @IsString()
    @IsNotEmpty()
    status: 'APPROVED' | 'REJECTED';
}
