import { Question } from "../entities/question.entity";

export class CreateQuizzDto {
    id: string;
    title: string;
    description:string;
    questions: Question[];
}
