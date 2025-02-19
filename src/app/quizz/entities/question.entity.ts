import { Quiz } from './quiz.entity';

export class Question {
    id: string;

    question: string;
    

    choix: string[];
  
    answers: string[];
  
    
    quiz: Quiz;
}
