import { Module } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { QuizzController } from './quizz.controller';
import { QuizGateway } from './quizz.gateway';

@Module({
  controllers: [QuizzController],
  providers: [QuizzService, QuizGateway],
  exports: [QuizzService, QuizGateway],
})
export class QuizzModule { }
