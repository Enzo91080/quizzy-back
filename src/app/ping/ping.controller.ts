import { Controller, Get } from '@nestjs/common';
import { VersionRepositoryService } from './version-repository.service';

@Controller('ping')
export class PingController {
  constructor(private readonly versionRepository: VersionRepositoryService) { }

  @Get()
  async ping() {
    let databaseStatus = 'KO';

    try {
      const isConnected = await this.versionRepository.getVersion();
      if (isConnected) {
        databaseStatus = 'OK';
      }
    } catch (error) {
      console.error('❌ Erreur de connexion à Firebase:', error);
    }

    return {
      status: databaseStatus === 'OK' ? 'OK' : 'Partial',
      details: {
        database: databaseStatus,
      },
      version: await this.versionRepository.getVersion(),
    };
  }
}
