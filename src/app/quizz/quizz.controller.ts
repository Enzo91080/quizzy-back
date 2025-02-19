import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Render,
  Res ,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import { QuizzDto } from './dto/quizz.dto';
import { Auth } from '../modules/auth/auth.decorator';
import { RequestWithUser } from '../modules/auth/model/request-with-user';
import { join } from 'path';
import { Response } from 'express';



interface GetAllQuizzResponse {
  data: QuizzDto[];
}

interface Quizz {
  id: string;
  title: string;
}

@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}


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
      return res.status(201).end(); // Répondre avec 201 Created et aucun corps
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création du quiz');
    }
  }


  @Get()
  @Auth()
  async findAll(@Req() request: RequestWithUser): Promise<GetAllQuizzResponse> {
    const userId = request.user.uid;
    const quizzes = await this.quizzService.findAll(userId);
    return { data: quizzes as QuizzDto[] };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizzDto: UpdateQuizzDto) {
    return this.quizzService.update(id, updateQuizzDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzService.remove(id);
  }
}
