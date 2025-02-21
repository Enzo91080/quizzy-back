import { Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { FirebaseAdmin,InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class UsersRepository {
    readonly db: admin.firestore.Firestore;

  constructor(@InjectFirebaseAdmin() fa: FirebaseAdmin) {
    this.db = fa.firestore;  }
  
    async createUser(uid: string, username: string): Promise<void> {   
        await this.db.collection('users').doc(uid).set({ username });
        console.log(`User with UID: ${uid}, Username: ${username} stored successfully.`);
    }
    
    async getUser(uid: string): Promise<any> {
        const user = await this.db.collection('users').doc(uid).get();
        return user.data();
    }
}