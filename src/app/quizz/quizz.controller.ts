import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Put, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../modules/auth/auth.decorator';
import { RequestWithUser } from '../modules/auth/model/request-with-user';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { FindQuizzDto } from './dto/find-quizz';
import { Question } from './entities/question.entity';
import { QuizzService } from './quizz.service';



@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) { }

  @Post()
  @Auth()
  async create(
    @Body() createQuizzDto: CreateQuizzDto,
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      const uid = request.user?.uid;
      if (!uid) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      const quizId = await this.quizzService.create(createQuizzDto, uid);

      // Générer l'URL complète du quiz
      const quizUrl = `${request.protocol}://${request.get('host')}/quizz/${quizId}`;

      res.setHeader('Location', quizUrl);
      return res.status(201).end(); // Répondre avec 201 quiz cree
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la création du quiz'
      );
    }
  }

  @Post(':id/questions')
  @Auth()
  async createNewQuestion(
    @Param('id') id: string,
    @Body() questionData: Question,
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      const userId = request.user?.uid;
      if (!userId) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      // Ajouter la question au quiz via le service
      const questionId = await this.quizzService.addQuestionToQuiz(id, userId, questionData);

      if (!questionId) {
        throw new InternalServerErrorException('Impossible d’ajouter la question');
      }

      // Générer l'URL de la nouvelle ressource créée
      const questionUrl = `${request.protocol}://${request.get('host')}/quizz/${id}/questions/${questionId}`;

      res.setHeader('Location', questionUrl);
      return res.status(201).json({ id: questionId, message: 'Question ajoutée avec succès' });
    } catch (error) {
      if (error.message === 'Quiz not found or unauthorized') {
        throw new UnauthorizedException('Quiz non trouvé ou accès interdit');
      }
      throw new InternalServerErrorException('Erreur lors de l’ajout de la question');
    }
  }

  @Get()
  @Auth()
  async findAll(@Req() request: RequestWithUser): Promise<{ data: FindQuizzDto[]; _links: { create: string } }> {
    const userId = request.user.uid;
    const quizzes = await this.quizzService.findAll(userId);
    return {
      data: quizzes as FindQuizzDto[],
      _links: {
        create: `${request.protocol}://${request.get('host')}/api/quizz`
      }
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzService.findOne(id);
  }

  @Put(':id/questions/:questionId')
  @Auth()
  async updateQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() questionData: Question,
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      const userId = request.user.uid;
      const updated = await this.quizzService.updateQuestion(id, userId, questionId, questionData);

      if (!updated) {
        return res.status(404).json({ message: 'Question not found or does not belong to user' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating question' });
    }
  }

  @Patch(':id')
  @Auth()
  async updateTitle(
    @Param('id') id: string,
    @Body() operations: { op: string; path: string; value: string }[],
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      // Vérification du format de l'opération
      const operation = operations.find(op => op.op === 'replace' && op.path === '/title');
      if (!operation || !operation.value) {
        return res.status(400).json({ message: 'Invalid operation: missing or incorrect title update' });
      }

      const userId = request.user.uid;
      const updated = await this.quizzService.updateTitle(id, userId, operation.value);

      if (!updated) {
        return res.status(404).json({ message: 'Quiz not found or does not belong to user' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating quiz title' });
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzService.remove(id);
  }
}
