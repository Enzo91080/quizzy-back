import { Injectable } from '@nestjs/common';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { Question } from './entities/question.entity';
import { FindQuizzDto } from './dto/find-quizz';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuizzService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) { }

  // Créer un quiz
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

  // Trouver tous les quiz d'un utilisateur
  async findAll(userId: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const userQuizzes = await quizzesCollection.where('userId', '==', userId).get();
    return userQuizzes.docs.map((quiz) => ({ ...quiz.data(), id: quiz.id }));
  }

  // Trouver un quiz par ID
  async findOne(id: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quiz = await quizzesCollection.doc(id).get();
    return quiz.data();
  }

  // Mettre à jour un quiz
  update(id: string, updateQuizzDto: UpdateQuizzDto) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection.doc(id).update({ ...updateQuizzDto });
  }

  // Mettre à jour le titre d'un quiz
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

  // Ajouter une question à un quiz
  async addQuestionToQuiz(
    quizId: string,
    userId: string,
    questionData: CreateQuestionDto, // Exclure l'ID car il sera généré
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
    const newQuestion: CreateQuestionDto = { id: questionId, ...questionData };
    const updatedQuestions = quizData.questions ? [...quizData.questions, newQuestion] : [newQuestion];

    try {
      await quizzesCollection.doc(quizId).update({ questions: updatedQuestions });
      return questionId; // Retourner l'ID de la question ajoutée
    } catch (error) {
      console.error('Erreur lors de l’ajout de la question :', error);
      throw new Error('Erreur lors de l’ajout de la question');
    }
  }

  async updateQuestion(quizId: string, userId: string, questionId: string, questionData: UpdateQuestionDto) {
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
    const updatedQuestions = quizData.questions.map((question: UpdateQuestionDto) => {
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

  // Supprimer un quiz
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

  canStartQuiz(quiz: FindQuizzDto): boolean {
    if (!quiz.title || quiz.title.trim() === '') {
      return false; // Le titre est vide
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return false; // Pas de questions
    }

    for (const question of quiz.questions) {
      if (!question.title || question.title.trim() === '') {
        return false; // Question sans titre
      }

      if (!question.answers || question.answers.length < 2) {
        return false; // Moins de deux réponses
      }

      const correctAnswers = question.answers.filter(answer => answer.isCorrect);
      if (correctAnswers.length !== 1) {
        return false; // Pas exactement une réponse correcte
      }
    }

    return true;
  }


}
