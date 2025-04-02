import { Test, TestingModule } from '@nestjs/testing';
import { QuizzService } from './quizz.service';

describe('QuizzService', () => {
  let service: QuizzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzService,
        {
          provide: 'FIREBASE_TOKEN', // Ajout du mock du token Firebase
          useValue: {}, // Mock vide ou faux service si besoin
        },
      ],
    }).compile();

    service = module.get<QuizzService>(QuizzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
