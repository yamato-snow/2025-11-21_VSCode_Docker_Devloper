#!/usr/bin/env node
/**
 * データベース初期化スクリプト
 *
 * 使い方:
 *   node init-db.js
 *
 * 環境変数:
 *   DATABASE_URL - PostgreSQL接続文字列
 */

const { Pool } = require('pg');

// 環境変数から接続情報を取得
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/myapp',
});

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log('='.repeat(60));
    console.log('データベース初期化を開始...');
    console.log('='.repeat(60));

    // トランザクション開始
    await client.query('BEGIN');

    // 既存テーブルを削除（開発環境のみ）
    console.log('\n既存テーブルを削除中...');
    await client.query('DROP TABLE IF EXISTS items CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ 既存テーブル削除完了');

    // テーブル作成
    console.log('\nテーブルを作成中...');

    // ユーザーテーブル
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // アイテムテーブル
    await client.query(`
      CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price FLOAT NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ テーブル作成完了');

    // インデックス作成
    console.log('\nインデックスを作成中...');
    await client.query('CREATE INDEX idx_users_username ON users(username)');
    await client.query('CREATE INDEX idx_users_email ON users(email)');
    await client.query('CREATE INDEX idx_items_owner_id ON items(owner_id)');
    console.log('✅ インデックス作成完了');

    // 初期データ投入
    console.log('\n初期データを投入中...');

    // テストユーザー作成（パスワードは "password123" のBase64エンコード版）
    await client.query(`
      INSERT INTO users (username, email, password_hash, is_active) VALUES
        ('testuser', 'test@example.com', 'cGFzc3dvcmQxMjM=', TRUE),
        ('admin', 'admin@example.com', 'cGFzc3dvcmQxMjM=', TRUE),
        ('demo', 'demo@example.com', 'cGFzc3dvcmQxMjM=', TRUE)
    `);

    // サンプルアイテム作成
    await client.query(`
      INSERT INTO items (title, description, price, owner_id) VALUES
        ('Sample Item 1', 'This is a sample item for testing', 1000, 1),
        ('Sample Item 2', 'Another sample item', 2500, 1),
        ('Premium Product', 'High-quality premium product', 5000, 2),
        ('Budget Option', 'Affordable choice for everyone', 500, 3),
        ('Limited Edition', 'Special limited edition item', 10000, 2)
    `);

    console.log('✅ 初期データ投入完了');

    // 確認
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    const itemCountResult = await client.query('SELECT COUNT(*) FROM items');
    const userCount = parseInt(userCountResult.rows[0].count);
    const itemCount = parseInt(itemCountResult.rows[0].count);

    // コミット
    await client.query('COMMIT');

    // 完了メッセージ
    console.log('\n' + '='.repeat(60));
    console.log('データベース初期化完了！');
    console.log('='.repeat(60));
    console.log(`ユーザー数: ${userCount}`);
    console.log(`アイテム数: ${itemCount}`);
    console.log('');
    console.log('デフォルトユーザー:');
    console.log('  username: testuser / password: password123');
    console.log('  username: admin / password: password123');
    console.log('  username: demo / password: password123');
    console.log('');
    console.log('APIテスト:');
    console.log('  curl http://localhost:3000/api/users');
    console.log('  curl http://localhost:3000/api/items');
    console.log('='.repeat(60));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    client.release();
  }
}

// スクリプト実行
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✅ 初期化スクリプト正常終了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 初期化スクリプトエラー:', error.message);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

module.exports = { initDatabase };
