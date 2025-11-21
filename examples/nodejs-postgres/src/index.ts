import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

// 環境変数読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL接続設定
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5433/myapp',
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
app.use(express.json());

// ==========================================
// ルート
// ==========================================

// ウェルカムエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Node.js + PostgreSQL + Redis Dev Container!',
    endpoints: {
      health: '/health',
      database: '/db',
      redis: '/redis',
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
