-- ==========================================
-- データベース初期化スクリプト（参考用）
-- ==========================================
-- 注意: このSQLファイルは参考用です。
-- 実際のデータベース初期化には init-db.js を使用してください。
-- 実行コマンド: npm run db:setup
-- ==========================================

-- 既存テーブルを削除（開発環境のみ）
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- テーブル定義
-- ==========================================

-- ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- アイテムテーブル
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_items_owner_id ON items(owner_id);

-- ==========================================
-- 初期データ投入
-- ==========================================

-- テストユーザー作成
-- パスワードは "password123" のBase64エンコード版（簡易版）
INSERT INTO users (username, email, password_hash, is_active) VALUES
    ('testuser', 'test@example.com', 'cGFzc3dvcmQxMjM=', TRUE),
    ('admin', 'admin@example.com', 'cGFzc3dvcmQxMjM=', TRUE),
    ('demo', 'demo@example.com', 'cGFzc3dvcmQxMjM=', TRUE);

-- サンプルアイテム作成
INSERT INTO items (title, description, price, owner_id) VALUES
    ('Sample Item 1', 'This is a sample item for testing', 1000, 1),
    ('Sample Item 2', 'Another sample item', 2500, 1),
    ('Premium Product', 'High-quality premium product', 5000, 2),
    ('Budget Option', 'Affordable choice for everyone', 500, 3),
    ('Limited Edition', 'Special limited edition item', 10000, 2);

-- ==========================================
-- 確認メッセージ
-- ==========================================

DO $$
DECLARE
    user_count INTEGER;
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO item_count FROM items;

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'データベース初期化完了！';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'ユーザー数: %', user_count;
    RAISE NOTICE 'アイテム数: %', item_count;
    RAISE NOTICE '';
    RAISE NOTICE 'デフォルトユーザー:';
    RAISE NOTICE '  username: testuser / password: password123';
    RAISE NOTICE '  username: admin / password: password123';
    RAISE NOTICE '  username: demo / password: password123';
    RAISE NOTICE '';
    RAISE NOTICE 'APIテスト:';
    RAISE NOTICE '  curl http://localhost:3000/api/users';
    RAISE NOTICE '  curl http://localhost:3000/api/items';
    RAISE NOTICE '============================================================';
END $$;
