import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateQuestionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ type: () => [AnswerDto] })
    @IsString({ each: true })
    answers: AnswerDto[];
}

export class AnswerDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    isCorrect: boolean;
}