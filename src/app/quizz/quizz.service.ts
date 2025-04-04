import { Injectable } from '@nestjs/common';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { FindQuizzDto } from './dto/find-quizz';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { instanceToPlain } from 'class-transformer';
import { randomBytes } from 'crypto';

@Injectable()
export class QuizzService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) { }

  /**
   * Créer un quiz
   */
  async create(
    createQuizzDto: CreateQuizzDto,
    userId: string
  ): Promise<string> {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizId = quizzesCollection.doc().id;
    await quizzesCollection.doc(quizId).set({
      id: quizId,
      userId,
      title: createQuizzDto.title,
      description: createQuizzDto.description,
      questions: [],
    });
    return quizId;
  }

  /**
   * Récupérer tous les quiz d'un utilisateur
   */
  async findAll(userId: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const userQuizzes = await quizzesCollection
      .where('userId', '==', userId)
      .get();
    return userQuizzes.docs.map((quiz) => ({ ...quiz.data(), id: quiz.id }));
  }

  /**
   * Récupérer un quiz spécifique par ID
   */
  async findOne(id: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quiz = await quizzesCollection.doc(id).get();
    return quiz.data();
  }

  /**
   * Mettre à jour un quiz
   */
  update(id: string, updateQuizzDto: UpdateQuizzDto) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    return quizzesCollection.doc(id).update({ ...updateQuizzDto });
  }

  /**
   * Mettre à jour le titre d'un quiz (avec vérification de propriété)
   */
  async updateTitle(id: string, userId: string, title: string) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizDoc = await quizzesCollection.doc(id).get();
    if (!quizDoc.exists) return null;
    const quizData = quizDoc.data();
    if (quizData.userId !== userId) return null;

    try {
      await quizzesCollection.doc(id).update({ title });
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du titre du quiz ${id}:`,
        error
      );
      throw new Error('Erreur lors de la mise à jour du titre du quiz.');
    }
  }

  /**
   * Ajouter une question à un quiz (et sérialiser les objets)
   */
  async addQuestionToQuiz(
    quizId: string,
    userId: string,
    questionData: CreateQuestionDto
  ) {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizDoc = await quizzesCollection.doc(quizId).get();
    if (!quizDoc.exists) throw new Error('Quiz not found or unauthorized');
    const quizData = quizDoc.data();
    if (quizData.userId !== userId)
      throw new Error('Quiz not found or unauthorized');

    const questionId = this.fa.firestore.collection('quizzes').doc().id;
    const plainQuestion = instanceToPlain({ id: questionId, ...questionData });
    const updatedQuestions = quizData.questions
      ? [...quizData.questions, plainQuestion]
      : [plainQuestion];

    try {
      await quizzesCollection
        .doc(quizId)
        .update({ questions: updatedQuestions });
      return questionId;
    } catch (error) {
      console.error('Erreur lors de l’ajout de la question :', error);
      throw new Error('Erreur lors de l’ajout de la question');
    }
  }

  /**
   * Mettre à jour une question existante dans un quiz
   */
  async updateQuestion(
    quizId: string,
    userId: string,
    questionId: string,
    questionData: UpdateQuestionDto
  ): Promise<boolean> {
    const quizRef = this.fa.firestore.collection('quizzes').doc(quizId);
    const quizSnap = await quizRef.get();
    if (!quizSnap.exists) return false;
    const quiz = quizSnap.data();
    if (quiz.userId !== userId) return false;

    const updatedQuestions = (quiz.questions || []).map((q: any) =>
      q.id === questionId ? { ...q, ...questionData } : q
    );
    const plainQuestions = updatedQuestions.map((q) => instanceToPlain(q));

    try {
      await quizRef.update({ questions: plainQuestions });
      return true;
    } catch (error) {
      console.error(
        `Erreur MAJ question ${questionId} dans quiz ${quizId}:`,
        error
      );
      throw new Error('Erreur lors de la mise à jour de la question');
    }
  }

  /**
   * Supprimer un quiz par son ID
   */
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

  /**
  * Vérifie si un quiz est prêt à être démarré
  */
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


  /**
   * Démarre une exécution de quiz
   */
  async startExecution(quizId: string, userId: string): Promise<string> {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const executionsCollection = this.fa.firestore.collection('executions');

    const quizDoc = await quizzesCollection.doc(quizId).get();
    if (!quizDoc.exists) throw new Error('QUIZ_NOT_FOUND');
    const quizData = quizDoc.data();
    if (quizData.userId !== userId) throw new Error('QUIZ_NOT_FOUND');

    if (
      !this.canStartQuiz({ ...quizData, id: quizId, title: quizData.title })
    ) {
      throw new Error('QUIZ_NOT_READY');
    }

    const executionId = randomBytes(3).toString('hex');
    await executionsCollection.doc(executionId).set({
      id: executionId,
      quizId,
      userId,
      startedAt: new Date().toISOString(),
      status: 'active',
    });

    return executionId;
  }

  /**
   * Récupère une exécution par son ID
   */
  async getExecutionById(
    executionId: string
  ): Promise<FirebaseFirestore.DocumentSnapshot> {
    return this.fa.firestore.collection('executions').doc(executionId).get();
  }

  /**
   * Récupère un quiz par son ID
   */
  async getQuizById(
    quizId: string
  ): Promise<FirebaseFirestore.DocumentSnapshot> {
    return this.fa.firestore.collection('quizzes').doc(quizId).get();
  }
}
