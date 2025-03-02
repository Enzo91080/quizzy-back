import {
  Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, Param, Patch, Post, Put, Req, Res, UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../modules/auth/auth.decorator';
import { RequestWithUser } from '../modules/auth/model/request-with-user';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { FindQuizzDto } from './dto/find-quizz';
import { Question } from './entities/question.entity';
import { QuizzService } from './quizz.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTitleQuestionDto } from './dto/update-title-question.dto';

@ApiTags('Quizz') // 📌 Ajout d'une catégorie dans Swagger
@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) { }

  // Créer un quiz
  @Post()
  @Auth()
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiResponse({ status: 201, description: 'Quiz créé avec succès' })
  @ApiResponse({ status: 500, description: 'Erreur lors de la création du quiz' })
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
      const quizUrl = `${request.protocol}://${request.get('host')}/quizz/${quizId}`;

      res.setHeader('Location', quizUrl);
      return res.status(201).end();
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création du quiz');
    }
  }

  // Ajouter une question à un quiz
  @Post(':id/questions')
  @Auth()
  @ApiOperation({ summary: 'Ajouter une question à un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 201, description: 'Question ajoutée avec succès' })
  @ApiResponse({ status: 500, description: 'Erreur lors de l’ajout de la question' })
  async createNewQuestion(
    @Param('id') id: string,
    @Body() questionData: CreateQuestionDto,
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
      const userId = request.user?.uid;
      if (!userId) {
        throw new UnauthorizedException('Utilisateur non authentifié');
      }

      const questionId = await this.quizzService.addQuestionToQuiz(id, userId, questionData);
      if (!questionId) {
        throw new InternalServerErrorException('Impossible d’ajouter la question');
      }

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

  // Récupérer tous les quiz de l'utilisateur
  @Get()
  @Auth()
  @ApiOperation({ summary: 'Récupérer tous les quiz de l’utilisateur authentifié' })
  @ApiResponse({ status: 200, description: 'Liste des quiz récupérée avec succès' })
  async findAll(@Req() request: RequestWithUser): Promise<{ data: FindQuizzDto[] }> {
    const userId = request.user.uid;
    const quizzes = await this.quizzService.findAll(userId);
    const baseUrl = `${request.protocol}://${request.get('host')}/api/quizz`;

    return {
      data: quizzes.map(quiz => {
        const isStartable = this.quizzService.canStartQuiz(quiz as FindQuizzDto);
        return {
          ...quiz,
          _links: {
            create: `${baseUrl}`,
            ...(isStartable ? { start: `${baseUrl}/${quiz.id}/start` } : {})
          }
        };
      }) as FindQuizzDto[],
    };
  }

  // Récupérer un quiz par son ID
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un quiz spécifique' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Quiz trouvé' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  findOne(@Param('id') id: string) {
    return this.quizzService.findOne(id);
  }

  // Mettre à jour une question
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

  // Mettre à jour le titre d'un quiz
  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Mettre à jour le titre d’un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiBody({
    type: [UpdateTitleQuestionDto], // ✅ Swagger comprend maintenant que c'est un tableau d'objets
    description: 'Liste des opérations JSON Patch pour modifier le titre'
  })
  @ApiResponse({ status: 204, description: 'Titre mis à jour' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  async updateTitle(
    @Param('id') id: string,
    @Body() operations: UpdateTitleQuestionDto[], // ✅ Type explicitement défini
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    try {
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
      return res.status(500).json({ message: 'Error updating quiz title' });
    }
  }

  // Supprimer un quiz
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiParam({ name: 'id', description: 'ID du quiz' })
  @ApiResponse({ status: 200, description: 'Quiz supprimé' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  remove(@Param('id') id: string) {
    return this.quizzService.remove(id);
  }
}
