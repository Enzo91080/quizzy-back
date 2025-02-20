import { Injectable } from '@nestjs/common';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import * as admin from 'firebase-admin';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { Question } from './entities/question.entity';

@Injectable()
export class QuizzService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) { }

  async create(createQuizzDto: CreateQuizzDto, userId: string): Promise<string> {
    const quizzesCollection = this.fa.firestore.collection('quizzes');

    // Ajouter un quiz en Firestore
    const quizRef = await quizzesCollection.add({
      ...createQuizzDto,
      userId,
      questions: createQuizzDto.questions.map((question) => ({
        id: this.fa.firestore.collection('quizzes').doc().id, // Générer un ID unique pour chaque question
        ...question,
      })),
    });

    return quizRef.id; // Retourne uniquement l'ID généré
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

  update(id: string, updateQuizzDto: UpdateQuizzDto) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection.doc(id).update({ ...updateQuizzDto });
  }

  async updateTitle(id: string, userId: string, title: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizDoc = await quizzesCollection.doc(id).get();

    // Vérifier si le quiz existe
    if (!quizDoc.exists) {
      return null; // Permet au contrôleur de renvoyer un 404
    }

    const quizData = quizDoc.data();

    // Vérifier si l'utilisateur est bien le propriétaire du quiz
    if (quizData.userId !== userId) {
      return null; // Permet au contrôleur de renvoyer un 404
    }

    try {
      await quizzesCollection.doc(id).update({ title });
      return true; // Indique que la mise à jour a été effectuée
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du titre du quiz ${id}:`, error);
      throw new Error('Erreur lors de la mise à jour du titre du quiz.');
    }
  }

  async addQuestionToQuiz(
    quizId: string,
    userId: string,
    questionData: Question, // Exclure l'ID car il sera généré
  ) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizDoc = await quizzesCollection.doc(quizId).get();

    // Vérifier si le quiz existe
    if (!quizDoc.exists) {
      throw new Error('Quiz not found or unauthorized');
    }

    const quizData = quizDoc.data();

    // Vérifier si l'utilisateur est bien le propriétaire du quiz
    if (quizData.userId !== userId) {
      throw new Error('Quiz not found or unauthorized');
    }

    // Générer un ID unique pour la nouvelle question
    const questionId = this.fa.firestore.collection('quizzes').doc().id;

    // Ajouter la nouvelle question avec l'ID généré
    const newQuestion: Question = { id: questionId, ...questionData };
    const updatedQuestions = quizData.questions ? [...quizData.questions, newQuestion] : [newQuestion];

    try {
      await quizzesCollection.doc(quizId).update({ questions: updatedQuestions });
      return questionId; // Retourner l'ID de la question ajoutée
    } catch (error) {
      console.error('Erreur lors de l’ajout de la question :', error);
      throw new Error('Erreur lors de l’ajout de la question');
    }
  }

  async updateQuestion(quizId: string, userId: string, questionId: string, questionData: Question) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizDoc = await quizzesCollection.doc(quizId).get();

    // Vérifier si le quiz existe
    if (!quizDoc.exists) {
      return false; // Permet au contrôleur de renvoyer un 404
    }

    const quizData = quizDoc.data();

    // Vérifier si l'utilisateur est bien le propriétaire du quiz
    if (quizData.userId !== userId) {
      return false; // Permet au contrôleur de renvoyer un 404
    }

    // Mettre à jour la question dans la liste des questions
    const updatedQuestions = quizData.questions.map((question: Question) => {
      if (question.id === questionId) {
        return { ...question, ...questionData };
      }
      return question;
    });

    try {
      await quizzesCollection.doc(quizId).update({ questions: updatedQuestions });
      return true; // Indique que la mise à jour a été effectuée
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la question ${questionId} du quiz ${quizId}:`, error);
      throw new Error('Erreur lors de la mise à jour de la question');
    }
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
