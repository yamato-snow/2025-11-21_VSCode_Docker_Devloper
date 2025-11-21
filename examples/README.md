# サンプルコード集

このディレクトリには、VSCode Dev Containersを使用した開発環境の実践的なサンプルコードが含まれています。

## 📁 ディレクトリ構成

```
examples/
├── nodejs-postgres/      # Node.js (Next.js) + DB（フルスタック開発用）
│   ├── .devcontainer/    # フロントエンド: Next.js
│   │   ├── devcontainer.json  # バックエンド: PostgreSQL, Redis
│   │   └── docker-compose.yml
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── .env.example
│
├── python-flask/         # Python Flask API（バックエンド開発用）
│   ├── .devcontainer/    # データベース: PostgreSQL
│   │   ├── devcontainer.json
│   │   └── docker-compose.yml
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-dev.txt
│
└── python-fastapi/       # Python FastAPI API（バックエンド開発用 - 2025年推奨）
    ├── .devcontainer/    # データベース: PostgreSQL, Redis
    │   ├── devcontainer.json
    │   └── docker-compose.yml
    ├── Dockerfile
    ├── main.py
    ├── requirements.txt
    ├── requirements-dev.txt
    └── .env.example
```

---

## 🚀 使用方法

### Node.js (Next.js) フルスタックプロジェクト

**このサンプルは:**
- Next.jsなどのNode.jsフロントエンド開発用
- フルスタック構成（フロントエンド + データベース + キャッシュ）
- PostgreSQL（データベース）とRedis（キャッシュ）を含む

#### 1. プロジェクトのコピー

```bash
# サンプルを自分のプロジェクトにコピー
cp -r examples/nodejs-postgres/* /path/to/your/project/
```

#### 2. 必要なファイルの準備

プロジェクトルートに以下のファイルが必要です：
- `package.json`: Node.jsの依存関係
- `tsconfig.json`: TypeScript設定（TypeScript使用時）
- `src/`: ソースコードディレクトリ

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. ターミナルで開発サーバー起動:
   ```bash
   npm run dev
   ```

#### 4. 動作確認

- アプリケーション: http://localhost:3000
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

### Python Flask バックエンドAPIプロジェクト

**このサンプルは:**
- Python FlaskでのバックエンドAPI開発用
- シンプルで学習しやすいフレームワーク
- PostgreSQL（データベース）を含む

#### 1. プロジェクトのコピー

```bash
cp -r examples/python-flask/* /path/to/your/project/
```

#### 2. 必要なファイルの準備

プロジェクトルートに以下のファイルが必要です：
- `app.py`: Flaskアプリケーションのエントリーポイント

**最小限の `app.py` サンプル:**

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, Dev Container!'

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ
4. 自動的にFlask開発サーバーが起動

#### 4. 動作確認

- アプリケーション: http://localhost:5000
- PostgreSQL: `localhost:5432`

---

### Python FastAPI バックエンドAPIプロジェクト（2025年推奨）

**このサンプルは:**
- Python FastAPIでのバックエンドAPI開発用（**2025年推奨**）
- モダンで高パフォーマンスなフレームワーク
- PostgreSQL（データベース）とRedis（キャッシュ）を含む
- 自動APIドキュメント生成（Swagger UI）
- Next.jsフロントエンドとの連携を想定

#### 1. プロジェクトのコピー

```bash
cp -r examples/python-fastapi/* /path/to/your/project/
```

#### 2. サンプルコードの特徴

`main.py` には、すぐに使えるAPIサンプルが含まれています：

- **自動APIドキュメント生成**
  - Swagger UI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

- **JWT認証のサンプル実装**
  - デフォルトユーザー: `testuser` / `password123`
  - `/token` エンドポイントでログイン
  - `/users/me` で認証情報取得

- **CORS設定済み**（Next.jsフロントエンド連携対応）
  - `localhost:3000`、`localhost:3001` からのアクセス許可済み

- **Pydantic V2 によるバリデーション**
  - 型安全なAPIリクエスト・レスポンス

#### 3. Dev Containerで起動

1. VSCodeでプロジェクトフォルダを開く
2. `F1` → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. 自動的にFastAPI開発サーバーが起動

#### 4. 動作確認

- **アプリケーション**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs （インタラクティブなAPI テスト）
- **ReDoc**: http://localhost:8000/redoc （きれいなAPIドキュメント）
- **ヘルスチェック**: http://localhost:8000/health
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

#### 5. APIの試し方（Swagger UIで）

1. http://localhost:8000/docs にアクセス
2. **POST /token** を展開
3. 「Try it out」をクリック
4. `username: testuser`、`password: password123` を入力
5. 「Execute」をクリック → JWTトークンを取得
6. ページ上部の「Authorize」ボタンをクリック
7. トークンを貼り付けて「Authorize」
8. これで認証が必要な他のAPIもテスト可能！

#### 6. Next.jsフロントエンドとの連携

FastAPIサンプルはNode.js（Next.js）フロントエンドとの連携を想定しています。

**並行起動方法:**

```bash
# ターミナル1: FastAPIバックエンド
cd examples/python-fastapi
# VSCodeで "Reopen in Container"

# ターミナル2: Next.jsフロントエンド
cd examples/nodejs-postgres
# VSCodeで別ウィンドウで "Reopen in Container"
```

**APIクライアント例（Next.js側）:**

```typescript
// lib/api.ts
const response = await fetch('http://localhost:8000/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include',
});
```

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
"forwardPorts": [3000, 5432, 6379],
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

### Node.js (Next.js) フルスタックプロジェクトの場合

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
docker run -d -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  flask-app:latest
```

### Python FastAPI バックエンドAPIプロジェクトの場合

```bash
# 1. 本番用イメージのビルド
docker build --target production -t fastapi-app:latest .

# 2. 本番環境でのテスト起動
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
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
