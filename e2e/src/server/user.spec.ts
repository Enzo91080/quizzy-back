import axios from 'axios';

describe('POST /api/users', () => {
  it('should return 201 if user is authenticated', async () => {
    const auth = await axios.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4',
      {
        email: 'aniss@exemple.com',
        password: '123456',
        returnSecureToken: true,
      }
    );

    expect(auth.status).toBe(200);
    const token = auth.data.idToken;
    console.log(token);

    const userResponse = await axios.post(
      '/api/users',
      {
        email: 'aniss@exemple.com',
        password: '123456',
        returnSecureToken: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(userResponse.status).toBe(201);
  });

  it('should return 401 if user is not authenticated', async () => {
    try {
      await axios.post('/api/users', {});
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });
});
