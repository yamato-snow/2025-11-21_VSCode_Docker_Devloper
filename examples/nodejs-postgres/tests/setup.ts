import { Pool } from 'pg';
import { createClient } from 'redis';

// Database connection for tests
export const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Redis client for tests
export const testRedisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Global setup
beforeAll(async () => {
  try {
    await testRedisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
});

// Global teardown
afterAll(async () => {
  await testPool.end();
  await testRedisClient.quit();
});

// Increase timeout for database operations
jest.setTimeout(30000);
