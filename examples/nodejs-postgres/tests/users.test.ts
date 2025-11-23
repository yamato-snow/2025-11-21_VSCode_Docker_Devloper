import request from 'supertest';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/myapp';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

describe('Users API Tests', () => {
  let authToken: string;
  let testUserId: number;
  const testUsername = `apiuser_${Date.now()}`;
  const testEmail = `apiuser_${Date.now()}@example.com`;
  const testPassword = 'password123';

  // Setup: Create test user and get auth token
  beforeAll(async () => {
    // Register user
    const registerResponse = await request('http://localhost:3000')
      .post('/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });

    authToken = registerResponse.body.access_token;
    testUserId = registerResponse.body.user.id;
  });

  // Cleanup
  afterAll(async () => {
    try {
      if (testUserId) {
        await pool.query('DELETE FROM items WHERE owner_id = $1', [testUserId]);
        await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await pool.end();
  });

  describe('GET /api/users', () => {
    it('should return users list with authentication', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(Array.isArray(response.body.users)).toBe(true);

      // Check that password_hash is not in response
      if (response.body.users.length > 0) {
        expect(response.body.users[0]).not.toHaveProperty('password_hash');
        expect(response.body.users[0]).toHaveProperty('username');
        expect(response.body.users[0]).toHaveProperty('email');
        expect(response.body.users[0]).toHaveProperty('is_active');
        expect(response.body.users[0]).toHaveProperty('created_at');
      }
    });

    it('should fail without authentication', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Access token required');
    });

    it('should support pagination', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/users?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
      expect(response.body.users.length).toBeLessThanOrEqual(5);
    });

    it('should handle page parameter correctly', async () => {
      const page1 = await request('http://localhost:3000')
        .get('/api/users?page=1&per_page=2')
        .set('Authorization', `Bearer ${authToken}`);

      const page2 = await request('http://localhost:3000')
        .get('/api/users?page=2&per_page=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(page1.body.page).toBe(1);
      expect(page2.body.page).toBe(2);

      // If there are enough users, pages should have different content
      if (page1.body.total > 2) {
        expect(page1.body.users[0].id).not.toBe(page2.body.users[0].id);
      }
    });

    it('should have correct total count', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      // Verify total matches database count
      const countResult = await pool.query('SELECT COUNT(*) FROM users');
      const actualTotal = parseInt(countResult.rows[0].count);

      expect(response.body.total).toBe(actualTotal);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return specific user by ID', async () => {
      const response = await request('http://localhost:3000')
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testUserId,
        username: testUsername,
        email: testEmail,
        is_active: true,
      });
      expect(response.body).not.toHaveProperty('password_hash');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should fail without authentication', async () => {
      const response = await request('http://localhost:3000')
        .get(`/api/users/${testUserId}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 999999;
      const response = await request('http://localhost:3000')
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid user ID gracefully', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/users/invalid_id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});
