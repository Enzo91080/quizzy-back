import axios from 'axios';

describe('GET http://localhost:3000/api/ping', () => {
  const BASE_URL = 'http://localhost:3000/api/ping';

  it('should return a valid status and database status', async () => {
    const response = await axios.get(BASE_URL);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status');
    expect(response.data).toHaveProperty('details.database');

    // Vérifier si le statut est "OK" ou "Partial"
    expect(['OK', 'Partial']).toContain(response.data.status);
    expect(['OK', 'KO']).toContain(response.data.details.database);
  });
  
});
