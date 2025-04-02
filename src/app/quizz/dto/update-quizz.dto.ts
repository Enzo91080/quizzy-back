// --- update-quizz.dto.ts ---
import { IsString } from 'class-validator';

export class UpdateQuizzDto {
    @IsString()
    title: string;
}