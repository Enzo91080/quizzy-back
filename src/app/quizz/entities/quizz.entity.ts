import { Question } from "./question.entity";

export class Quizz {
    id: number;
    title: string;
    description: string;
    userId: string; 
    questions: Question[];
  
}
