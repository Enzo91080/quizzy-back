import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FakeAuthMiddleware } from '../modules/auth/fake-auth-middleware.service';
import { QuizzModule } from './quizz.module';
import { QuizzService } from './quizz.service';

class FakeQuizzService {
  private quizzes = [];
  private questions = [];

  async create(createQuizzDto, userId) {
    const quiz = { id: `quiz-${this.quizzes.length + 1}`, ...createQuizzDto, userId };
    this.quizzes.push(quiz);
    return quiz.id;
  }

  async addQuestionToQuiz(quizId, userId, questionData) {
    if (!this.questions[quizId]) {
      this.questions[quizId] = [];
    }
    const questionId = `q-${this.questions[quizId].length + 1}`;
    this.questions[quizId].push({ id: questionId, ...questionData });
    return questionId;
  }

  async findAll(userId) {
    return this.quizzes.filter(q => q.userId === userId);
  }

  async findOne(id) {
    return this.quizzes.find(q => q.id === id);
  }

  async updateTitle(quizId, userId, newTitle) {
    const quiz = this.quizzes.find(q => q.id === quizId && q.userId === userId);
    if (quiz) {
      quiz.title = newTitle;
      return true;
    }
    return false;
  }
}

describe('QuizzController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [QuizzModule],
    })
      .overrideProvider(QuizzService).useClass(FakeQuizzService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(new FakeAuthMiddleware().use);
    await app.init();

    FakeAuthMiddleware.Reset();
  });

  // Teste la création d'un quiz
  it('POST /quizz - should create a quiz', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const response = await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Test Quiz' })
      .expect(201);

    expect(response.header.location).toMatch(/\/quizz\/quiz-\d+/);
  });

  // Teste l'ajout d'une question à un quiz
  it('POST /quizz/:id/questions - should add a question to a quiz', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const quizResponse = await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Test Quiz' })
      .expect(201);

    const quizId = quizResponse.header.location.split('/').pop();
    const response = await request(app.getHttpServer())
      .post(`/quizz/${quizId}/questions`)
      .send({ text: 'What is NestJS?' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  // Teste la récupération de tous les quiz de l'utilisateur
  it('GET /quizz - should return all quizzes for the user', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Quiz 1' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Quiz 2' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/quizz')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
  });

  // Teste la récupération d'un quiz ou tous les quiz par ID et vérifie que le titre est correct
  it('GET /quizz/:id - should return a single quiz', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const quizResponse = await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Test Quiz' })
      .expect(201);

    const quizId = quizResponse.header.location.split('/').pop();
    const response = await request(app.getHttpServer())
      .get(`/quizz/${quizId}`)
      .expect(200);

    expect(response.body.title).toBe('Test Quiz');
  });

  // Teste la mise à jour du titre d'un quiz
  it('PATCH /quizz/:id - should update quiz title', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const createResponse = await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Old Title' })
      .expect(201);

    const quizId = createResponse.header.location.split('/').pop();
    await request(app.getHttpServer())
      .patch(`/quizz/${quizId}`)
      .send([{ op: 'replace', path: '/title', value: 'New Title' }])
      .expect(204);
  });


  // Teste la mise à jour d'une question
  it('PUT /quizz/:id/questions/:questionId - should update a question', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const quizResponse = await request(app.getHttpServer())
      .post('/quizz')
      .send({ title: 'Test Quiz' })
      .expect(201);
    const quizId = quizResponse.header.location.split('/').pop();
    const questionResponse = await request(app.getHttpServer())
      .post(`/quizz/${quizId}/questions`)
      .send({ text: 'What is NestJS?' })
      .expect(201);
    const questionId = questionResponse.body.id;
    await request(app.getHttpServer())
      .put(`/quizz/${quizId}/questions/${questionId}`)
      .send({ text: 'What is NestJS Framework?' })
      .expect(204);
  });

});
