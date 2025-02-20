import { Quizz } from "./quizz.entity";

export class Question {
    title: string;
    answers: {
        title: string;
        isCorrect: boolean;
    }[];
}
