import { ApiProperty } from '@nestjs/swagger';
import { FindQuizzDto } from './find-quizz';

export class GetAllQuizApiResponse {
  @ApiProperty({ type: [FindQuizzDto] })
  data: FindQuizzDto[];

  @ApiProperty({
    example: {
      create: 'http://localhost:3000/api/quiz',
      start: 'http://localhost:3000/api/quiz/start',
    },
  })
  _links: {
    create: string;
    start?: string;
  };
}
