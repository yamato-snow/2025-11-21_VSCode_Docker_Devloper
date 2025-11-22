# Node.js + PostgreSQL + Redis + React Fullstack Dev Container Example

このディレクトリには、VSCode Dev Containersで動作するNode.js + PostgreSQL + Redis + Reactのフルスタック開発環境サンプルが含まれています。

## 📁 構成

```
nodejs-postgres/
├── .devcontainer/          # Dev Container設定
│   ├── devcontainer.json   # VSCode Dev Container設定
│   └── docker-compose.yml  # 開発環境用Docker Compose
├── src/                    # バックエンドソースコード
│   └── index.ts            # Express APIサーバー
├── client/                 # フロントエンドソースコード
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   │   ├── UserList.tsx
│   │   │   └── ItemList.tsx
│   │   ├── App.tsx         # メインアプリケーション
│   │   ├── main.tsx        # エントリーポイント
│   │   ├── api.ts          # API クライアント
│   │   └── index.css       # スタイル（Tailwind CSS）
│   ├── index.html          # HTMLテンプレート
│   ├── vite.config.ts      # Vite設定（Docker対応）
│   └── tsconfig.json       # TypeScript設定（フロントエンド）
├── Dockerfile              # Multi-stage Dockerfile
├── docker-compose.yml      # 本番環境用Docker Compose
├── docker-compose.prod.yml # 本番環境オーバーライド
├── init-db.js              # データベース初期化スクリプト（Node.js）
├── init-db.sql             # データベーススキーマ参考（参考用）
├── package.json            # Node.js依存関係（フルスタック）
├── tsconfig.json           # TypeScript設定（バックエンド）
├── tailwind.config.js      # Tailwind CSS設定
├── postcss.config.js       # PostCSS設定
├── .env.example            # 環境変数テンプレート
└── .gitignore              # Git除外設定
```

## 🚀 Dev Containersで開発を始める

### 1. 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop) がインストール済み
- [VSCode](https://code.visualstudio.com/) がインストール済み
- VSCode拡張機能がインストール済み:
  - **Dev Containers** (`ms-vscode-remote.remote-containers`)
  - **Docker** (`ms-azuretools.vscode-docker`)

### 2. Dev Containerで開く

```bash
# このディレクトリをVSCodeで開く
cd examples/nodejs-postgres
code .
```

VSCode内で:
1. **F1** キーを押す
2. `Dev Containers: Reopen in Container` を選択
3. 初回ビルドを待つ（5〜10分）
4. データベース初期化（`postCreateCommand`で自動実行）とサーバー起動（docker-compose.ymlで自動実行）を待つ

### 3. 開発サーバー（自動起動）

Dev Containerが完全に起動すると、以下が自動的に実行されます:

1. **npm install** - 依存関係のインストール
2. **npm run db:setup** - データベーステーブル作成と初期データ投入（`init-db.js`を実行）
3. **npm run dev** - バックエンド（Express）とフロントエンド（Vite）の同時起動

**手動で再起動する場合:**

```bash
# バックエンド + フロントエンド（同時起動）
npm run dev

# バックエンドのみ
npm run server:dev

# フロントエンドのみ
npm run client:dev
```

### 4. 動作確認

#### フロントエンド（Reactアプリケーション）

ブラウザで以下にアクセス:

```
http://localhost:5173
```

フロントエンドアプリケーションが表示され、以下の機能が使用できます:
- **ユーザー管理**: ユーザー一覧表示、新規ユーザー作成
- **アイテム管理**: アイテム一覧表示、新規アイテム作成

#### バックエンドAPI

curlで以下のエンドポイントにアクセス:

```bash
# ウェルカムメッセージ
curl http://localhost:3000

# ヘルスチェック
curl http://localhost:3000/health

# PostgreSQL接続テスト
curl http://localhost:3000/db

# Redis接続テスト
curl http://localhost:3000/redis

# ユーザー一覧取得（API）
curl http://localhost:3000/api/users

# アイテム一覧取得（API）
curl http://localhost:3000/api/items
```

詳細なテスト手順は「🧪 詳細なテスト方法」セクションを参照してください。

## 📋 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | **フルスタック開発サーバー起動**（バックエンド + フロントエンド同時起動） |
| `npm run server:dev` | バックエンドのみ起動（Express API） |
| `npm run client:dev` | フロントエンドのみ起動（Vite + React） |
| `npm run build` | フルスタックビルド（バックエンド + フロントエンド） |
| `npm run build:server` | バックエンドのみビルド（TypeScript → dist/） |
| `npm run build:client` | フロントエンドのみビルド（React → dist/client/） |
| `npm start` | ビルド済みアプリを起動（本番用） |
| `npm run db:setup` | **データベース初期化**（`init-db.js`実行 - Node.jsスクリプト） |
| `npm run db:migrate` | データベースマイグレーション |

## 🔌 サービス構成

### アプリケーション (app)
- **バックエンドポート**: 3000 (Express API)
- **フロントエンドポート**: 5173 (Vite + React)
- **デバッグポート**: 9229
- **バックエンド**: Express + TypeScript + PostgreSQL + Redis
- **フロントエンド**: React 19 + Vite 6 + TypeScript + Tailwind CSS
- **ホットリロード**: nodemon (バックエンド) + Vite HMR (フロントエンド)

### PostgreSQL (db)
- **ポート**: 5433 (ホストからアクセス) / 5432 (コンテナ間通信)
- **ユーザー**: postgres
- **パスワード**: postgres
- **データベース**: myapp
- **接続文字列**: `postgresql://postgres:postgres@db:5432/myapp`

### Redis (redis)
- **ポート**: 6379
- **永続化**: AOF有効

## 🛠️ 開発ツール

Dev Container内に以下のツールが自動インストールされます:

- **Node.js 20** (LTS)
- **TypeScript, ts-node, nodemon**
- **PostgreSQL Client** (psql)
- **Git, Vim, Curl, Wget**
- **GitHub CLI** (gh)

### VSCode拡張機能

以下の拡張機能がコンテナ内に自動インストールされます:

- **ESLint** - コード品質チェック
- **Prettier** - コードフォーマッター
- **Docker** - Dockerコンテナ管理
- **SQLTools** - PostgreSQL接続（GUI）
- **TypeScript** - 型チェック
- **Tailwind CSS IntelliSense** - Tailwind CSS補完
- **ES7 React/Redux Snippets** - Reactスニペット
- **Auto Rename Tag** - HTMLタグ自動リネーム

## 🔧 データベース接続

### データベース初期化（init-db.js）

データベースの初期化には、`init-db.js`（Node.jsスクリプト）を使用します。

```bash
# 手動でデータベース初期化を実行
npm run db:setup

# または直接実行
node init-db.js
```

**init-db.js の特徴:**
- `pg`パッケージを使用してPostgreSQLに接続
- `DATABASE_URL`環境変数から接続情報を自動取得（パスワード不要）
- トランザクションによる安全な実行
- テーブル作成 + インデックス作成 + テストデータ投入を一括実行
- python-fastapiの`init_db.py`と同じパターンで実装

**初期データ:**
- ユーザー: testuser, admin, demo (パスワード: password123)
- アイテム: 5件のサンプルデータ

### PostgreSQL (SQLTools)

VSCodeのSQLToolsアイコンをクリック → "PostgreSQL Local" → テーブル一覧が表示

### PostgreSQL (psql)

```bash
# コンテナ内から
psql -h db -U postgres -d myapp

# またはdocker compose経由
docker compose exec db psql -U postgres -d myapp

# テーブル確認
docker compose exec db psql -U postgres -d myapp -c "\dt"

# ユーザーデータ確認
docker compose exec db psql -U postgres -d myapp -c "SELECT * FROM users;"
```

### Redis (redis-cli)

```bash
# Redisコンテナに接続
docker compose exec redis redis-cli

# 接続テスト
127.0.0.1:6379> PING
PONG

# キーの一覧確認
127.0.0.1:6379> KEYS *

# 特定のキーの値を取得
127.0.0.1:6379> GET test:connection
```

## 🌐 API エンドポイント

このアプリケーションは、FlaskやFastAPIサンプルと同様のREST APIを提供します。

### ユーザー管理API

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/users` | ユーザー一覧取得（ページネーション対応） |
| POST | `/api/users` | 新規ユーザー作成 |
| GET | `/api/users/:id` | ユーザー詳細取得 |

**クエリパラメータ（GET /api/users）:**
- `page`: ページ番号（デフォルト: 1）
- `per_page`: 1ページあたりの件数（デフォルト: 10）

**リクエストボディ（POST /api/users）:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### アイテム管理API

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/items` | アイテム一覧取得（ページネーション対応） |
| POST | `/api/items` | 新規アイテム作成 |
| GET | `/api/items/:id` | アイテム詳細取得 |

**リクエストボディ（POST /api/items）:**
```json
{
  "title": "Sample Item",
  "description": "Item description",
  "price": 1000,
  "owner_id": 1
}
```

### システムAPI

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/` | ウェルカムメッセージ |
| GET | `/health` | ヘルスチェック |
| GET | `/db` | PostgreSQL接続テスト |
| GET | `/redis` | Redis接続テスト |

## 🧪 詳細なテスト方法

このセクションでは、各エンドポイントの詳細なテスト方法と期待される出力を説明します。

### 1. ウェルカムエンドポイント

アプリケーションが正常に起動しているか確認します。

```bash
curl http://localhost:3000
```

**期待される出力:**
```json
{
  "message": "Welcome to Node.js + PostgreSQL + Redis Dev Container!",
  "endpoints": {
    "health": "/health",
    "database": "/db",
    "redis": "/redis"
  },
  "environment": "development"
}
```

### 2. ヘルスチェックエンドポイント

アプリケーションの健全性を確認します（Dockerのヘルスチェックでも使用）。

```bash
curl http://localhost:3000/health
```

**期待される出力:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:30:00.123Z"
}
```

### 3. PostgreSQL接続テスト

データベースへの接続が正常に機能しているか確認します。

```bash
curl http://localhost:3000/db
```

**期待される出力:**
```json
{
  "status": "success",
  "message": "PostgreSQL connection successful",
  "data": {
    "current_time": "2025-11-22 10:30:00.123456+00",
    "version": "PostgreSQL 16.0 (Debian 16.0-1.pgdg120+1) on x86_64-pc-linux-gnu..."
  }
}
```

**エラーが発生した場合:**
```json
{
  "status": "error",
  "message": "Failed to connect to PostgreSQL",
  "error": "connection refused"
}
```

エラーの場合は、`docker compose ps db` でデータベースコンテナの状態を確認してください。

### 4. Redis接続テスト

Redisへの接続と読み書きが正常に機能しているか確認します。

```bash
curl http://localhost:3000/redis
```

**期待される出力:**
```json
{
  "status": "success",
  "message": "Redis connection successful",
  "data": {
    "set": "2025-11-22T10:30:00.123Z",
    "get": "2025-11-22T10:30:00.123Z",
    "match": true
  }
}
```

このエンドポイントは以下の動作を行います:
1. `test:connection` キーに現在時刻を保存
2. 同じキーから値を取得
3. 保存した値と取得した値が一致するか確認

### 5. データベース直接接続テスト

PostgreSQLに直接接続してデータを確認できます。

```bash
# Dev Container内のターミナルで実行
psql -h db -U postgres -d myapp

# または
docker compose exec db psql -U postgres -d myapp
```

**PostgreSQL内でのコマンド例:**
```sql
-- データベース一覧
\l

-- 現在のデータベース情報
\conninfo

-- テーブル一覧（まだテーブルがない場合は空）
\dt

-- 現在時刻を取得（接続確認）
SELECT NOW();

-- PostgreSQLバージョン確認
SELECT version();

-- 終了
\q
```

### 6. Redis直接接続テスト

Redisに直接接続してキャッシュデータを確認できます。

```bash
# Redisコンテナに接続
docker compose exec redis redis-cli
```

**Redis内でのコマンド例:**
```bash
# 接続確認
127.0.0.1:6379> PING
PONG

# すべてのキーを表示
127.0.0.1:6379> KEYS *
1) "test:connection"

# 特定のキーの値を取得
127.0.0.1:6379> GET test:connection
"2025-11-22T10:30:00.123Z"

# キーの有効期限を設定（例: 300秒）
127.0.0.1:6379> EXPIRE test:connection 300
(integer) 1

# 終了
127.0.0.1:6379> EXIT
```

### 7. ログの確認

アプリケーションの動作を詳細に確認したい場合:

```bash
# Dev Container内で開発サーバーのログを確認（npm run dev実行中）
# ターミナルに直接出力されます

# または、docker compose経由でログ確認
docker compose logs app -f

# 特定のサービスのログ
docker compose logs db -f
docker compose logs redis -f
```

### 8. ユーザーAPI テスト

データベースの初期データを使ってユーザーAPIをテストします。

```bash
# ユーザー一覧取得
curl http://localhost:3000/api/users

# 特定のユーザー取得
curl http://localhost:3000/api/users/1

# 新規ユーザー作成
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "password123"
  }'
```

**期待される出力（ユーザー一覧）:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "is_active": true,
      "created_at": "2025-11-22T10:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "per_page": 10
}
```

### 9. アイテムAPI テスト

データベースの初期データを使ってアイテムAPIをテストします。

```bash
# アイテム一覧取得
curl http://localhost:3000/api/items

# 特定のアイテム取得
curl http://localhost:3000/api/items/1

# 新規アイテム作成
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Product",
    "description": "A new product description",
    "price": 2500,
    "owner_id": 1
  }'
```

**期待される出力（アイテム一覧）:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample Item 1",
      "description": "This is a sample item for testing",
      "price": 1000,
      "owner_id": 1,
      "created_at": "2025-11-22T10:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 10
}
```

### 10. 統合テスト（全エンドポイント）

すべてのエンドポイントを順番にテストするスクリプト例:

```bash
#!/bin/bash
echo "=== Node.js + PostgreSQL + Redis + React 統合テスト ==="
echo ""

echo "1. ウェルカムエンドポイント"
curl -s http://localhost:3000 | jq .
echo ""

echo "2. ヘルスチェック"
curl -s http://localhost:3000/health | jq .
echo ""

echo "3. PostgreSQL接続テスト"
curl -s http://localhost:3000/db | jq .
echo ""

echo "4. Redis接続テスト"
curl -s http://localhost:3000/redis | jq .
echo ""

echo "5. ユーザーAPI テスト"
curl -s http://localhost:3000/api/users | jq .
echo ""

echo "6. アイテムAPI テスト"
curl -s http://localhost:3000/api/items | jq .
echo ""

echo "=== テスト完了 ==="
echo "フロントエンドは http://localhost:5173 でアクセスしてください"
```

このスクリプトを `test.sh` として保存し、実行権限を付与して実行:

```bash
chmod +x test.sh
./test.sh
```

## 🏭 本番環境ビルド

### ローカルでテスト

```bash
# 本番用イメージをビルド
docker build --target production -t myapp:latest .

# 本番環境構成で起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 動作確認
curl http://localhost:3000/health

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 📝 環境変数

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

主要な環境変数:

```bash
NODE_ENV=development

# コンテナ間通信用（アプリケーションコンテナから）
DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp

# ホストマシンから接続する場合（psqlなど）
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/myapp

REDIS_URL=redis://redis:6379
LOG_LEVEL=debug
```

**ポート番号について:**
- **コンテナ内部（db:5432）**: アプリケーションコンテナからPostgreSQLコンテナへの接続
- **ホストマシン（localhost:5433）**: ホストマシン上のツール（TablePlusなど）から接続する場合

このサンプルでは、コンテナ間通信なので `db:5432` を使用します。

## 🐛 トラブルシューティング

### エラー: relation "users" does not exist

**原因:** データベーステーブルが作成されていない（初期化未実行）

**解決方法:**
```bash
# データベース初期化を実行
npm run db:setup

# または直接実行
node init-db.js
```

**注意:** コンテナを再利用した場合、`postCreateCommand`は実行されません。手動で初期化が必要です。

### コンテナが起動しない

```bash
# Docker Desktopが起動しているか確認
docker ps

# コンテナを再構築
# F1 → "Dev Containers: Rebuild Container"
```

### ポートがすでに使用されている

```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :3000

# devcontainer.jsonのforwardPortsを変更
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker compose ps db

# ログ確認
docker compose logs db

# DATABASE_URLが正しいか確認（db:5432 を使用）
echo $DATABASE_URL
```

## 📚 参考リンク

- [メインREADME](../../README.md) - VSCode + Docker開発環境の包括的ガイド
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker公式ドキュメント](https://docs.docker.com/)
