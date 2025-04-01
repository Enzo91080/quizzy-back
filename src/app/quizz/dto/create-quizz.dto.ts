import { ApiProperty } from "@nestjs/swagger";
import { CreateQuestionDto } from "./create-question.dto";

export class CreateQuizzDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;
}

export class CreateQuizzWithQuestionsDto extends CreateQuizzDto {
    @ApiProperty({ type: [CreateQuestionDto] })
    questions: CreateQuestionDto[];
}




