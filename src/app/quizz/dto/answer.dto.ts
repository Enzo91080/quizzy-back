// --- answer.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class AnswerDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}