import { Test, TestingModule } from '@nestjs/testing';
import { QuizzService } from './quizz.service';
import { FirebaseAdmin, FirebaseModule } from 'nestjs-firebase';

describe('QuizzService', () => {
  let service: QuizzService;

  // Mock de FirebaseAdmin
  const mockFirebaseAdmin = {
    firestore: {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
        add: jest.fn().mockResolvedValue({ id: 'mocked-quiz-id' }),
        update: jest.fn().mockResolvedValue(null),
        delete: jest.fn().mockResolvedValue(null),
        where: jest.fn().mockReturnThis(),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzService,
        {
          provide: FirebaseModule, // On remplace FirebaseAdmin par un mock
          useValue: mockFirebaseAdmin,
        },
      ],
    }).compile();

    service = module.get<QuizzService>(QuizzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
