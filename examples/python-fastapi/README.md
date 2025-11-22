# FastAPI + PostgreSQL + Redis Dev Container Example

このディレクトリには、VSCode Dev Containersで動作するFastAPI + PostgreSQL + Redisのモダンバックエンド開発環境サンプルが含まれています。

## 🌟 特徴

- **FastAPI**: 高速・モダンなPython Webフレームワーク（ASGI）
- **PostgreSQL**: 本番環境対応のリレーショナルデータベース
- **SQLAlchemy 2.0**: 非同期ORM（asyncpg使用）
- **JWT認証**: トークンベースの認証システム
- **Pydantic V2**: データバリデーションとシリアライゼーション
- **自動APIドキュメント**: Swagger UI & ReDoc
- **CORS設定**: Next.jsフロントエンド連携対応
- **Redis**: キャッシュ・セッション管理用（構成済みだが未実装）

## 📁 プロジェクト構造

```
python-fastapi/
├── .devcontainer/          # Dev Container設定
│   ├── devcontainer.json   # VSCode Dev Container設定
│   └── docker-compose.yml  # 開発環境用Docker Compose
├── main.py                 # FastAPIアプリケーション本体
├── database.py             # SQLAlchemy接続設定（非同期）
├── models.py               # データベースモデル定義（User, Item）
├── crud.py                 # CRUD操作（Create, Read, Update, Delete）
├── init_db.py              # データベース初期化スクリプト
├── requirements.txt        # Python依存パッケージ
├── Dockerfile              # Multi-stage Dockerfile
├── docker-compose.yml      # 本番環境用Docker Compose
├── docker-compose.prod.yml # 本番環境オーバーライド
├── .env.example            # 環境変数テンプレート
└── .gitignore              # Git除外設定
```

## 📊 データベース構造

### User テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | Integer | PRIMARY KEY | ユーザーID（自動採番） |
| email | String | UNIQUE, NOT NULL | メールアドレス |
| username | String | UNIQUE, NOT NULL | ユーザー名 |
| hashed_password | String | NOT NULL | ハッシュ化パスワード（bcrypt） |
| is_active | Boolean | NOT NULL | アクティブフラグ |
| created_at | DateTime | NOT NULL | 作成日時 |
| updated_at | DateTime | NOT NULL | 更新日時 |

### Item テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | Integer | PRIMARY KEY | アイテムID（自動採番） |
| title | String(100) | NOT NULL | タイトル |
| description | String(500) | NULL | 説明 |
| price | Float | NOT NULL | 価格 |
| owner_id | Integer | FOREIGN KEY → users.id | 所有者ID |
| created_at | DateTime | NOT NULL | 作成日時 |
| updated_at | DateTime | NOT NULL | 更新日時 |

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
cd examples/python-fastapi
code .
```

VSCode内で:
1. **F1** キーを押す
2. `Dev Containers: Reopen in Container` を選択
3. 初回ビルドを待つ（5〜10分）

### 3. データベース初期化（初回のみ必須）

コンテナが起動したら、**必ず最初にデータベース初期化を実行してください**:

```bash
python init_db.py
```

**期待される出力:**
```
============================================================
データベース初期化を開始...
============================================================
テーブルを作成中...
✅ テーブル作成完了

初期データを投入中...
✅ テストユーザー作成: testuser (ID: 1)

============================================================
データベース初期化完了！
============================================================

デフォルトユーザー:
  username: testuser
  password: password123

Swagger UI でテスト:
  http://localhost:8000/docs
============================================================
```

### 4. 開発サーバー起動

データベース初期化後、開発サーバーを起動:

```bash
# Dev Containerでは自動起動されますが、手動起動する場合:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 動作確認

ブラウザまたはcurlで以下のエンドポイントにアクセス:

```bash
# ルートエンドポイント
curl http://localhost:8000

# ヘルスチェック
curl http://localhost:8000/health

# Swagger UI（ブラウザで開く）
# http://localhost:8000/docs

# ReDoc（ブラウザで開く）
# http://localhost:8000/redoc
```

詳細なテスト手順は「🧪 詳細なテスト方法」セクションを参照してください。

## 📋 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `uvicorn main:app --reload` | 開発サーバー起動（ホットリロード） |
| `python init_db.py` | データベース初期化（テーブル作成＋初期データ） |
| `ruff check .` | コードチェック（Ruff linter） |
| `ruff format .` | コードフォーマット |

## 🔌 サービス構成

### アプリケーション (api)
- **ポート**: 8000
- **フレームワーク**: FastAPI + Uvicorn（ASGI）
- **ORM**: SQLAlchemy 2.0 + asyncpg
- **認証**: JWT（JSON Web Token）
- **バリデーション**: Pydantic V2

### PostgreSQL (db)
- **ポート**: 5433 (ホストからアクセス) / 5432 (コンテナ間通信)
- **ユーザー**: postgres
- **パスワード**: postgres
- **データベース**: fastapi_db
- **接続文字列**: `postgresql://postgres:postgres@db:5432/fastapi_db`

### Redis (redis)
- **ポート**: 6379
- **永続化**: AOF有効
- **用途**: キャッシュ・セッション管理用（構成済み、実装は任意）

## 🛠️ 開発ツール

Dev Container内に以下のツールが自動インストールされます:

- **Python 3.11**
- **FastAPI, Uvicorn, SQLAlchemy, asyncpg**
- **JWT, Passlib, bcrypt**
- **Ruff** (2025年推奨のモダンlinter/formatter)
- **PostgreSQL Client** (psql)
- **Git, Vim, Curl, Wget**
- **GitHub CLI** (gh)

### VSCode拡張機能

以下の拡張機能がコンテナ内に自動インストールされます:

- Python
- Pylance
- Ruff (linter & formatter)
- Docker
- SQLTools (PostgreSQL接続)

## 🧪 詳細なテスト方法

このセクションでは、各エンドポイントの詳細なテスト方法と期待される出力を説明します。

### 前提条件

テスト前に必ず `python init_db.py` を実行してデータベースを初期化してください。

### 1. ルートエンドポイント

APIの基本情報を取得します。

```bash
curl http://localhost:8000
```

**期待される出力:**
```json
{
  "message": "Welcome to FastAPI Backend API",
  "docs": "/docs",
  "redoc": "/redoc",
  "health": "/health"
}
```

### 2. ヘルスチェックエンドポイント

アプリケーションの健全性を確認します。

```bash
curl http://localhost:8000/health
```

**期待される出力:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:30:00.123456",
  "environment": "production"
}
```

### 3. ユーザー登録（POST /users）

新しいユーザーを作成します。

```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "securepassword123"
  }'
```

**期待される出力:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "id": 2,
  "is_active": true
}
```

**エラーケース（重複ユーザー名）:**
```json
{
  "detail": "Username already registered"
}
```

### 4. ログイン（POST /token）

JWTトークンを取得します。

```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123"
```

**期待される出力:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**重要:** このトークンを以降の認証が必要なエンドポイントで使用します。

### 5. 現在のユーザー情報取得（GET /users/me）

認証トークンを使用して自分の情報を取得します。

```bash
# まずトークンを環境変数に保存
TOKEN=$(curl -s -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123" | jq -r '.access_token')

# トークンを使用してユーザー情報取得
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

**期待される出力:**
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "id": 1,
  "is_active": true
}
```

### 6. アイテム作成（POST /items）

認証済みユーザーとして新しいアイテムを作成します。

```bash
curl -X POST "http://localhost:8000/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Product",
    "description": "This is a sample product",
    "price": 99.99
  }'
```

**期待される出力:**
```json
{
  "title": "Sample Product",
  "description": "This is a sample product",
  "price": 99.99,
  "id": 1,
  "owner_id": 1
}
```

### 7. アイテム一覧取得（GET /items）

すべてのアイテムを取得します（認証必須）。

```bash
curl -X GET "http://localhost:8000/items" \
  -H "Authorization: Bearer $TOKEN"
```

**期待される出力:**
```json
[
  {
    "title": "Sample Product",
    "description": "This is a sample product",
    "price": 99.99,
    "id": 1,
    "owner_id": 1
  }
]
```

**クエリパラメータ:**
```bash
# ページネーション（スキップ5件、最大10件取得）
curl -X GET "http://localhost:8000/items?skip=5&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. アイテム詳細取得（GET /items/{item_id}）

特定のアイテムを取得します。

```bash
curl -X GET "http://localhost:8000/items/1" \
  -H "Authorization: Bearer $TOKEN"
```

**期待される出力:**
```json
{
  "title": "Sample Product",
  "description": "This is a sample product",
  "price": 99.99,
  "id": 1,
  "owner_id": 1
}
```

**エラーケース（存在しないアイテム）:**
```json
{
  "detail": "Item not found"
}
```

### 9. 自動APIドキュメントの利用

FastAPIは自動的にインタラクティブなAPIドキュメントを生成します。

#### Swagger UI（推奨）

ブラウザで以下にアクセス:
```
http://localhost:8000/docs
```

**できること:**
1. すべてのエンドポイントを確認
2. 「Try it out」ボタンでブラウザから直接APIテスト
3. 認証トークンを設定してセキュアなエンドポイントをテスト
4. リクエスト/レスポンスのスキーマを確認

**認証方法（Swagger UI）:**
1. `/token` エンドポイントで「Try it out」をクリック
2. `username: testuser`, `password: password123` を入力して「Execute」
3. レスポンスの `access_token` をコピー
4. 画面右上の「Authorize」ボタンをクリック
5. `Bearer <トークン>` の形式でトークンを貼り付け（例: `Bearer eyJhbGc...`）
6. 以降、すべての認証エンドポイントでこのトークンが自動使用されます

#### ReDoc

ブラウザで以下にアクセス:
```
http://localhost:8000/redoc
```

よりドキュメント形式に特化したAPI仕様書が表示されます。

## 🗄️ データベース操作

### PostgreSQLに直接接続

#### Dev Container内から接続

```bash
# psqlで接続
psql -h db -U postgres -d fastapi_db

# パスワード: postgres
```

#### ホストマシンから接続

```bash
# ポート5433を使用
psql -h localhost -p 5433 -U postgres -d fastapi_db
```

### PostgreSQL内での操作例

```sql
-- テーブル一覧
\dt

-- Userテーブルの構造確認
\d users

-- ユーザー一覧表示
SELECT id, username, email, is_active, created_at FROM users;

-- 特定ユーザーのアイテム一覧
SELECT i.id, i.title, i.price, u.username
FROM items i
JOIN users u ON i.owner_id = u.id
WHERE u.username = 'testuser';

-- アイテムの統計
SELECT
  COUNT(*) as total_items,
  AVG(price) as avg_price,
  MAX(price) as max_price,
  MIN(price) as min_price
FROM items;

-- 終了
\q
```

### データベースリセット

開発中にデータベースをリセットしたい場合:

```bash
# init_db.pyは既存のテーブルを削除してから再作成します
python init_db.py
```

**警告:** このコマンドはすべてのデータを削除します！

## 🔐 認証フロー詳細

### JWT認証の仕組み

1. **ユーザー登録**: POST `/users` でユーザー作成（パスワードはbcryptでハッシュ化）
2. **ログイン**: POST `/token` でユーザー名とパスワードを送信
3. **トークン取得**: 認証成功するとJWTトークンが返される
4. **認証API呼び出し**: `Authorization: Bearer <トークン>` ヘッダーを付けてリクエスト
5. **トークン検証**: サーバー側でトークンを検証し、ユーザー情報を取得

### セキュリティ設定

**main.py** の設定:
```python
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # デフォルト60分
```

**本番環境では必ず変更してください:**
```bash
# .env ファイル
SECRET_KEY=<強力なランダム文字列>
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

強力なSECRET_KEYを生成:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🌐 CORS設定（フロントエンド連携）

Next.jsなどのフロントエンドと連携する場合、CORSが設定済みです。

**デフォルト設定:**
```python
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
```

**環境変数で変更:**
```bash
# .env ファイル
CORS_ORIGINS=http://localhost:3000,http://myapp.local:3000
```

### フロントエンド連携の例（Next.js）

```javascript
// Next.js API呼び出し例
const response = await fetch('http://localhost:8000/items', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const items = await response.json();
```

## 📝 環境変数

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

主要な環境変数:

```bash
# 環境設定
ENVIRONMENT=production

# データベース設定（コンテナ間通信）
DATABASE_URL=postgresql://postgres:postgres@db:5432/fastapi_db

# JWT認証設定
SECRET_KEY=dev_secret_key_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS設定
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**ポート番号について:**
- **コンテナ内部（db:5432）**: アプリケーションコンテナからPostgreSQLコンテナへの接続
- **ホストマシン（localhost:5433）**: ホストマシン上のツール（TablePlusなど）から接続する場合

## 🏭 本番環境ビルド

### ローカルでテスト

```bash
# 本番用イメージをビルド
docker build --target production -t fastapi-app:latest .

# 本番環境構成で起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 動作確認
curl http://localhost:8000/health

# ログ確認
docker compose logs api -f

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🐛 トラブルシューティング

### 「Internal Server Error」が発生

**原因:** データベーステーブルが作成されていない

**解決方法:**
```bash
python init_db.py
```

### 「relation "users" does not exist」エラー

**原因:** データベース初期化が実行されていない

**解決方法:**
```bash
# データベース初期化を実行
python init_db.py

# それでも解決しない場合、コンテナを再起動
docker compose restart db
python init_db.py
```

### コンテナが起動しない

```bash
# Docker Desktopが起動しているか確認
docker ps

# ログを確認
docker compose logs api

# コンテナを再構築
# F1 → "Dev Containers: Rebuild Container"
```

### ポートがすでに使用されている

```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :8000

# Windows
netstat -ano | findstr :8000

# devcontainer.jsonのforwardPortsを変更
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker compose ps db

# ヘルスチェック確認
docker compose ps

# DATABASE_URLが正しいか確認（db:5432 を使用）
echo $DATABASE_URL
```

### トークン認証エラー

```bash
# トークンの有効期限を確認（デフォルト60分）
# 期限切れの場合は再度ログインしてトークンを取得

# トークンが正しい形式か確認
# 形式: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🎯 統合テストスクリプト

すべてのエンドポイントを順番にテストするスクリプト例:

```bash
#!/bin/bash
set -e

echo "=== FastAPI + PostgreSQL 統合テスト ==="
echo ""

# 1. ヘルスチェック
echo "1. ヘルスチェック"
curl -s http://localhost:8000/health | jq .
echo ""

# 2. ユーザー登録
echo "2. ユーザー登録"
curl -s -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","username":"testuser2","password":"password123"}' \
  | jq .
echo ""

# 3. ログイン
echo "3. ログイン"
TOKEN=$(curl -s -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123" \
  | jq -r '.access_token')
echo "Token取得成功: ${TOKEN:0:50}..."
echo ""

# 4. ユーザー情報取得
echo "4. ユーザー情報取得"
curl -s -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
echo ""

# 5. アイテム作成
echo "5. アイテム作成"
curl -s -X POST "http://localhost:8000/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Item","description":"Test Description","price":123.45}' \
  | jq .
echo ""

# 6. アイテム一覧取得
echo "6. アイテム一覧取得"
curl -s -X GET "http://localhost:8000/items" \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
echo ""

echo "=== テスト完了 ==="
```

このスクリプトを `test.sh` として保存し、実行権限を付与して実行:

```bash
chmod +x test.sh
./test.sh
```

## 📚 参考リンク

- [メインREADME](../../README.md) - VSCode + Docker開発環境の包括的ガイド
- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0ドキュメント](https://docs.sqlalchemy.org/)
- [Pydantic V2ドキュメント](https://docs.pydantic.dev/)
- [JWT認証の仕組み](https://jwt.io/)
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
