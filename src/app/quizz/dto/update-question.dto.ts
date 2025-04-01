import { ApiProperty } from "@nestjs/swagger";
import { AnswerDto } from "./create-question.dto";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateQuestionDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ type: [AnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}