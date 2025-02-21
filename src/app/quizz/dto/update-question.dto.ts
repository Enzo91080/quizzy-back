import { ApiProperty } from "@nestjs/swagger";
import { AnswerDto } from "./create-question.dto";

export class UpdateQuestionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ type: () => [AnswerDto] })
    answers: AnswerDto[];
}