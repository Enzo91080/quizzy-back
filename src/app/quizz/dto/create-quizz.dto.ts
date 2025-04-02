// --- create-quizz.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';

export class CreateQuizzDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
}

export class CreateQuizzWithQuestionsDto extends CreateQuizzDto {
    @ApiProperty({ type: [QuestionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}
