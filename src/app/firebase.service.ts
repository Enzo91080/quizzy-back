import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

@Injectable()
export class FirebaseService {
    private firebaseConfig = {
        apiKey: 'AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4',
        authDomain: 'pokedex-7ec85.firebaseapp.com',
        projectId: 'pokedex-7ec85',
        storageBucket: 'pokedex-7ec85.firebasestorage.app',
        messagingSenderId: '481175323432',
        appId: '1:481175323432:web:fb768b45f9dcae9cff061d',
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
