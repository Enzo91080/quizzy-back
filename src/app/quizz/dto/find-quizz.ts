// --- find-quizz.dto.ts ---
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { QuestionDto } from './question.dto';

export class FindQuizzDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, type: [QuestionDto] })
  @IsOptional()
  questions?: QuestionDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  _links?: {
    create: string;
    start?: string;
  };
}
