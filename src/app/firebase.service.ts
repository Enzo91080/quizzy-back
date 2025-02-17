import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FirebaseService {
    private firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
    };

    private app;
    private auth;
    private firestore;

    constructor() {
        this.app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.app);
        this.firestore = getFirestore(this.app);
        this.checkConnection();
    }

    private checkConnection() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                console.log('🔥 Utilisateur connecté:', user.uid);
            } else {
                console.log('❌ Aucun utilisateur connecté');
            }
        });
    }

    async checkFirestoreConnection(): Promise<boolean> {
        try {
            const testCollection = collection(this.firestore, 'test');
            await getDocs(testCollection);
            return true;
        } catch (error) {
            console.error('❌ Erreur de connexion à Firestore:', error);
            return false;
        }
    }
}
