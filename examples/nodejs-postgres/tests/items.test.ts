import request from 'supertest';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/myapp';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

describe('Items API Tests', () => {
  let authToken: string;
  let testUserId: number;
  let createdItemId: number;
  const testUsername = `itemuser_${Date.now()}`;
  const testEmail = `itemuser_${Date.now()}@example.com`;
  const testPassword = 'password123';

  // Setup: Create test user and get auth token
  beforeAll(async () => {
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

  describe('POST /api/items', () => {
    it('should create new item with authentication', async () => {
      const newItem = {
        title: 'Test Item',
        description: 'This is a test item description',
        price: 99.99,
        owner_id: testUserId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('created successfully');
      expect(response.body).toHaveProperty('item');
      expect(response.body.item).toMatchObject({
        title: newItem.title,
        description: newItem.description,
        price: newItem.price,
        owner_id: testUserId,
      });
      expect(response.body.item).toHaveProperty('id');
      expect(response.body.item).toHaveProperty('created_at');

      createdItemId = response.body.item.id;
    });

    it('should fail without authentication', async () => {
      const newItem = {
        title: 'Unauthorized Item',
        description: 'This should fail',
        price: 50.00,
        owner_id: testUserId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Access token required');
    });

    it('should fail with missing required fields', async () => {
      const incompleteItem = {
        description: 'Missing title and price',
        owner_id: testUserId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteItem)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should fail with non-existent owner_id', async () => {
      const nonExistentOwnerId = 999999;
      const newItem = {
        title: 'Orphan Item',
        description: 'Item with invalid owner',
        price: 10.00,
        owner_id: nonExistentOwnerId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });

    it('should create item with null description', async () => {
      const newItem = {
        title: 'Item without description',
        price: 25.50,
        owner_id: testUserId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.item.title).toBe(newItem.title);
      expect(response.body.item.description).toBeNull();
    });

    it('should store price as numeric correctly', async () => {
      const newItem = {
        title: 'Precision Price Item',
        description: 'Testing price precision',
        price: 123.45,
        owner_id: testUserId,
      };

      const response = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newItem)
        .expect(201);

      expect(response.body.item.price).toBe(123.45);
    });
  });

  describe('GET /api/items', () => {
    it('should return items list with authentication', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(Array.isArray(response.body.items)).toBe(true);

      // Verify item structure
      if (response.body.items.length > 0) {
        expect(response.body.items[0]).toHaveProperty('id');
        expect(response.body.items[0]).toHaveProperty('title');
        expect(response.body.items[0]).toHaveProperty('price');
        expect(response.body.items[0]).toHaveProperty('owner_id');
        expect(response.body.items[0]).toHaveProperty('created_at');
      }
    });

    it('should fail without authentication', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/items')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should support pagination', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/items?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should have correct total count', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`);

      // Verify total matches database count
      const countResult = await pool.query('SELECT COUNT(*) FROM items');
      const actualTotal = parseInt(countResult.rows[0].count);

      expect(response.body.total).toBe(actualTotal);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return specific item by ID', async () => {
      const response = await request('http://localhost:3000')
        .get(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdItemId,
        title: 'Test Item',
        description: 'This is a test item description',
        price: 99.99,
        owner_id: testUserId,
      });
      expect(response.body).toHaveProperty('created_at');
    });

    it('should fail without authentication', async () => {
      const response = await request('http://localhost:3000')
        .get(`/api/items/${createdItemId}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent item', async () => {
      const nonExistentId = 999999;
      const response = await request('http://localhost:3000')
        .get(`/api/items/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Database Constraints', () => {
    it('should verify foreign key constraint exists', async () => {
      // Query database to check foreign key
      const result = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name='items'
          AND kcu.column_name='owner_id';
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].foreign_table_name).toBe('users');
      expect(result.rows[0].foreign_column_name).toBe('id');
    });

    it('should cascade delete items when user is deleted', async () => {
      // Create temporary user and item
      const tempUsername = `tempuser_${Date.now()}`;
      const tempEmail = `tempuser_${Date.now()}@example.com`;

      const userResponse = await request('http://localhost:3000')
        .post('/auth/register')
        .send({
          username: tempUsername,
          email: tempEmail,
          password: 'password123',
        });

      const tempUserId = userResponse.body.user.id;
      const tempToken = userResponse.body.access_token;

      // Create item for temp user
      const itemResponse = await request('http://localhost:3000')
        .post('/api/items')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          title: 'Temp Item',
          price: 10.00,
          owner_id: tempUserId,
        });

      const tempItemId = itemResponse.body.item.id;

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [tempUserId]);

      // Verify item was also deleted
      const itemCheck = await pool.query(
        'SELECT id FROM items WHERE id = $1',
        [tempItemId]
      );

      expect(itemCheck.rows.length).toBe(0);
    });
  });
});
