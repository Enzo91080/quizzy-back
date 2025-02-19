import { Injectable } from '@nestjs/common';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import * as admin from 'firebase-admin';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class QuizzService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) {}

  create(createQuizzDto: CreateQuizzDto, userId: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection.add({ ...createQuizzDto, userId });
  }

  async findAll(userId: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const userQuizzes = await quizzesCollection.where('userId', '==', userId).get();
    return userQuizzes.docs.map((quiz) => quiz.data());
  }

  async findOne(id: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quiz = await quizzesCollection.doc(id).get(); 
    return quiz.data();
  }

  update(id:string, updateQuizzDto:UpdateQuizzDto){
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection.doc(id).update({...updateQuizzDto});
  }

  remove(id: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection
      .doc(id)
      .delete()
      .then(() => {
        console.log(`Quiz avec ID ${id} supprimé`);
        return { message: `Quiz supprimé avec succès.` };
      })
      .catch((error) => {
        console.error(`Erreur lors de la suppression du quiz ${id}:`, error);
        throw new Error(`Erreur lors de la suppression du quiz.`);
      });
  }
}
