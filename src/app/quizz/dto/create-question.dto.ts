import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional } from "class-validator";

export class AnswerDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}


export class CreateQuestionDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ type: [AnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}



