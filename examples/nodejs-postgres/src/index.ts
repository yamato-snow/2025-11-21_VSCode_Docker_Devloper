import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';

// 環境変数読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL接続設定
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/myapp',
});

// Redis接続設定
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

// Redisエラーハンドリング
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Redis接続
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
})();

// ミドルウェア
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// ルート
// ==========================================

// ウェルカムエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Node.js + PostgreSQL + Redis + React Fullstack!',
    endpoints: {
      health: '/health',
      database: '/db',
      redis: '/redis',
      api: {
        users: '/api/users',
        items: '/api/items'
      }
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// ヘルスチェックエンドポイント（Dockerfileで使用）
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// PostgreSQL接続テスト
app.get('/db', async (req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT NOW() as current_time, version() as version');
    res.json({
      status: 'success',
      message: 'PostgreSQL connection successful',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('PostgreSQL Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to PostgreSQL',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Redis接続テスト
app.get('/redis', async (req: Request, res: Response) => {
  try {
    // テストキーを設定
    const testKey = 'test:connection';
    const testValue = new Date().toISOString();

    await redisClient.set(testKey, testValue);
    const retrievedValue = await redisClient.get(testKey);

    res.json({
      status: 'success',
      message: 'Redis connection successful',
      data: {
        set: testValue,
        get: retrievedValue,
        match: testValue === retrievedValue,
      },
    });
  } catch (error) {
    console.error('Redis Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Redis',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==========================================
// API エンドポイント
// ==========================================

// GET /api/users - ユーザー一覧
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 10;
    const offset = (page - 1) * perPage;

    const countResult = await pgPool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    const result = await pgPool.query(
      'SELECT id, username, email, is_active, created_at FROM users ORDER BY id LIMIT $1 OFFSET $2',
      [perPage, offset]
    );

    res.json({
      users: result.rows,
      total,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/users - ユーザー作成
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required',
      });
    }

    // 重複チェック
    const existingUser = await pgPool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Username or email already exists',
      });
    }

    // パスワードハッシュ化（簡易版 - 本番環境ではbcryptを使用）
    const passwordHash = Buffer.from(password).toString('base64');

    const result = await pgPool.query(
      'INSERT INTO users (username, email, password_hash, is_active, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, is_active, created_at',
      [username, email, passwordHash, true]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/users/:id - ユーザー詳細
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const result = await pgPool.query(
      'SELECT id, username, email, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/items - アイテム一覧
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 10;
    const offset = (page - 1) * perPage;

    const countResult = await pgPool.query('SELECT COUNT(*) FROM items');
    const total = parseInt(countResult.rows[0].count);

    const result = await pgPool.query(
      'SELECT id, title, description, price, owner_id, created_at FROM items ORDER BY id LIMIT $1 OFFSET $2',
      [perPage, offset]
    );

    res.json({
      items: result.rows,
      total,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch items',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/items - アイテム作成
app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const { title, description, price, owner_id } = req.body;

    if (!title || price === undefined || !owner_id) {
      return res.status(400).json({
        error: 'Title, price, and owner_id are required',
      });
    }

    // ユーザー存在確認
    const userExists = await pgPool.query(
      'SELECT id FROM users WHERE id = $1',
      [owner_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await pgPool.query(
      'INSERT INTO items (title, description, price, owner_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, title, description, price, owner_id, created_at',
      [title, description || null, price, owner_id]
    );

    res.status(201).json({
      message: 'Item created successfully',
      item: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/items/:id - アイテム詳細
app.get('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    const result = await pgPool.query(
      'SELECT id, title, description, price, owner_id, created_at FROM items WHERE id = $1',
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==========================================
// サーバー起動
// ==========================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'using default'}`);
  console.log(`Redis: ${process.env.REDIS_URL ? 'configured' : 'using default'}`);
  console.log('='.repeat(60));
  console.log('Available endpoints:');
  console.log(`  GET /         - Welcome message`);
  console.log(`  GET /health   - Health check`);
  console.log(`  GET /db       - PostgreSQL connection test`);
  console.log(`  GET /redis    - Redis connection test`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pgPool.end();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pgPool.end();
  await redisClient.quit();
  process.exit(0);
});
