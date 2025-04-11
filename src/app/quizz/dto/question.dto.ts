// --- question.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerDto } from './create-question.dto';

export class QuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
