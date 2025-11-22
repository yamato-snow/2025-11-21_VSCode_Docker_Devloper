# Flask + React + PostgreSQL Fullstack Dev Container Example

このディレクトリには、VSCode Dev Containersで動作するFlask + React + PostgreSQLのフルスタック開発環境サンプルが含まれています。

## 🌟 特徴

### バックエンド（Flask）
- **Flask**: Pythonの軽量かつ柔軟なWebフレームワーク（WSGI）
- **PostgreSQL**: 本番環境対応のリレーショナルデータベース
- **Flask-SQLAlchemy**: Flaskに最適化されたORM
- **JWT認証**: トークンベースの認証システム
- **Flask-Bcrypt**: パスワードハッシュ化
- **Flask-CORS**: クロスオリジン対応（React連携）
- **シンプルな構成**: 学習に最適な最小限の実装

### フロントエンド（React）
- **React 19**: 最新のReactフレームワーク
- **Vite 6**: 超高速ビルドツール
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS**: ユーティリティファーストCSS
- **JWT認証UI**: ログイン/新規登録フォーム
- **認証ガード**: トークンベースのルーティング保護

## 📁 プロジェクト構造

```
python-flask/
├── .devcontainer/          # Dev Container設定
│   ├── devcontainer.json   # VSCode Dev Container設定
│   └── docker-compose.yml  # 開発環境用Docker Compose
├── client/                 # Reactフロントエンド
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   │   ├── Login.tsx   # ログイン/新規登録UI
│   │   │   ├── UserList.tsx # ユーザー情報表示
│   │   │   └── ItemList.tsx # アイテム管理
│   │   ├── App.tsx         # メインアプリケーション
│   │   ├── api.ts          # API クライアント（JWT認証付き）
│   │   ├── main.tsx        # エントリポイント
│   │   └── index.css       # Tailwind CSS
│   ├── vite.config.ts      # Vite設定
│   ├── tsconfig.json       # TypeScript設定
│   └── index.html          # HTMLテンプレート
├── app.py                  # Flaskアプリケーション本体（モデル含む）
├── init_db.py              # データベース初期化スクリプト
├── package.json            # npm依存パッケージ
├── tailwind.config.js      # Tailwind CSS設定
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
| username | String(50) | UNIQUE, NOT NULL | ユーザー名 |
| email | String(120) | UNIQUE, NOT NULL | メールアドレス |
| password_hash | String(255) | NOT NULL | ハッシュ化パスワード（bcrypt） |
| is_active | Boolean | NOT NULL | アクティブフラグ |
| created_at | DateTime | NOT NULL | 作成日時 |

### Item テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | Integer | PRIMARY KEY | アイテムID（自動採番） |
| title | String(100) | NOT NULL | タイトル |
| description | Text | NULL | 説明 |
| price | Float | NOT NULL | 価格 |
| owner_id | Integer | FOREIGN KEY → users.id | 所有者ID |
| created_at | DateTime | NOT NULL | 作成日時 |

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
cd examples/python-flask
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

React UI でログイン:
  http://localhost:5173
============================================================
```

### 4. 開発サーバー起動

データベース初期化後、バックエンドとフロントエンドの開発サーバーを起動します。

#### バックエンド（Flask）

```bash
# Dev Containerでは自動起動されますが、手動起動する場合:
python app.py

# または Flask CLI を使用:
flask run --host=0.0.0.0 --port=5000 --debug
```

バックエンドは **http://localhost:5001** で起動します。

#### フロントエンド（React + Vite）

**新しいターミナルを開いて**以下を実行:

```bash
npm run dev
```

フロントエンドは **http://localhost:5173** で起動します。

**📝 重要:** バックエンドとフロントエンドは**両方同時に起動**する必要があります。フロントエンドはバックエンドAPIを呼び出すため、両方が起動している状態で動作します。

### 5. フロントエンド（React UI）での動作確認

ブラウザで **http://localhost:5173** にアクセスすると、ログイン画面が表示されます。

#### ログイン手順

1. ブラウザで http://localhost:5173 を開く
2. 「ログイン」タブを選択（デフォルト）
3. 以下のデフォルトユーザー情報でログイン:
   - **username**: `testuser`
   - **password**: `password123`
4. ログイン成功後、ユーザー情報とアイテム管理画面が表示されます

#### 新規ユーザー登録

1. 「新規登録」タブに切り替え
2. ユーザー名、メールアドレス、パスワード（8文字以上）を入力
3. 登録完了後、自動的にログインされます

#### UI機能

- **ユーザー情報タブ**: 現在のログインユーザーの情報を表示
- **アイテム管理タブ**: アイテムの作成・一覧表示
- **ログアウト**: 右上のボタンでログアウト（トークンが削除されます）

### 6. バックエンドAPI（直接テスト）での動作確認

ブラウザまたはcurlで以下のエンドポイントにアクセス:

```bash
# ルートエンドポイント
curl http://localhost:5001

# ヘルスチェック
curl http://localhost:5001/health

# データベース接続テスト
curl http://localhost:5001/api/db-test
```

詳細なテスト手順は「🧪 詳細なテスト方法」セクションを参照してください。

## 📋 利用可能なコマンド

### バックエンド（Flask）

| コマンド | 説明 |
|---------|------|
| `python app.py` | 開発サーバー起動（デバッグモード） |
| `flask run --debug` | Flask CLI使用（デバッグモード） |
| `python init_db.py` | データベース初期化（テーブル作成＋初期データ） |
| `black .` | コードフォーマット（Black） |
| `pylint app.py` | コード品質チェック（Pylint） |

### フロントエンド（React）

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Vite開発サーバー起動（ポート5173） |
| `npm run build` | 本番用ビルド |
| `npm run preview` | ビルド後のプレビュー |

## 🔌 サービス構成

### フロントエンド (React + Vite)
- **ポート**: 5173
- **フレームワーク**: React 19 + Vite 6
- **スタイリング**: Tailwind CSS
- **型安全性**: TypeScript
- **認証**: JWT トークン（localStorage保存）
- **APIプロキシ**: `/api` → `http://localhost:5001`

### バックエンド (app)
- **ポート**: 5001 (ホスト), 5000 (コンテナ)
- **フレームワーク**: Flask（WSGI）
- **ORM**: Flask-SQLAlchemy
- **認証**: JWT（JSON Web Token）
- **パスワードハッシュ**: Flask-Bcrypt
- **CORS**: React Vite (port 5173) 対応

### PostgreSQL (db)
- **ポート**: 5433 (ホストからアクセス) / 5432 (コンテナ間通信)
- **ユーザー**: postgres
- **パスワード**: postgres
- **データベース**: flask_app
- **接続文字列**: `postgresql://postgres:postgres@db:5432/flask_app`

## 🛠️ 開発ツール

Dev Container内に以下のツールが自動インストールされます:

### バックエンド（Python）
- **Python 3.11**
- **Flask, SQLAlchemy, psycopg2**
- **Flask-Bcrypt, Flask-CORS, Flask-JWT-Extended**
- **Black** (コードフォーマッター)
- **Pylint** (静的解析ツール)
- **PostgreSQL Client** (psql)

### フロントエンド（Node.js）
- **Node.js 20.x**
- **npm** (パッケージマネージャー)
- **React 19, Vite 6, TypeScript**
- **Tailwind CSS**

### 共通ツール
- **Git, Vim, Curl, Wget**
- **GitHub CLI** (gh)
- **Docker** (Docker-in-Docker)

### VSCode拡張機能

以下の拡張機能がコンテナ内に自動インストールされます:

#### Python開発
- Python
- Pylance
- Black Formatter
- Pylint

#### React/TypeScript開発
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

#### データベース・その他
- SQLTools (PostgreSQL接続)
- Docker
- REST Client (API テスト)

## 🧪 詳細なテスト方法

このセクションでは、各エンドポイントの詳細なテスト方法と期待される出力を説明します。

### 前提条件

テスト前に必ず `python init_db.py` を実行してデータベースを初期化してください。

### 1. ルートエンドポイント

APIの基本情報を取得します。

```bash
curl http://localhost:5001
```

**期待される出力:**
```json
{
  "message": "Welcome to Flask Backend API",
  "framework": "Flask",
  "environment": "production",
  "endpoints": {
    "health": "/health",
    "users": "/api/users",
    "items": "/api/items",
    "database_test": "/api/db-test",
    "auth": {
      "register": "/auth/register",
      "token": "/auth/token",
      "me": "/auth/me"
    }
  }
}
```

### 2. ヘルスチェックエンドポイント

アプリケーションの健全性を確認します。

```bash
curl http://localhost:5001/health
```

**期待される出力:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:30:00.123456"
}
```

### 3. データベース接続テスト

PostgreSQLへの接続が正常に機能しているか確認します。

```bash
curl http://localhost:5001/api/db-test
```

**期待される出力:**
```json
{
  "status": "success",
  "message": "PostgreSQL connection successful",
  "data": {
    "version": "PostgreSQL 16.0 (Debian 16.0-1.pgdg120+1) on x86_64-pc-linux-gnu...",
    "current_time": "2025-11-22T10:30:00.123456"
  }
}
```

### 4. JWT認証のテスト

#### ユーザー登録（POST /auth/register）

```bash
curl -X POST "http://localhost:5001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepass123"
  }'
```

**期待される出力:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "is_active": true
  }
}
```

#### ログイン（POST /auth/token）

```bash
curl -X POST "http://localhost:5001/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**期待される出力:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

#### 認証済みユーザー情報取得（GET /auth/me）

```bash
# まずトークンを取得
TOKEN=$(curl -s -X POST "http://localhost:5001/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.access_token')

# トークンを使用してユーザー情報を取得
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/auth/me
```

**期待される出力:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2025-11-22T10:00:00.000000"
}
```

### 5. アイテムAPI（認証不要）

#### アイテム作成（POST /api/items）

```bash
curl -X POST "http://localhost:5001/api/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Product",
    "description": "This is a sample product",
    "price": 99.99,
    "owner_id": 1
  }'
```

**期待される出力:**
```json
{
  "message": "Item created successfully",
  "item": {
    "id": 1,
    "title": "Sample Product",
    "description": "This is a sample product",
    "price": 99.99,
    "owner_id": 1,
    "created_at": "2025-11-22T10:40:00.000000"
  }
}
```

#### アイテム一覧取得（GET /api/items）

```bash
curl http://localhost:5001/api/items
```

**期待される出力:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample Product",
      "description": "This is a sample product",
      "price": 99.99,
      "owner_id": 1,
      "created_at": "2025-11-22T10:40:00.000000"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}
```

## 🗄️ データベース操作

### PostgreSQLに直接接続

#### Dev Container内から接続

```bash
# psqlで接続
psql -h db -U postgres -d flask_app

# パスワード: postgres
```

#### ホストマシンから接続

```bash
# ポート5433を使用
psql -h localhost -p 5433 -U postgres -d flask_app
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

## 🌐 CORS設定（フロントエンド連携）

React Vite フロントエンドとの連携用にCORSが設定済みです。

**デフォルト設定（開発環境）:**
```python
# app.py
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "supports_credentials": True
    }
})
```

**本番環境では制限することを推奨:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-domain.com"],
        "supports_credentials": True
    }
})
```

### フロントエンド連携の仕組み

React フロントエンド（[client/src/api.ts](client/src/api.ts)）は以下の方法でバックエンドと通信します:

1. **Vite プロキシ設定**: `/api/*` と `/auth/*` リクエストを `http://localhost:5001` にプロキシ
2. **JWT トークン管理**: localStorage にトークンを保存し、自動的にリクエストヘッダーに付与
3. **認証ガード**: トークンがない場合はログイン画面にリダイレクト

```typescript
// client/src/api.ts の実装例
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    removeToken();
    throw new Error('Authentication failed. Please login again.');
  }

  return response;
}
```

## 📝 環境変数

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

主要な環境変数:

```bash
# Flask設定
FLASK_ENV=development
SECRET_KEY=dev_secret_key_change_in_production
JWT_SECRET_KEY=jwt_secret_key_change_in_production

# データベース設定（コンテナ間通信）
DATABASE_URL=postgresql://postgres:postgres@db:5432/flask_app
```

**ポート番号について:**
- **コンテナ内部（db:5432）**: アプリケーションコンテナからPostgreSQLコンテナへの接続
- **ホストマシン（localhost:5433）**: ホストマシン上のツール（TablePlusなど）から接続する場合

## 🏭 本番環境ビルド

### ローカルでテスト

```bash
# 本番用イメージをビルド
docker build --target production -t flask-app:latest .

# 本番環境構成で起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 動作確認
curl http://localhost:5001/health

# ログ確認
docker compose logs app -f

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🐛 トラブルシューティング

### Dev Container ビルドエラー「curl: not found」

**症状:** Dev Container のビルド中に以下のエラーが発生:
```
> [app development 3/9] RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
0.159 /bin/sh: 1: curl: not found
```

**原因:** Dockerfile 内で、`curl` コマンドがインストールされる前に Node.js のインストールに使用しようとしている

**解決方法:**

[Dockerfile](Dockerfile:12-23) の RUN コマンドの順序が正しいことを確認してください:

```dockerfile
# ✅ 正しい順序: 先に curl をインストール
RUN apt-get update && apt-get install -y \
    git vim curl postgresql-client gcc \
    && rm -rf /var/lib/apt/lists/*

# その後 curl を使用して Node.js をインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs
```

修正後、コンテナを再ビルド:
- **F1** → `Dev Containers: Rebuild Container`

### 「Internal Server Error」が発生

**原因:** データベーステーブルが作成されていない

**解決方法:**
```bash
python init_db.py
```

### コンテナが起動しない

```bash
# Docker Desktopが起動しているか確認
docker ps

# ログを確認
docker compose logs app

# コンテナを再構築
# F1 → "Dev Containers: Rebuild Container"
```

### ポートがすでに使用されている

```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :5001

# Windows
netstat -ano | findstr :5001

# devcontainer.jsonのforwardPortsを変更
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker compose ps db

# DATABASE_URLが正しいか確認（db:5432 を使用）
python -c "from app import app; print(app.config['SQLALCHEMY_DATABASE_URI'])"

# データベースコンテナを再起動
docker compose restart db
```

### JWT認証エラー

```bash
# トークンの有効期限切れ
# → 再度ログインしてトークンを取得

# SECRET_KEYが設定されていない
# → .env ファイルを作成して SECRET_KEY と JWT_SECRET_KEY を設定
```

## 📚 Flask vs FastAPI の比較

このリポジトリにはFlaskとFastAPIの両方のサンプルが含まれています。

### Flask（このサンプル）の利点

- **シンプル**: 学習曲線が緩やか
- **柔軟**: 必要な機能だけを追加できる
- **成熟**: 長年の実績と豊富なドキュメント
- **同期処理**: 理解しやすいコードパターン
- **大規模エコシステム**: 多数のプラグインと拡張機能

### FastAPIの利点

- **高速**: 非同期処理でパフォーマンスが高い（3-4倍）
- **自動ドキュメント**: Swagger UI / ReDocが自動生成される
- **型安全**: Pydanticによる自動バリデーション
- **モダン**: 最新のPython機能を活用（async/await, type hints）
- **API開発特化**: RESTful API開発に最適化

### 選択の指針

**Flaskを選ぶべき場合:**
- 初めてWebフレームワークを学ぶ
- 小規模なプロジェクトや内部ツール
- 段階的に機能を追加したい
- 同期処理で十分な場合

**FastAPIを選ぶべき場合:**
- 本番環境のREST API開発
- 高パフォーマンスが必要
- 自動ドキュメントが欲しい
- 非同期処理を活用したい

詳細な比較は [メインREADME](../../README.md#pythonフレームワーク選択flask-vs-fastapi2025年版) を参照してください。

## 📚 参考リンク

- [メインREADME](../../README.md) - VSCode + Docker開発環境の包括的ガイド
- [Flask公式ドキュメント](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy ドキュメント](https://docs.sqlalchemy.org/)
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [React公式ドキュメント](https://react.dev/)
- [Vite公式ドキュメント](https://vitejs.dev/)
