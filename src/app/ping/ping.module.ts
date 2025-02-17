import { Module } from '@nestjs/common';
import { PingController } from './ping.controller';
import { VersionRepositoryService } from './version-repository.service';
import { FirebaseService } from '../firebase.service';

@Module({
  controllers: [PingController],
  providers: [VersionRepositoryService, FirebaseService],
})
export class PingModule {}
