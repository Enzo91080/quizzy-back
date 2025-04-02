import axios from 'axios';
import { INestApplication } from '@nestjs/common';

describe('QuizzController (e2e)', () => {
  let authToken: string;
  let userId: string;
  let quizId: string;
  let questionId: string;
  const baseUrl = 'http://localhost:3000/api/quiz';

  beforeAll(async () => {
    try {
      // 1️⃣ Authentification de l'utilisateur
      const authResponse = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4',
        {
          email: 'aniss@exemple.com',
          password: '123456',
          returnSecureToken: true,
        }
      );

      expect(authResponse.status).toBe(200);
      authToken = authResponse.data.idToken;
      userId = authResponse.data.localId;

      // 2️⃣ Récupérer un quiz existant de l'utilisateur
      const quizResponse = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(quizResponse.status).toBe(200);
      const quizzes = quizResponse.data.data;
      if (!quizzes.length) throw new Error("⚠️ Aucun quiz trouvé pour cet utilisateur.");

      quizId = quizzes[0].id; // Prendre le premier quiz trouvé

      // 3️⃣ Récupérer une question existante du quiz
      const questionResponse = await axios.get(`${baseUrl}/${quizId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(questionResponse.status).toBe(200);
      const questions = questionResponse.data.questions;
      if (!questions.length) throw new Error("⚠️ Aucune question trouvée dans ce quiz.");

      questionId = questions[0].id; // Prendre la première question

    } catch (error) {
      console.error('⚠️ Erreur d\'initialisation des tests:', JSON.stringify(error.response?.data || error.message));
      throw new Error("⚠️ Impossible d'initialiser les tests.");
    }
  });

  // 🔹 Test de mise à jour d'une question
  it('PUT /quiz/:id/questions/:questionId - should update a question', async () => {
    if (!authToken) throw new Error("⚠️ AuthToken est indéfini, arrêt du test.");
    if (!quizId || !questionId) throw new Error("⚠️ quizId ou questionId non défini, arrêt du test.");

    try {
      const updateResponse = await axios.put(
        `${baseUrl}/${quizId}/questions/${questionId}`,
        {
          id: questionId,
          title: 'What is NestJS Framework?',
          answers: [{ title: 'An awesome framework', isCorrect: true }],
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(updateResponse.status).toBe(204);

    } catch (error) {
      console.error(
        '⚠️ Erreur lors de la mise à jour de la question:',
        JSON.stringify(error.response?.data || error.message)
      );
      throw error;
    }
  });
});
