import { Injectable } from '@nestjs/common';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { UpdateQuizzDto } from './dto/update-quizz.dto';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { Question } from './entities/question.entity';
import { FindQuizzDto } from './dto/find-quizz';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { StartableQuizDto } from './dto/startable-quizz.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { randomBytes } from 'crypto';

@Injectable()
export class QuizzService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) { }

  // Créer un quiz
  async create(createQuizzDto: CreateQuizzDto, userId: string): Promise<string> {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const quizId = quizzesCollection.doc().id; // Générer un ID unique pour le quiz

    // Créer le quiz avec l'ID généré et l'ID de l'utilisateur
    await quizzesCollection.doc(quizId).set({
      id: quizId,
      userId,
      title: createQuizzDto.title,
      description: createQuizzDto.description,
      questions: [], // Initialiser avec un tableau vide de questions
    });

    return quizId; // Retourner l'ID du quiz créé
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

    if (!quizDoc.exists) {
      throw new Error('Quiz not found or unauthorized');
    }

    const quizData = quizDoc.data();

    if (quizData.userId !== userId) {
      throw new Error('Quiz not found or unauthorized');
    }

    const questionId = this.fa.firestore.collection('quizzes').doc().id;

    // 🔥 Nettoyage des objets DTO avec prototype
    const plainQuestion = instanceToPlain({ id: questionId, ...questionData });
    const updatedQuestions = quizData.questions ? [...quizData.questions, plainQuestion] : [plainQuestion];

    try {
      await quizzesCollection.doc(quizId).update({ questions: updatedQuestions });
      return questionId;
    } catch (error) {
      console.error('Erreur lors de l’ajout de la question :', error);
      throw new Error('Erreur lors de l’ajout de la question');
    }
  }


  async updateQuestion(
    quizId: string,
    userId: string,
    questionId: string,
    questionData: UpdateQuestionDto,
  ): Promise<boolean> {
    const quizRef = this.fa.firestore.collection('quizzes').doc(quizId);
    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) return false;

    const quiz = quizSnap.data();
    if (quiz.userId !== userId) return false;

    const updatedQuestions = (quiz.questions || []).map((q: any) =>
      q.id === questionId ? { ...q, ...questionData } : q
    );

    const plainQuestions = updatedQuestions.map(q => instanceToPlain(q));

    try {
      await quizRef.update({ questions: plainQuestions });
      return true;
    } catch (error) {
      console.error(`Erreur MAJ question ${questionId} dans quiz ${quizId}:`, error);
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

  async canStartQuiz(quiz: FindQuizzDto): Promise<boolean> {
    const dto = plainToInstance(StartableQuizDto, quiz);
    const errors = await validate(dto, { whitelist: true });
    return errors.length === 0;
  }

  async startExecution(quizId: string, userId: string): Promise<string> {
    const quizzesCollection = this.fa.firestore.collection('quizzes');
    const executionsCollection = this.fa.firestore.collection('executions');

    // 1. Récupérer le quiz
    const quizDoc = await quizzesCollection.doc(quizId).get();

    if (!quizDoc.exists) {
      throw new Error('QUIZ_NOT_FOUND');
    }

    const quizData = quizDoc.data();

    // 2. Vérifier le propriétaire
    if (quizData.userId !== userId) {
      throw new Error('QUIZ_NOT_FOUND'); // volontaire pour éviter de leak les IDs
    }

    // 3. Vérifier que le quiz est prêt
    if (!this.canStartQuiz({
      ...quizData, id: quizId,
      title: quizData.title,
    })) {
      throw new Error('QUIZ_NOT_READY');
    }

    // 4. Générer un ID court (6 caractères hex)
    const executionId = randomBytes(3).toString('hex');

    // 5. Enregistrer l'exécution
    await executionsCollection.doc(executionId).set({
      id: executionId,
      quizId,
      userId,
      startedAt: new Date().toISOString(),
      status: 'active', // ou "in_progress" selon tes préférences
    });

    return executionId;
  }

  async getExecutionById(executionId: string): Promise<FirebaseFirestore.DocumentSnapshot> {
    return this.fa.firestore.collection('executions').doc(executionId).get();
  }

  async getQuizById(quizId: string): Promise<FirebaseFirestore.DocumentSnapshot> {
    return this.fa.firestore.collection('quizzes').doc(quizId).get();
  }


}
