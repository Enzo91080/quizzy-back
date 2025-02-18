import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

dotenv.config();

@Injectable()
export class FirebaseService {
    constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) {}

    async checkFirestoreConnection(): Promise<boolean> {
        try {
            const testCollection = this.fa.firestore.collection('test');
            const allTestDocs = (await testCollection.get()).docs;
            return true;
        } catch (error) {
            console.error('❌ Erreur de connexion à Firestore:', error);
            return false;
        }
    }
}
