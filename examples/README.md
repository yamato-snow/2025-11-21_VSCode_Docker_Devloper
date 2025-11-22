# サンプルコード集

このディレクトリには、VSCode Dev Containersを使用した開発環境の実践的なサンプルコードが含まれています。

## 📁 ディレクトリ構成

```
examples/
├── nodejs-postgres/      # Node.js (Express + React) + DB（フルスタック開発用 + JWT認証）
│   ├── .devcontainer/    # フロントエンド: React 19 + Vite 6 + JWT認証UI
│   │   ├── devcontainer.json  # バックエンド: Express + PostgreSQL + Redis
│   │   └── docker-compose.yml
│   ├── client/           # Reactフロントエンド（JWT認証付き）
│   ├── Dockerfile
│   ├── package.json
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── .env.example
│
├── python-flask/         # Python Flask + React（フルスタック開発用 - 学習向け）
│   ├── .devcontainer/    # フロントエンド: React 19 + Vite 6 + JWT認証UI
│   │   ├── devcontainer.json  # バックエンド: Flask + PostgreSQL
│   │   └── docker-compose.yml
│   ├── client/           # Reactフロントエンド（JWT認証付き）
│   ├── Dockerfile
│   ├── package.json
│   ├── app.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env.example
│
└── python-fastapi/       # Python FastAPI + React（フルスタック開発用 - 2025年推奨）
    ├── .devcontainer/    # フロントエンド: React 19 + Vite 6 + JWT認証UI
    │   ├── devcontainer.json  # バックエンド: FastAPI + PostgreSQL + Redis
    │   └── docker-compose.yml
    ├── client/           # Reactフロントエンド（JWT認証付き）
    ├── Dockerfile
    ├── package.json
    ├── main.py
    ├── requirements.txt
    ├── requirements-dev.txt
    └── .env.example
```

---

## 🚀 使用方法

### Node.js (Express + React) フルスタックプロジェクト

**このサンプルは:**
- **Express + React 19 フルスタック開発用**
- **フロントエンド**: React 19 + Vite 6 + Tailwind CSS + JWT認証UI
- **バックエンド**: Express + TypeScript + PostgreSQL + Redis
- フルスタック構成（フロントエンド + バックエンドAPI + データベース + キャッシュ）
- JWT認証が完全統合（ログイン/新規登録UI付き）
- PostgreSQL（データベース）とRedis（キャッシュ）を含む

#### 1. プロジェクトのコピー

```bash
# サンプルを自分のプロジェクトにコピー
cp -r examples/nodejs-postgres/* /path/to/your/project/
```

#### 2. サンプルコードの特徴

このプロジェクトは**完全統合されたフルスタック環境**です：

**フロントエンド（React）:**
- **React 19 + Vite 6 + TypeScript** による最新スタック
- **Tailwind CSS** でスタイリング
- **JWT認証UI** - ログイン/新規登録フォーム完備
- **認証ガード** - トークンベースのルーティング保護
- ユーザー情報表示、アイテム管理UI

**バックエンド（Express）:**
- **JWT認証の完全実装**
  - デフォルトユーザー: `testuser` / `password123`
  - `/auth/register` エンドポイントで新規登録
  - `/auth/token` エンドポイントでログイン
  - `/auth/me` で認証情報取得
  - Bearer トークン認証

- **CORS設定済み**（React Vite フロントエンド連携対応）
  - `localhost:5173`（Vite）からのアクセス許可済み

- **TypeScript による型安全性**
  - 開発体験の向上とバグ削減

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. ターミナルで開発サーバー起動:
   ```bash
   npm run dev
   ```

#### 4. 動作確認

**フロントエンド（React UI）:**
- **React アプリケーション**: http://localhost:5173
  - ログイン/新規登録UI
  - ユーザー情報タブ
  - アイテム管理タブ
  - デフォルトユーザー: `testuser` / `password123`

**バックエンド（Express）:**
- **APIサーバー**: http://localhost:3000
- **ヘルスチェック**: http://localhost:3000/health
- **データベーステスト**: http://localhost:3000/db
- **Redisテスト**: http://localhost:3000/redis

**データベース:**
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6379`

#### 5. React UIでのログイン手順

1. ブラウザで http://localhost:5173 を開く
2. 「ログイン」タブを選択（デフォルト）
3. デフォルトユーザーでログイン:
   - **username**: `testuser`
   - **password**: `password123`
4. ログイン成功後、以下の機能が利用可能:
   - **ユーザー情報タブ**: 現在のユーザー情報を表示
   - **アイテム管理タブ**: アイテムの作成・一覧表示
   - **ログアウト**: 右上のボタンでログアウト

#### 6. フロントエンド・バックエンド統合の仕組み

**アーキテクチャ:**
```
React (localhost:5173)
  ↓ JWT トークン (localStorage)
  ↓
Express (localhost:3000)
  ↓ Bearer トークン認証
  ↓
PostgreSQL (localhost:5433)
Redis (localhost:6379)
```

**認証フロー:**
1. ユーザーがReact UIでログイン
2. Express `/auth/token` エンドポイントにPOST
3. JWTトークンを取得し localStorage に保存
4. 以降のAPI呼び出しで自動的に `Authorization: Bearer <token>` ヘッダーを付与
5. トークンが無効（401）の場合、自動的にログイン画面にリダイレクト

---

### Python Flask + React フルスタックプロジェクト（学習向け）

**このサンプルは:**
- **Flask + React 19 フルスタック開発用**（**学習に最適**）
- シンプルで理解しやすいフレームワーク
- **フロントエンド**: React 19 + Vite 6 + Tailwind CSS + JWT認証UI
- **バックエンド**: Flask + PostgreSQL
- JWT認証が完全統合（ログイン/新規登録UI付き）
- 段階的に学習できる構成

#### 1. プロジェクトのコピー

```bash
cp -r examples/python-flask/* /path/to/your/project/
```

#### 2. サンプルコードの特徴

このプロジェクトは**完全統合されたフルスタック環境**です：

**フロントエンド（React）:**
- **React 19 + Vite 6 + TypeScript** による最新スタック
- **Tailwind CSS** でスタイリング
- **JWT認証UI** - ログイン/新規登録フォーム完備
- **認証ガード** - トークンベースのルーティング保護
- ユーザー情報表示、アイテム管理UI

**バックエンド（Flask）:**
- **シンプルな構成** - 学習に最適な最小限の実装
- **JWT認証の完全実装**
  - デフォルトユーザー: `testuser` / `password123`
  - `/auth/register` エンドポイントで新規登録
  - `/auth/token` エンドポイントでログイン
  - `/auth/me` で認証情報取得
  - Bearer トークン認証

- **CORS設定済み**（React Vite フロントエンド連携対応）
  - `localhost:5173`（Vite）からのアクセス許可済み

- **Flask-SQLAlchemy によるORM**
  - シンプルで理解しやすいコードパターン

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. **データベース初期化（初回のみ必須）**:
   ```bash
   python init_db.py
   ```
5. バックエンドは自動起動、フロントエンドは別ターミナルで起動:
   ```bash
   npm run dev
   ```

#### 4. 動作確認

**フロントエンド（React UI）:**
- **React アプリケーション**: http://localhost:5173
  - ログイン/新規登録UI
  - ユーザー情報タブ
  - アイテム管理タブ
  - デフォルトユーザー: `testuser` / `password123`

**バックエンド（Flask）:**
- **APIサーバー**: http://localhost:5001
- **ヘルスチェック**: http://localhost:5001/health
- **データベーステスト**: http://localhost:5001/api/db-test

**データベース:**
- **PostgreSQL**: `localhost:5433`

#### 5. React UIでのログイン手順

1. ブラウザで http://localhost:5173 を開く
2. 「ログイン」タブを選択（デフォルト）
3. デフォルトユーザーでログイン:
   - **username**: `testuser`
   - **password**: `password123`
4. ログイン成功後、以下の機能が利用可能:
   - **ユーザー情報タブ**: 現在のユーザー情報を表示
   - **アイテム管理タブ**: アイテムの作成・一覧表示
   - **ログアウト**: 右上のボタンでログアウト

#### 6. フロントエンド・バックエンド統合の仕組み

**アーキテクチャ:**
```
React (localhost:5173)
  ↓ Vite プロキシ (/api, /auth → localhost:5001)
  ↓ JWT トークン (localStorage)
  ↓
Flask (localhost:5001)
  ↓ Bearer トークン認証
  ↓
PostgreSQL (localhost:5433)
```

**認証フロー:**
1. ユーザーがReact UIでログイン
2. Flask `/auth/token` エンドポイントにPOST
3. JWTトークンを取得し localStorage に保存
4. 以降のAPI呼び出しで自動的に `Authorization: Bearer <token>` ヘッダーを付与
5. トークンが無効（401）の場合、自動的にログイン画面にリダイレクト

---

### Python FastAPI + React フルスタックプロジェクト（2025年推奨）

**このサンプルは:**
- **FastAPI + React 19 フルスタック開発用**（**2025年推奨**）
- モダンで高パフォーマンスなフレームワーク
- **フロントエンド**: React 19 + Vite 6 + Tailwind CSS + JWT認証UI
- **バックエンド**: FastAPI + PostgreSQL + Redis
- 自動APIドキュメント生成（Swagger UI）
- JWT認証が完全統合（ログイン/新規登録UI付き）

#### 1. プロジェクトのコピー

```bash
cp -r examples/python-fastapi/* /path/to/your/project/
```

#### 2. サンプルコードの特徴

このプロジェクトは**完全統合されたフルスタック環境**です：

**フロントエンド（React）:**
- **React 19 + Vite 6 + TypeScript** による最新スタック
- **Tailwind CSS** でスタイリング
- **JWT認証UI** - ログイン/新規登録フォーム完備
- **認証ガード** - トークンベースのルーティング保護
- ユーザー情報表示、アイテム管理UI

**バックエンド（FastAPI）:**
- **自動APIドキュメント生成**
  - Swagger UI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

- **JWT認証の完全実装**
  - デフォルトユーザー: `testuser` / `password123`
  - `/token` エンドポイントでログイン
  - `/users/me` で認証情報取得
  - Bearer トークン認証

- **CORS設定済み**（React Vite フロントエンド連携対応）
  - `localhost:5173`（Vite）、`localhost:3000`、`localhost:3001` からのアクセス許可済み

- **Pydantic V2 によるバリデーション**
  - 型安全なAPIリクエスト・レスポンス

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. **データベース初期化（初回のみ必須）**:
   ```bash
   python init_db.py
   ```
5. バックエンドは自動起動、フロントエンドは別ターミナルで起動:
   ```bash
   npm run dev
   ```

#### 4. 動作確認

**フロントエンド（React UI）:**
- **React アプリケーション**: http://localhost:5173
  - ログイン/新規登録UI
  - ユーザー情報タブ
  - アイテム管理タブ
  - デフォルトユーザー: `testuser` / `password123`

**バックエンド（FastAPI）:**
- **APIサーバー**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs （インタラクティブなAPI テスト）
- **ReDoc**: http://localhost:8000/redoc （きれいなAPIドキュメント）
- **ヘルスチェック**: http://localhost:8000/health

**データベース:**
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6379`

#### 5. React UIでのログイン手順

1. ブラウザで http://localhost:5173 を開く
2. 「ログイン」タブを選択（デフォルト）
3. デフォルトユーザーでログイン:
   - **username**: `testuser`
   - **password**: `password123`
4. ログイン成功後、以下の機能が利用可能:
   - **ユーザー情報タブ**: 現在のユーザー情報を表示
   - **アイテム管理タブ**: アイテムの作成・一覧表示
   - **ログアウト**: 右上のボタンでログアウト

#### 6. APIの試し方（Swagger UIで）

1. http://localhost:8000/docs にアクセス
2. **POST /token** を展開
3. 「Try it out」をクリック
4. `username: testuser`、`password: password123` を入力
5. 「Execute」をクリック → JWTトークンを取得
6. ページ上部の「Authorize」ボタンをクリック
7. トークンを貼り付けて「Authorize」
8. これで認証が必要な他のAPIもテスト可能！

#### 7. フロントエンド・バックエンド統合の仕組み

**アーキテクチャ:**
```
React (localhost:5173)
  ↓ Vite プロキシ (/api → localhost:8000)
  ↓ JWT トークン (localStorage)
  ↓
FastAPI (localhost:8000)
  ↓ Bearer トークン認証
  ↓
PostgreSQL (localhost:5433)
Redis (localhost:6379)
```

**認証フロー:**
1. ユーザーがReact UIでログイン
2. FastAPI `/token` エンドポイントにPOST
3. JWTトークンを取得し localStorage に保存
4. 以降のAPI呼び出しで自動的に `Authorization: Bearer <token>` ヘッダーを付与
5. トークンが無効（401）の場合、自動的にログイン画面にリダイレクト

---

## 🔐 全プロジェクト共通のJWT認証パターン

3つのサンプルプロジェクト（Node.js, Flask, FastAPI）は全て同じJWT認証パターンを実装しています：

### 共通の認証フロー

1. **ユーザー登録** → `/auth/register` (Node.js, Flask) / 実装は別途 (FastAPI)
2. **ログイン** → `/auth/token` (Node.js, Flask) / `/token` (FastAPI)
3. **トークン取得** → JWTトークンをレスポンスで受け取り
4. **トークン保存** → localStorage に保存（React UI）
5. **認証API呼び出し** → `Authorization: Bearer <token>` ヘッダー付与
6. **トークン検証** → サーバー側で署名検証
7. **401エラー** → 自動的にログイン画面にリダイレクト

### 共通のデフォルトユーザー

全てのサンプルで以下のテストユーザーが利用可能：
- **username**: `testuser`
- **password**: `password123`

### React UIの共通機能

全プロジェクトで以下のReact UIコンポーネントを実装：
- **Login.tsx**: ログイン/新規登録フォーム（タブ切り替え）
- **UserList.tsx**: ユーザー情報表示
- **ItemList.tsx**: アイテム管理（CRUD操作）
- **api.ts**: JWT トークン管理、API クライアント

### 言語・フレームワーク別の違い

| 項目 | Node.js (Express) | Flask | FastAPI |
|------|-------------------|-------|---------|
| **JWTライブラリ** | jsonwebtoken | PyJWT | python-jose |
| **パスワードハッシュ** | bcrypt | Flask-Bcrypt | passlib |
| **認証エンドポイント** | `/auth/token` | `/auth/token` | `/token` |
| **トークン形式** | JWT HS256 | JWT HS256 | JWT HS256 |
| **有効期限** | 60分 | 60分 | 60分 |
| **自動ドキュメント** | ❌ | ❌ | ✅ Swagger UI |

---

## 🆚 Flask vs FastAPI: どちらを選ぶ？

### 簡易比較表

| 観点 | Flask | FastAPI |
|------|-------|---------|
| **学習曲線** | 緩やか | 中程度 |
| **パフォーマンス** | 標準 | 高速（3〜4倍） |
| **自動ドキュメント** | ❌ | ✅ Swagger UI + ReDoc |
| **型安全性** | ❌ | ✅ Pydantic |
| **非同期サポート** | 限定的 | ネイティブ |
| **2025年求人増加率** | 安定 | 150%増 |
| **適したユースケース** | シンプルなAPI、学習 | 本格的なAPI、AI/ML |

### 選択ガイドライン

**Flaskを選ぶべき場合:**
- 初めてのWebフレームワーク学習
- 数個のシンプルなAPIエンドポイントのみ
- プロトタイプや内部ツール
- 既存のFlaskエコシステムを活用したい

**FastAPIを選ぶべき場合（推奨）:**
- 本格的なバックエンドAPI開発
- Next.jsなどのフロントエンドと連携
- 型安全性を重視
- 自動ドキュメント生成が必要
- AI/ML統合を予定
- **キャリアアップを目指す3年目エンジニア**

**詳細な比較は[メイン記事の比較セクション](../README.md#pythonフレームワーク選択flask-vs-fastapi2025年版)を参照してください。**

---

## 🔧 カスタマイズポイント

### 1. ポート番号の変更

`.devcontainer/devcontainer.json` の `forwardPorts` を編集：

```json
"forwardPorts": [3000, 5433, 6379],
```

### 2. VSCode拡張機能の追加

`.devcontainer/devcontainer.json` の `extensions` 配列に追加：

```json
"extensions": [
  "dbaeumer.vscode-eslint",
  "your-extension-id"
]
```

拡張機能IDは、VSCodeの拡張機能パネルで右クリック → 「拡張機能IDをコピー」で取得できます。

### 3. データベース設定の変更

`.devcontainer/docker-compose.yml` の環境変数を編集：

```yaml
environment:
  POSTGRES_USER: your_user
  POSTGRES_PASSWORD: your_password
  POSTGRES_DB: your_database
```

### 4. 追加サービスの導入

**例: MongoDBを追加**

`.devcontainer/docker-compose.yml` に以下を追加：

```yaml
services:
  # ... 既存のサービス

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db

volumes:
  # ... 既存のボリューム
  mongo_data:
```

---

## 🎯 本番環境へのデプロイ

### Node.js (Express + React) フルスタックプロジェクトの場合

```bash
# 1. 本番用イメージのビルド
docker build --target production -t myapp:latest .

# 2. 本番環境でのテスト起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. 動作確認
curl http://localhost/health

# 4. 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Python Flask バックエンドAPIプロジェクトの場合

```bash
# 1. 本番用イメージのビルド
docker build --target production -t flask-app:latest .

# 2. 本番起動（Gunicorn使用）
docker run -d -p 5001:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5433/db \
  flask-app:latest
```

### Python FastAPI バックエンドAPIプロジェクトの場合

```bash
# 1. 本番用イメージのビルド
docker build --target production -t fastapi-app:latest .

# 2. 本番環境でのテスト起動
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5433/db \
  -e REDIS_URL=redis://redis:6379 \
  -e SECRET_KEY=your_production_secret \
  fastapi-app:latest

# 3. 動作確認
curl http://localhost:8000/health

# 4. Swagger UI確認（本番では無効化推奨）
curl http://localhost:8000/docs
```

---

## 📚 トラブルシューティング

### コンテナが起動しない

```bash
# Dockerの状態確認
docker ps -a

# ログ確認
docker compose logs app

# コンテナ再構築
# VSCodeで: F1 → "Dev Containers: Rebuild Container"
```

### ポートがすでに使用されている

```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :3000

# ポート使用状況確認（Windows）
netstat -ano | findstr :3000
```

### データベース接続エラー

```bash
# データベースコンテナの確認
docker compose ps db

# データベースへの接続テスト
docker compose exec db psql -U postgres
```

---

## 🔗 関連リンク

- [メイン記事に戻る](../README.md)
- [VSCode Dev Containers 公式ドキュメント](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Dev Container Features](https://containers.dev/features)

---

**更新日**: 2025-11-21
