import axios from 'axios';

describe('POST /api/users', () => {
  it('should return 200 if user is authenticated', async () => {
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
  });

  it('should return 400 if user is not authenticated', async () => {
    try {
      await axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV_PMyz1vM88Veq-q74rjINtgGSgNPDO4', {});
    } catch (e) {
      expect(e.status).toBe(400);
    }
  });
});
