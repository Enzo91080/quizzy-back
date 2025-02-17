import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  async createUser(uid: string, username: string, email: string, password: string): Promise<void> {
    // Store the username associated with the uid in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(uid).set({ username, email, password });
    console.log(`User with UID: ${uid}, Username: ${username}, Email: ${email} stored successfully.`);
  }
} 