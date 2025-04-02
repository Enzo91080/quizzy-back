import axios from 'axios';
import { INestApplication } from '@nestjs/common';


describe('QuizzController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let userId: string;
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
  
        expect(authResponse.status).toBe(200); // Vérifie que l'authentification réussit
        authToken = authResponse.data.idToken;
        userId = authResponse.data.localId; // UID Firebase
        console.log("✅ Authentification réussie, UID reçu :", userId);
      } catch (error) {
        console.error('⚠️ Erreur d\'authentification:', JSON.stringify(error.response?.data || error.message));
        throw new Error("⚠️ Impossible de s'authentifier.");
      }
    });

it('should return all quizzes with HATEOAS link', async () => {
    if (!authToken) {
      throw new Error("⚠️ AuthToken est indéfini, arrêt du test.");
    }
  
    try {
        const response = await axios.get(baseUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 10000 // 10 secondes
          });
          
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
  
      // Vérifier que chaque quiz dans "data" a un lien "create"
      response.data.data.forEach((quiz: any) => {
        expect(quiz).toHaveProperty('_links.create');
        expect(quiz._links.create).toBe(baseUrl);
      });
      
    } catch (error) {
      console.error('⚠️ Erreur dans GET /api/quizz:', JSON.stringify(error.response?.data || error.message));
      throw new Error(error.response?.data?.message || error.message);
    }
  }); // Timeout de 10 sec pour éviter des erreurs Jest.

   // Test de récupération des quizzes (GET /quizz)

   it('GET /quizz - should return all quizzes for the user', async () => {
    if (!authToken) {
      throw new Error("⚠️ AuthToken est indéfini, arrêt du test.");
    }

    try {
      // Vérification de la récupération des quizzes
      const response = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000 // 10 secondes
      });

      // Vérifie que la réponse a un code 200 OK
      expect(response.status).toBe(200);

      // Vérifie la structure de la réponse
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    
    } catch (error) {
      console.error('⚠️ Erreur lors de la requête:', error.response?.data || error.message);
      throw error; // Lancer l'erreur pour faire échouer le test si nécessaire
    }
  }); // Timeout de 5000ms pour ce test
});