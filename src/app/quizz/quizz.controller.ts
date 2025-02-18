import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import { QuizzDto } from './dto/quizz.dto';

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
  create(@Body() createQuizzDto: CreateQuizzDto) {
    return this.quizzService.create(createQuizzDto);
  }

  @Get()
  async findAll(): Promise<GetAllQuizzResponse> {
    const quizzes = await this.quizzService.findAll();
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
