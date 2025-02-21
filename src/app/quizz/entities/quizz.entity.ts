import { Question } from "./question.entity";

export class Quizz {
    title: string;
    description: string;
    questions: Question[];
}
