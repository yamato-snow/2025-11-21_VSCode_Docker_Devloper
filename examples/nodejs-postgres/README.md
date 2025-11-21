# Node.js + PostgreSQL + Redis Dev Container Example

このディレクトリには、VSCode Dev Containersで動作するNode.js + PostgreSQL + Redisのフルスタック開発環境サンプルが含まれています。

## 📁 構成

```
nodejs-postgres/
├── .devcontainer/          # Dev Container設定
│   ├── devcontainer.json   # VSCode Dev Container設定
│   └── docker-compose.yml  # 開発環境用Docker Compose
├── src/                    # ソースコード
│   └── index.ts            # Expressアプリケーション
├── Dockerfile              # Multi-stage Dockerfile
├── docker-compose.yml      # 本番環境用Docker Compose
├── docker-compose.prod.yml # 本番環境オーバーライド
├── package.json            # Node.js依存関係
├── tsconfig.json           # TypeScript設定
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

### 3. 開発サーバー起動

コンテナ内のターミナルで:

```bash
npm run dev
```

### 4. 動作確認

ブラウザまたはcurlで以下のエンドポイントにアクセス:

```bash
# ウェルカムメッセージ
curl http://localhost:3000

# ヘルスチェック
curl http://localhost:3000/health

# PostgreSQL接続テスト
curl http://localhost:3000/db

# Redis接続テスト
curl http://localhost:3000/redis
```

## 📋 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | TypeScriptビルド（dist/に出力） |
| `npm start` | ビルド済みアプリを起動 |

## 🔌 サービス構成

### アプリケーション (app)
- **ポート**: 3000 (HTTP), 9229 (デバッグ)
- **フレームワーク**: Express + TypeScript
- **ホットリロード**: nodemon + ts-node

### PostgreSQL (db)
- **ポート**: 5433
- **ユーザー**: postgres
- **パスワード**: postgres
- **データベース**: myapp

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

- ESLint
- Prettier
- Docker
- SQLTools (PostgreSQL接続)
- TypeScript

## 🔧 データベース接続

### PostgreSQL (SQLTools)

VSCodeのSQLToolsアイコンをクリック → "PostgreSQL Local" → テーブル一覧が表示

### PostgreSQL (psql)

```bash
# コンテナ内から
psql -h db -U postgres -d myapp

# またはdocker compose経由
docker compose exec db psql -U postgres
```

### Redis (redis-cli)

```bash
# Redisコンテナに接続
docker compose exec redis redis-cli

# 接続テスト
127.0.0.1:6379> PING
PONG
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
DATABASE_URL=postgresql://postgres:postgres@db:5433/myapp
REDIS_URL=redis://redis:6379
LOG_LEVEL=debug
```

## 🐛 トラブルシューティング

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
```

## 📚 参考リンク

- [メインREADME](../../README.md) - VSCode + Docker開発環境の包括的ガイド
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker公式ドキュメント](https://docs.docker.com/)
