import { ApiProperty } from "@nestjs/swagger";
import { CreateQuestionDto } from "./create-question.dto";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuizzDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string;
}

export class CreateQuizzWithQuestionsDto extends CreateQuizzDto {
    @ApiProperty({ type: [CreateQuestionDto] })
    questions: CreateQuestionDto[];
}




