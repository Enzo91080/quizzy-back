import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FakeAuthMiddleware } from '../modules/auth/fake-auth-middleware.service';
import { UsersModule } from './users.module';
import { UsersRepository } from './users.repository';


class FakeUserRepository {
  private _db: { uid: string, username: string }[] = [];
  async createUser(uid: string, username: string): Promise<void> {
    this._db.push({ uid, username });
    return Promise.resolve();
  }

  async getUser(uid: string): Promise<any> {
    return Promise.resolve(this._db.find(u => u.uid === uid));
  }
}

describe('UsersController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersRepository).useClass(FakeUserRepository)
      .compile();


    app = moduleFixture.createNestApplication();
    app.use(new FakeAuthMiddleware().use);
    await app.init();

    FakeAuthMiddleware.Reset();
  });


  describe('Authenticated routes', () => {

    //teste la creation d'un user ((issue 3))
    it('POST /users - should create a user (issue 3)', async () => {
      const createUserDto = { username: 'testUser' };
      FakeAuthMiddleware.SetUser('test-uid');

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
    });

    // Teste la route GET /users/me, recuperation des donnees de l'user connecté ((issue 4))
    it('GET /users/me - should return authenticated user info (issue 4)', async () => {
      FakeAuthMiddleware.SetUser('test-uid', 'test@example.com');
      const createUserDto = { username: 'testUser' };
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(200);

      expect(response.body).toEqual({
        uid: 'test-uid',
        username: 'testUser',
        email: 'test@example.com',
      });
    });

    // Teste la route POST /users/me si le token est invalide
    it('GET /users/me - should return 401 if no token provided', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    // Teste la route POST /users avec un token invalide
    it('POST /users - should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ username: 'testUser' })
        .expect(401);
    });
  });
});
