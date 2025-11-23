import request from 'supertest';

describe('Health Check and Connection Tests', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request('http://localhost:3000')
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Welcome');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request('http://localhost:3000')
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');

      // Verify timestamp is a valid ISO string
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /db', () => {
    it('should successfully connect to PostgreSQL', async () => {
      const response = await request('http://localhost:3000')
        .get('/db')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('PostgreSQL connection successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('current_time');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('GET /redis', () => {
    it('should successfully connect to Redis', async () => {
      const response = await request('http://localhost:3000')
        .get('/redis')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Redis connection successful');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('set');
      expect(response.body.data).toHaveProperty('get');
      expect(response.body.data).toHaveProperty('match', true);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request('http://localhost:3000')
        .get('/nonexistent-endpoint')
        .expect(404);

      // Express default 404 response or custom handler
      expect(response.status).toBe(404);
    });
  });
});
