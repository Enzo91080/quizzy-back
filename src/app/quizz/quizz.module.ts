import { Module } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { QuizzController } from './quizz.controller';
import { QuizGateway } from './quizz.gateway';

@Module({
  controllers: [QuizzController],
  providers: [QuizzService, QuizGateway], // 👈 Ajouter ici
  exports: [QuizzService, QuizGateway], // 👈 Exporter le service et le gateway
})
export class QuizzModule { }
