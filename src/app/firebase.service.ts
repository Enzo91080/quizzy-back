import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  onModuleInit() {
    try {
      if (!admin.apps.length) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(require(path.join(__dirname, '../assets/quizzy-back-firebase-key.json'))),
        });
        console.log('🔥 Firebase connecté avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
    }
  }

  getFirestore() {
    if (!this.firebaseApp) {
      throw new Error('Firebase app is not initialized');
    }
    return this.firebaseApp.firestore();
  }
}
