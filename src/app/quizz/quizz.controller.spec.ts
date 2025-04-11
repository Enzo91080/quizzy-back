import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FakeAuthMiddleware } from '../modules/auth/fake-auth-middleware.service';
import { QuizzModule } from './quizz.module';
import { QuizzService } from './quizz.service';
import axios from 'axios';

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

describe('QuizzController (test d integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  const baseUrl = '/quiz';
  beforeAll(async () => {
    try {
      const authResponse = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4',
        {
          email: 'aniss@exemple.com',
          password: '123456',
          returnSecureToken: true,
        }
      );

      expect(authResponse.status).toBe(200); // Vérifie que l'authentification réussit
      authToken = authResponse.data.idToken;
      userId = authResponse.data.localId;
      console.log("Authentification réussie, UID reçu :", userId);
    } catch (error) {
      console.error('Erreur d\'authentification:', JSON.stringify(error.response?.data || error.message));
      throw new Error("Impossible de s'authentifier.");
    }
  });

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

  // Teste l'ajout d'une question à un quiz ((issue 9))
  it('POST /quiz/:id/questions - should add a question to a quiz (issue 9)', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const quizResponse = await request(app.getHttpServer())
      .post('/quiz')
      .send({ title: 'Test Quiz' })
      .expect(201);

    const quizId = quizResponse.header.location.split('/').pop();
    const response = await request(app.getHttpServer())
      .post(`/quiz/${quizId}/questions`)
      .send({ text: 'What is NestJS?' })
      .expect(201);

    expect(response.body).toHaveProperty('id');

  });




  // Teste la mise à jour du titre d'un quiz ((issue 8))
  it('PATCH /quiz/:id - should update quiz title (issue 8)', async () => {
    FakeAuthMiddleware.SetUser('test-uid');
    const createResponse = await request(app.getHttpServer())
      .post('/quiz')
      .send({ title: 'Old Title' })
      .expect(201);

    const quizId = createResponse.header.location.split('/').pop();
    await request(app.getHttpServer())
      .patch(`/quiz/${quizId}`)
      .send([{ op: 'replace', path: '/title', value: 'New Title' }])
      .expect(204);

    const getResponse = await request(app.getHttpServer())
      .get(`/quiz/${quizId}`)
      .expect(200);

    expect(getResponse.body.title).toBe('New Title');
  });

  //cas d'erreur : quiz non trouvé
  it('PATCH /quiz/:id - should return 404 if quiz does not exist', async () => {
    FakeAuthMiddleware.SetUser('test-uid');

    await request(app.getHttpServer())
      .patch('/quiz/nonexistent-id')
      .send([{ op: 'replace', path: '/title', value: 'Whatever' }])
      .expect(404);
  });

  // cas d'erreur : chemin d'accès non valide
  it('PATCH /quiz/:id - should return 400 for invalid patch operation', async () => {
    FakeAuthMiddleware.SetUser('test-uid');

    const createResponse = await request(app.getHttpServer())
      .post('/quiz')
      .send({ title: 'Initial Title' })
      .expect(201);

    const quizId = createResponse.header.location.split('/').pop();

    await request(app.getHttpServer())
      .patch(`/quiz/${quizId}`)
      .send([{ op: 'remove', path: '/title' }])
      .expect(400);
  });

});