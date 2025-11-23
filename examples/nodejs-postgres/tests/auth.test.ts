import request from 'supertest';
import express, { Express } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Import app setup (you'll need to export app from src/index.ts for testing)
// For now, we'll set up a minimal test version
// IMPORTANT: Must match the SECRET_KEY in src/index.ts
const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_key_change_in_production';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/myapp';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

describe('Authentication Tests', () => {
  let testUserId: number;
  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';

  // Clean up test data after all tests
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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: testUsername,
          email: testEmail,
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'bearer');
      expect(response.body.user).toMatchObject({
        username: testUsername,
        email: testEmail,
        is_active: true,
      });

      testUserId = response.body.user.id;

      // Verify token is valid JWT
      const decoded = jwt.verify(response.body.access_token, SECRET_KEY) as { sub: string };
      expect(decoded.sub).toBe(testUsername);
    });

    it('should fail with duplicate username', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: testUsername,
          email: `another_${Date.now()}@example.com`,
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should fail with duplicate email', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: `another_${Date.now()}`,
          email: testEmail,
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should fail with password less than 8 characters', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: `newuser_${Date.now()}`,
          email: `newuser_${Date.now()}@example.com`,
          password: 'short',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least 8 characters');
    });

    it('should fail with missing fields', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: `incomplete_${Date.now()}`,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should hash password with bcrypt', async () => {
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE username = $1',
        [testUsername]
      );

      expect(result.rows[0].password_hash).toMatch(/^\$2[ayb]\$.{56}$/);

      // Verify password can be validated
      const isValid = await bcrypt.compare(testPassword, result.rows[0].password_hash);
      expect(isValid).toBe(true);
    });
  });

  describe('POST /auth/token', () => {
    it('should login with correct credentials', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: testUsername,
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'bearer');
      expect(response.body.user).toMatchObject({
        username: testUsername,
        email: testEmail,
      });

      // Verify token is valid
      const decoded = jwt.verify(response.body.access_token, SECRET_KEY) as { sub: string };
      expect(decoded.sub).toBe(testUsername);
    });

    it('should fail with incorrect password', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: testUsername,
          password: 'wrongpassword',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Incorrect username or password');
    });

    it('should fail with non-existent username', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: 'nonexistent_user',
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Incorrect username or password');
    });

    it('should fail with inactive user', async () => {
      // Create inactive user
      const inactiveUsername = `inactive_${Date.now()}`;
      const inactiveEmail = `inactive_${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash(testPassword, 10);

      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, is_active, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
        [inactiveUsername, inactiveEmail, passwordHash, false]
      );

      const inactiveUserId = result.rows[0].id;

      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: inactiveUsername,
          password: testPassword,
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inactive');

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [inactiveUserId]);
    });

    it('should fail with missing fields', async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: testUsername,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /auth/me', () => {
    let validToken: string;

    beforeAll(async () => {
      const response = await request('http://localhost:3000')
        .post('/auth/token')
        .send({
          username: testUsername,
          password: testPassword,
        });

      validToken = response.body.access_token;
    });

    it('should return current user info with valid token', async () => {
      const response = await request('http://localhost:3000')
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        username: testUsername,
        email: testEmail,
        is_active: true,
      });
      expect(response.body).toHaveProperty('id');
    });

    it('should fail without token', async () => {
      const response = await request('http://localhost:3000')
        .get('/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Access token required');
    });

    it('should fail with invalid token', async () => {
      const response = await request('http://localhost:3000')
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid or expired token');
    });

    it('should fail with expired token', async () => {
      // Create expired token (expired 1 hour ago)
      const expiredToken = jwt.sign(
        { sub: testUsername },
        SECRET_KEY,
        { expiresIn: '-1h' }
      );

      const response = await request('http://localhost:3000')
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid or expired token');
    });
  });
});
