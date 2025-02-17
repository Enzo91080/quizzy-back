import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from '../firebase.service';

@Controller('ping')
export class PingController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get()
  async ping() {
    console.log('📡 Requête ping reçue');
    let databaseStatus = 'KO';

    try {
      const isConnected = await this.firebaseService.checkFirestoreConnection();
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
    };
  }
}
