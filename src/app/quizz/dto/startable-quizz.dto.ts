// --- startable-quizz.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';

export class StartableQuizDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Le titre du quiz ne doit pas être vide' })
    title: string;

    @ApiProperty({ type: [QuestionDto] })
    @IsArray({ message: 'Le quiz doit contenir au moins une question' })
    @ArrayMinSize(1, { message: 'Le quiz doit contenir au moins une question' })
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}