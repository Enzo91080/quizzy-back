import { Test, TestingModule } from '@nestjs/testing';
import { PingController } from './ping.controller';
import { VersionRepositoryService } from './version-repository.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('PingController UNIT TEST', () => {
  let controller: PingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [
        {
          provide: VersionRepositoryService,
          useValue: { getVersion: () => Promise.resolve('1') },
        },
      ],
    }).compile();

    controller = module.get<PingController>(PingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});

describe('PingController "INTEGRATION"', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [
        {
          provide: VersionRepositoryService,
          useValue: { getVersion: () => Promise.resolve('1') },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
});