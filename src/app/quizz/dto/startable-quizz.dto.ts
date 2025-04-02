import {
    IsNotEmpty,
    IsString,
    IsArray,
    ArrayMinSize,
    ValidateNested,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'IsValidAnswers', async: false })
class IsValidAnswersConstraint implements ValidatorConstraintInterface {
    validate(answers: any[], _args: ValidationArguments) {
        if (!Array.isArray(answers) || answers.length < 2) return false;

        const correctCount = answers.filter((a) => a.isCorrect).length;
        return correctCount === 1;
    }

    defaultMessage(): string {
        return 'Une question doit avoir exactement une seule bonne réponse et au moins deux propositions';
    }
}

class QuestionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Le titre de la question ne doit pas être vide' })
    title: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(2, {
        message: 'Chaque question doit avoir au moins deux réponses',
    })
    @Validate(IsValidAnswersConstraint)
    answers: { text: string; isCorrect: boolean }[];
}

export class StartableQuizDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Le titre du quiz ne doit pas être vide' })
    title: string;

    @ApiProperty()
    @IsArray({ message: 'Le quiz doit contenir au moins une question' })
    @ArrayMinSize(1, { message: 'Le quiz doit contenir au moins une question' })
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}