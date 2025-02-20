import { Quizz } from "./quizz.entity";

export class Question {
    id: string;
    title: string;
    answers: {
        title: string;
        isCorrect: boolean;
    }[];
}
