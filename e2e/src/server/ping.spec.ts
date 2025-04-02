import axios from 'axios';

describe('GET http://localhost:3000/api/ping', () => {
  it('should return pong on get', async () => {
    const response = await axios.get('http://localhost:3000/api/ping');

    expect(response.status).toBe(200);
    expect(response.data.response).toBe('pong');
  });

  it('should return the correct version', async () => {
    const response = await axios.get('http://localhost:3000/api/ping');

    expect(response.status).toBe(200);
    expect(response.data.version).toEqual('1');
  });
});
