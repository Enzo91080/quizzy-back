import { ApiProperty } from "@nestjs/swagger";

export class CreateQuestionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ type: () => [AnswerDto] })
    answers: AnswerDto[];
}

export class AnswerDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    isCorrect: boolean;
}