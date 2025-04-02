import axios from 'axios';

describe('QuizzController (e2e)', () => {
  let authToken: string;
  let userId: string;
  let quizId: string;
  let questionId: string;
  const baseUrl = 'http://localhost:3000/api/quiz';

  beforeAll(async () => {
    try {
      const authResponse = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4',
        {
          email: 'aniss@exemple.com',
          password: '123456',
          returnSecureToken: true,
        }
      );
      console.log("Authentification réussie - Status:", authResponse.status, "ID Token:", authResponse.data.idToken);

      expect(authResponse.status).toBe(200);
      authToken = authResponse.data.idToken;
      userId = authResponse.data.localId;

      // Vérification de l'authentification
      if (!authToken) throw new Error('Le token d\'authentification est manquant.');

      const quizResponse = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("Quizzes récupérés - Status:", quizResponse.status, "Data:", JSON.stringify(quizResponse.data));

      expect(quizResponse.status).toBe(200);

      const quizzes = quizResponse.data.data;
      if (!quizzes || quizzes.length === 0) {
        console.error("Aucun quiz trouvé !");
        throw new Error("Aucun quiz trouvé pour cet utilisateur.");
      }

      const quizWithQuestions = quizzes.find(q => q.questions && q.questions.length > 0);
      if (!quizWithQuestions) throw new Error("Aucun quiz avec des questions trouvé.");

      quizId = quizWithQuestions.id;

      console.log("quizId récupéré:", quizId);

      const questionResponse = await axios.get(`${baseUrl}/${quizId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("Questions récupérées - Status:", questionResponse.status, "Data:", JSON.stringify(questionResponse.data));

      expect(questionResponse.status).toBe(200);

      const questions = questionResponse.data.questions;
      if (!questions || questions.length === 0) {
        console.error("Aucune question trouvée !");
        throw new Error("Aucune question trouvée dans ce quiz.");
      }

      questionId = questions[0].id;

      console.log("questionId récupéré:", questionId);

      // Vérification finale des variables
      if (!quizId || !questionId) {
        console.error("quizId ou questionId non définis.");
        throw new Error("quizId ou questionId non définis.");
      }

    } catch (error) {
      console.error('Erreur d\'initialisation des tests:', error.message || JSON.stringify(error));
      throw new Error("Impossible d'initialiser les tests.");
    }
  });

  it('should return all quizzes with HATEOAS link', async () => {
    if (!authToken) {
      throw new Error("AuthToken est indéfini, arrêt du test.");
    }
    try {
      const response = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);

      // Vérifier que chaque quiz dans "data" a un lien "create"
      expect(response.data).toHaveProperty('_links.create');

    } catch (error) {
      console.error('Erreur dans GET /api/quizz:', JSON.stringify(error.response?.data || error.message));
      throw new Error(error.response?.data?.message || error.message);
    }
  });

  it('POST /quiz - should create a quiz and return an ID', async () => {
    if (!authToken) throw new Error("Le token d'authentification est manquant.");
    try {
      const createQuizzDto = {
        title: 'Mariam',
        description: 'Mariam Quizz',
      };
      // Envoi de la requête pour créer un quiz
      const createResponse = await axios.post(
        baseUrl,
        createQuizzDto,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      expect(createResponse.status).toBe(201);
      console.log("Réponse de la création du quiz :", createResponse.data);

      quizId = createResponse.data.id; // Stocker l'ID du quiz créé

    } catch (error) {
      console.error('Erreur lors de la création du quiz:', JSON.stringify(error.response?.data || error.message));
      throw error;
    }
  });

  // Test de mise à jour d'une question
  it('PUT /quiz/:id/questions/:questionId - should update a question', async () => {
    if (!authToken) throw new Error("AuthToken est indéfini, arrêt du test.");
    if (!quizId || !questionId) throw new Error("quizId ou questionId non défini, arrêt du test.");
    try {
      const updateResponse = await axios.put(
        `${baseUrl}/${quizId}/questions/${questionId}`,
        {
          id: questionId,
          title: 'Update Question',
          answers: [{ title: 'Update Answers', isCorrect: true }, { title: 'Update answers n°2', isCorrect: true }],
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(updateResponse.status).toBe(204);

    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la question:',
        JSON.stringify(error.response?.data || error.message)
      );
      throw error;
    }
  });

});
