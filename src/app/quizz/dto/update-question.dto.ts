// --- update-question.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QuestionDto } from './question.dto';

export class UpdateQuestionDto extends QuestionDto {
    @ApiProperty()
    @IsString()
    id: string;
}