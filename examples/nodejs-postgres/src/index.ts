import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// 環境変数読み込み
dotenv.config();

// JWT設定
const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_key_change_in_production';
const ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '60');

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
// 型定義
// ==========================================
interface JwtPayload {
  sub: string;  // username
  exp: number;
}

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
  };
}

// ==========================================
// JWT認証ミドルウェア
// ==========================================
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    const username = decoded.sub;

    // ユーザー情報を取得
    const result = await pgPool.query(
      'SELECT id, username, email, is_active FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({ error: 'Inactive user' });
    }

    // リクエストにユーザー情報を追加
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ==========================================
// ユーティリティ関数
// ==========================================
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

function createAccessToken(username: string): string {
  const expiresIn = ACCESS_TOKEN_EXPIRE_MINUTES * 60; // seconds
  return jwt.sign(
    { sub: username },
    SECRET_KEY,
    { expiresIn }
  );
}

// ==========================================
// ルート
// ==========================================

// ウェルカムエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Node.js + PostgreSQL + Redis + React Fullstack with JWT Authentication!',
    endpoints: {
      health: '/health',
      database: '/db',
      redis: '/redis',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/token',
        me: 'GET /auth/me (protected)'
      },
      api: {
        users: '/api/users (protected)',
        items: '/api/items (protected)'
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
// 認証エンドポイント
// ==========================================

// POST /auth/register - ユーザー登録
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required',
      });
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
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

    // パスワードハッシュ化（bcrypt）
    const passwordHash = await hashPassword(password);

    const result = await pgPool.query(
      'INSERT INTO users (username, email, password_hash, is_active, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, is_active, created_at',
      [username, email, passwordHash, true]
    );

    const user = result.rows[0];

    // トークン生成
    const accessToken = createAccessToken(username);

    res.status(201).json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /auth/token - ログイン（トークン取得）
app.post('/auth/token', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    // ユーザー検証
    const result = await pgPool.query(
      'SELECT id, username, email, password_hash, is_active FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Incorrect username or password',
      });
    }

    const user = result.rows[0];

    // パスワード検証
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Incorrect username or password',
      });
    }

    // アクティブユーザーチェック
    if (!user.is_active) {
      return res.status(401).json({
        error: 'User account is inactive',
      });
    }

    // トークン生成
    const accessToken = createAccessToken(username);

    res.json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /auth/me - 現在のユーザー情報取得（保護されたルート）
app.get('/auth/me', authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({
    id: authReq.user?.id,
    username: authReq.user?.username,
    email: authReq.user?.email,
    is_active: authReq.user?.is_active,
  });
});

// ==========================================
// API エンドポイント
// ==========================================

// GET /api/users - ユーザー一覧（保護されたルート）
app.get('/api/users', authenticateToken, async (req: Request, res: Response) => {
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

// GET /api/users/:id - ユーザー詳細（保護されたルート）
app.get('/api/users/:id', authenticateToken, async (req: Request, res: Response) => {
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

// GET /api/items - アイテム一覧（保護されたルート）
app.get('/api/items', authenticateToken, async (req: Request, res: Response) => {
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

// POST /api/items - アイテム作成（保護されたルート）
app.post('/api/items', authenticateToken, async (req: Request, res: Response) => {
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

// GET /api/items/:id - アイテム詳細（保護されたルート）
app.get('/api/items/:id', authenticateToken, async (req: Request, res: Response) => {
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
