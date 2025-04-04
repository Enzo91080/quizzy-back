import { Controller, Get } from '@nestjs/common';
import { VersionRepositoryService } from './version-repository.service';

@Controller('ping')
export class PingController {
  constructor(private readonly versionRepository: VersionRepositoryService) {}

  @Get()
  async ping() {
    let databaseStatus = 'KO';
    let version = null;

    try {
      version = await this.versionRepository.getVersion();
      databaseStatus = 'OK';
    } catch (error) {
      console.error('Erreur de connexion à Firebase:', error);
    }

    return {
      status: databaseStatus === 'OK' ? 'OK' : 'Partial',
      // status: databaseStatus === 'OK' ? 'OK' : 'KO',
      details: {
        database: databaseStatus,
      },
      version,
    };
  }
}
