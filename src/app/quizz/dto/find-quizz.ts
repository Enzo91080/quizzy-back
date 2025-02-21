import { ApiProperty } from '@nestjs/swagger';

export class FindQuizzDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ required: false, type: () => [QuestionDto] })
  questions?: {
    title: string;
    answers: { title: string; isCorrect: boolean }[];
  }[];

  @ApiProperty({ required: false })
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
