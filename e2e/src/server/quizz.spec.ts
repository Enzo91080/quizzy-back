import axios from 'axios';

describe('QuizzController (e2e)', () => {
  let authToken: string;
  let userId: string;
  let quizId: string;
  let questionId: string;

  const baseUrl = 'http://localhost:3000/api/quiz';
  const firebaseAuthUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4';

  const credentials = {
    email: 'aniss@exemple.com',
    password: '123456',
    returnSecureToken: true,
  };

  const headers = () => ({
    Authorization: `Bearer ${authToken}`,
  });

  beforeAll(async () => {
    // Authentification Firebase
    const { data: authData } = await axios.post(firebaseAuthUrl, credentials);
    authToken = authData.idToken;
    userId = authData.localId;

    if (!authToken || !userId) {
      throw new Error("Authentication failed");
    }

    // Création du quiz
    const quizRes = await axios.post(
      baseUrl,
      {
        title: 'Quiz E2E partagé',
        description: 'Quiz créé dans beforeAll pour tous les tests',
      },
      { headers: headers() }
    );
    expect(quizRes.status).toBe(201);

    // Récupération du quizId depuis l’en-tête Location
    const location = quizRes.headers.location;
    quizId = location.split('/').pop();
    if (!quizId) throw new Error('QuizId introuvable via Location header');

    //  Ajout d'une question
    const questionRes = await axios.post(
      `${baseUrl}/${quizId}/questions`,
      {
        title: 'Question partagée',
        answers: [
          { title: 'Bonne réponse', isCorrect: true },
          { title: 'Fausse réponse 1', isCorrect: false },
          { title: 'Fausse réponse 2', isCorrect: false },
        ],
      },
      { headers: headers() }
    );
    expect(questionRes.status).toBe(201);
    questionId = questionRes.data.id;
  });


  // test la recuperation d'un quiz par id (issue 7_10)
  it('GET /quiz/:id - should return details of a specific quiz including its questions (issue 7_10)', async () => {
    // 1. Crée un quiz
    const quizRes = await axios.post(
      baseUrl,
      {
        title: 'Quiz détaillé',
        description: 'Avec questions',
      },
      { headers: headers() }
    );

    const quizId = quizRes.headers.location.split('/').pop();

    // 2. Ajoute une ou plusieurs questions au quiz
    await axios.post(
      `${baseUrl}/${quizId}/questions`,
      {
        title: 'Quelle est la capitale de la France ?',
        answers: [
          { title: 'Paris', isCorrect: true },
          { title: 'Lyon', isCorrect: false },
        ],
      },
      { headers: headers() }
    );

    // 3. Récupère le quiz par son ID
    const getRes = await axios.get(`${baseUrl}/${quizId}`, {
      headers: headers(),
    });

    expect(getRes.status).toBe(200);
    const quiz = getRes.data;

    expect(quiz).toHaveProperty('id', quizId);
    expect(quiz).toHaveProperty('title', 'Quiz détaillé');
    expect(quiz).toHaveProperty('description', 'Avec questions');
    expect(quiz).toHaveProperty('questions');
    expect(Array.isArray(quiz.questions)).toBe(true);
    expect(quiz.questions.length).toBeGreaterThan(0);

    const question = quiz.questions[0];
    expect(question).toHaveProperty('title', 'Quelle est la capitale de la France ?');
    expect(Array.isArray(question.answers)).toBe(true);
    expect(question.answers.length).toBe(2);
  });


  // test la récupération de tous les quiz avec le lien HATEOAS (issue 5_12)
  it('GET /api/quiz - should return all quizzes with HATEOAS link (issue 5_12)', async () => {
    const res = await axios.get(baseUrl, { headers: headers() });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('data');
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data).toHaveProperty('_links.create');
  });

  //test que le quiz est bien startable (issue 13)
  it('GET /api/quiz - should return startable quiz links (issue 13)', async () => {
    const res = await axios.get(baseUrl, { headers: headers() });
    expect(res.status).toBe(200);

    const quiz = res.data.data.find((q: any) => q.id === quizId);
    expect(quiz).toBeDefined();
    expect(quiz._links?.start).toBeDefined();
  });

  //test la creation d'un quiz (issue 6)
  it('POST /quiz - should create a new quiz and return a Location header (issue 6)', async () => {
    const res = await axios.post(
      baseUrl,
      { title: 'Mariam', description: 'Mariam Quizz' },
      { headers: headers() }
    );

    expect(res.status).toBe(201);
    expect(res.headers).toHaveProperty('location');
  });

  // test la recuperation de l'id d'une question et modification d'une question (issue 11)
  it('PUT /quiz/:id/questions/:questionId - should update a question (issue 11)', async () => {
    const res = await axios.put(
      `${baseUrl}/${quizId}/questions/${questionId}`,
      {
        id: questionId,
        title: 'Question mise à jour via PUT',
        answers: [
          { title: 'Nouvelle bonne réponse', isCorrect: true },
          { title: 'Nouvelle fausse 1', isCorrect: false },
          { title: 'Nouvelle fausse 2', isCorrect: false },
        ],
      },
      { headers: headers() }
    );

    expect(res.status).toBe(204);
  });


  // test l'execution d'un quiz (issue 14)
  it('POST /quiz/:id/start - should start a quiz execution and return location', async () => {
    const quizResponse = await axios.post(
      baseUrl,
      { title: 'Quiz à démarrer', description: 'Startable quiz' },
      { headers: headers() }
    );
    const quizId = quizResponse.headers.location.split('/').pop();

    // Ajoute une question pour que le quiz soit "startable"
    await axios.post(
      `${baseUrl}/${quizId}/questions`,
      {
        title: 'Une question pour le start',
        answers: [
          { title: 'Bonne', isCorrect: true },
          { title: 'Fausse', isCorrect: false },
        ],
      },
      { headers: headers() }
    );

    const startRes = await axios.post(`${baseUrl}/${quizId}/start`, null, {
      headers: headers(),
    });

    expect(startRes.status).toBe(201);
    expect(startRes.headers).toHaveProperty('location');
    expect(startRes.headers.location).toMatch(/\/execution\//);
  });


});
