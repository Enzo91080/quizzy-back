import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindQuizzDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, type: () => [QuestionDto] })
  @IsString({ each: true })
  questions?: {
    title: string;
    answers: { title: string; isCorrect: boolean }[];
  }[];


  @ApiProperty({ required: false })
  @IsString()
  _links?: {
    create: string;
    start?: string;
  };
}

class QuestionDto {
  @ApiProperty()
  title: string;

  @ApiProperty({ type: () => [AnswerDto] })
  answers: { title: string; isCorrect: boolean }[];
}

class AnswerDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  isCorrect: boolean;
}
