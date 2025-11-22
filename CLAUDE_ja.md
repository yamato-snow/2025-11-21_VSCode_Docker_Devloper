# CLAUDE.md (日本語版)

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

このリポジトリは、VSCode + Docker開発ワークフローを実践的に学ぶための教育用リポジトリです。以下を含みます：
- VSCode Dev ContainersとDocker拡張機能の包括的な日本語ガイド（README.md）
- 異なる技術スタックを示す3つの本番環境対応のサンプルプロジェクト
- 各スタック用の完全なdevcontainer設定

**リポジトリ構成:**
```
examples/
├── nodejs-postgres/     # Node.js (Express) + PostgreSQL + Redis（フルスタックJavaScript）
├── python-flask/        # Flask + PostgreSQL（バックエンドAPI、学習向け）
└── python-fastapi/      # FastAPI + PostgreSQL + Redis（バックエンドAPI、2025年推奨）
```

**3つのサンプルすべてに含まれる内容:**
- 本物のPostgreSQLデータベース統合（モックではない）
- データベースモデルを使った完全なCRUD操作
- テストデータを含む初期化スクリプト
- テスト手順を含む包括的なREADME
- Dev Container設定

## 開発コマンド

### Dev Containersの使い方

すべてのサンプルプロジェクトはDev Containersを使用します。共通のワークフロー：

```bash
# 1. VSCodeでサンプルディレクトリを開く
# 2. F1 → "Dev Containers: Reopen in Container"
# 3. 初回ビルドを待つ（初回は5〜10分）
```

### Node.js (Next.js) サンプル

**場所:** `examples/nodejs-postgres/`

**サービス:** app (ポート3000), PostgreSQL (ポート5433), Redis (ポート6379)

```bash
# 開発
npm run dev              # 開発サーバー起動
npm run db:setup         # データベース初期セットアップ
npm run db:migrate       # マイグレーション実行

# 本番ビルドのテスト
docker build --target production -t myapp:latest .
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**主要な設定:**
- devcontainer.json: `.devcontainer/`内のdocker-compose.ymlを使用
- Multi-stageビルドで`development`と`production`ターゲットを分離
- postCreateCommand: `npm install && npm run db:setup`
- postStartCommand: `npm run db:migrate`

### Python Flask サンプル

**場所:** `examples/python-flask/`

**サービス:** api (ポート5000), PostgreSQL (ポート5433)

```bash
# データベース初期化（初回実行時必須）
python init_db.py

# 開発（devcontainerで自動起動）
python app.py
# または
flask run --host=0.0.0.0 --port=5000

# 本番ビルドのテスト
docker build --target production -t flask-app:latest .
```

**主要な設定:**
- PostgreSQL統合（Flask-SQLAlchemy）
- リレーションシップを持つUserとItemモデル
- RESTful APIエンドポイント（GET, POST, PUT, DELETE）
- Flask-Bcryptによるパスワードハッシュ化
- フロントエンド統合用にCORS有効化
- ページネーション対応
- Python 3.11-slimベースイメージ
- Blackフォーマッター、Pylintが有効

**データベース統合:**
- Flask-SQLAlchemyを使った本物のPostgreSQLデータベース
- データベースモデル: User, Itemテーブル（`app.py`内で定義）
- 初期化スクリプト: `init_db.py`（テーブル作成とテストユーザー作成）
- デフォルト認証情報: username=testuser, password=password123

**APIエンドポイント:**
```bash
# ヘルスチェック
curl http://localhost:5000/health

# データベース接続テスト
curl http://localhost:5000/api/db-test

# Users API
curl http://localhost:5000/api/users
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@example.com","password":"pass123"}'

# Items API
curl http://localhost:5000/api/items
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"Item 1","description":"Description","price":99.99,"owner_id":1}'
```

### Python FastAPI サンプル（2025年推奨）

**場所:** `examples/python-fastapi/`

**サービス:** api (ポート8000), PostgreSQL (ポート5433), Redis (ポート6379)

```bash
# 開発（devcontainerで自動起動）
fastapi dev main.py --host 0.0.0.0 --port 8000

# 別の方法: uvicornコマンド（こちらも動作します）
# uvicorn main:app --reload --host 0.0.0.0 --port 8000

# APIドキュメント
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc

# デフォルトのテスト認証情報
# username: testuser
# password: password123

# 本番ビルドのテスト
docker build --target production -t fastapi-app:latest .
```

**主要な設定:**
- Pylintの代わりにRuff（2025年推奨linter）を使用
- Next.js連携用のCORS設定済み（ポート3000, 3001）
- JWT認証のサンプル実装
- リクエスト/レスポンス検証にPydantic V2を使用

**データベース統合:**
- SQLAlchemy 2.0 + asyncpgによる実PostgreSQLデータベース
- データベースモデル: `models.py` (User、Itemテーブル)
- CRUD操作: `crud.py` (非同期データベース操作)
- データベース設定: `database.py` (接続プーリング、セッション管理)
- 初期化スクリプト: `init_db.py` (テーブル作成とテストデータ投入)

**データベース初期化:**
```bash
# コンテナ初回起動後に1回実行
python init_db.py
```

これにより以下が作成されます：
- `users` テーブル (id, email, username, hashed_password, is_active, タイムスタンプ)
- `items` テーブル (id, title, description, price, owner_id, タイムスタンプ)
- テストユーザー (username: testuser, password: password123)

**ファイル構成:**
```
examples/python-fastapi/
├── main.py           # FastAPIアプリケーション（エンドポイント）
├── database.py       # SQLAlchemy非同期エンジンとセッション
├── models.py         # データベーステーブル定義（ORM）
├── crud.py           # データベースCRUD操作
├── init_db.py        # データベース初期化スクリプト
├── requirements.txt  # 本番用依存関係
└── .devcontainer/    # Dev Container設定
```

## アーキテクチャパターン

### Multi-Stage Dockerfileパターン

すべてのサンプルはマルチステージビルドで開発環境と本番環境を分離：

```dockerfile
# ステージ: base - 共通の依存関係
FROM <language>:<version> AS base

# ステージ: development - 開発ツール、ホットリロード
FROM base AS development
# 含まれるもの: git, vim, デバッガー、追加ツール
# ボリュームマウント: ホットリロード用のソースコード
# ユーザー: 通常はrootまたは言語デフォルトユーザー

# ステージ: production - 最小限、セキュア
FROM base AS production
# 最小限の依存関係のみ
# 開発ツールなし
# 非rootユーザー
# ヘルスチェック含む
```

**重要な違い:** Dev Containerは常に`development`ステージをターゲットにします。本番デプロイは`production`ステージをターゲットにします。

### Docker Composeオーケストレーション

各サンプルには2つのcomposeファイルがあります：

1. **`.devcontainer/docker-compose.yml`**: 開発環境最適化
   - ホットリロード用のボリュームマウント
   - デバッグポート公開
   - 開発環境の環境変数
   - postCreateCommandによる依存関係の自動インストール

2. **`docker-compose.prod.yml`**: 本番環境オーバーライド
   - リソース制限（CPU、メモリ）
   - ソースコードのボリュームマウントなし
   - 本番環境の環境変数
   - 必要に応じてリバースプロキシ（Nginx）を含む

### フロントエンド-バックエンド連携のためのCORS設定

FastAPIサンプルはNext.js連携のための適切なCORS設定を実装：

```python
# main.py
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**フルスタック開発のワークフロー:**
1. FastAPIバックエンドを1つのVSCodeウィンドウで起動（ポート8000）
2. Next.jsフロントエンドを別のVSCodeウィンドウで起動（ポート3000）
3. フロントエンドから`http://localhost:8000/api/*`でバックエンドを呼び出し

## Dev Container設定パターン

### 共通のdevcontainer.json構造

```json
{
  "name": "プロジェクト名",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",

  "forwardPorts": [3000, 5433],
  "portsAttributes": {
    "3000": {"label": "App", "onAutoForward": "notify"}
  },

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },

  "customizations": {
    "vscode": {
      "extensions": ["..."],
      "settings": {"..."}
    }
  },

  "postCreateCommand": "npm install",
  "postStartCommand": "npm run db:migrate",
  "remoteUser": "node",
  "shutdownAction": "stopCompose"
}
```

### ライフサイクルコマンド

- **postCreateCommand**: コンテナ作成後に1回だけ実行（依存関係インストール）
- **postStartCommand**: コンテナ起動の度に実行（マイグレーション、ヘルスチェック）
- **postAttachCommand**: VSCodeがコンテナに接続した後に実行（ウェルカムメッセージ）

### VSCode拡張機能の管理

`devcontainer.json`で指定された拡張機能はコンテナ内に自動インストールされます。拡張機能を追加する手順：

1. 拡張機能IDを取得: VSCode拡張機能パネルで右クリック → 「拡張機能IDをコピー」
2. `customizations.vscode.extensions`配列に追加
3. コンテナを再構築: F1 → "Dev Containers: Rebuild Container"

## 環境変数

各サンプルは`.env.example`ファイルを使用します。パターン：

```bash
# 初回実行前にコピーして設定
cp .env.example .env

# 主要な変数（コンテナ内からのアクセス）
DATABASE_URL=postgresql://user:pass@db:5432/dbname
REDIS_URL=redis://redis:6379
SECRET_KEY=change_in_production
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**注意:** `.env`ファイルはgitignoreされています。開発者は`.env.example`から独自に作成する必要があります。

## Pythonフレームワーク選択（2025年ガイダンス）

このリポジトリはFlaskとFastAPI両方のサンプルを提供しています。READMEの分析から：

**FastAPIを選ぶべき場合:**
- 本格的なAPIを構築する（Flaskの3〜4倍高速）
- 自動APIドキュメント生成が必要（Swagger/ReDoc）
- Pydanticによる型安全性を重視
- AI/MLサービスとの統合を予定
- チームがモダンなPython経験を持つ（async/await、型ヒント）

**Flaskを選ぶべき場合:**
- 初めてWebフレームワークを学習する
- シンプルな内部ツールを構築する
- 最大限の柔軟性が必要
- レガシーFlaskエコシステムを活用する

**FastAPIの優位性（2025年）:**
- 求人市場で150%成長（2024-2025年）
- ネイティブ非同期サポート（ASGI）
- Uber、Microsoft、Netflixによるエンタープライズ採用
- 自動OpenAPIスキーマ生成

## 変更のテスト

サンプルプロジェクトへの変更をコミットする前に：

```bash
# 1. Dev Containerビルドをテスト
F1 → "Dev Containers: Rebuild Container"

# 2. 本番ビルドをテスト
docker build --target production -t test:latest .

# 3. サービス起動を確認
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose logs -f

# 4. データベース初期化をテスト（FastAPIのみ）
python init_db.py

# 5. エンドポイントをテスト
# Node.js: curl http://localhost:3000
# Flask: curl http://localhost:5001/health
# FastAPI: curl http://localhost:8000/health

# 6. FastAPIユーザー作成をテスト
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser2","password":"password123"}'

# 7. クリーンアップ
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## データベース管理

すべてのサンプルはPostgreSQLを使用します。共通パターン：

**コンテナからの接続:**
```bash
# dev container内から
psql -h db -U postgres -d myapp

# またはdocker compose経由
docker compose exec db psql -U postgres
```

**VSCode SQLTools統合:**
すべてのdevcontainer.jsonファイルには、VSCode内でGUIデータベースアクセスを可能にするSQLTools設定が含まれています。

**FastAPIデータベース操作:**
```bash
# データベース初期化（テーブル作成 + テストデータ投入）
python init_db.py

# PostgreSQLでテーブル確認
docker compose exec db psql -U postgres -d fastapi_db -c "\dt"

# usersテーブル表示
docker compose exec db psql -U postgres -d fastapi_db -c "SELECT * FROM users;"

# itemsテーブル表示
docker compose exec db psql -U postgres -d fastapi_db -c "SELECT * FROM items;"
```

**マイグレーションパターン:**
- Node.js: `npm run db:migrate`でカスタムマイグレーション
- Python FastAPI: `init_db.py`による手動初期化（本番環境にはAlembicを追加可能）
- Python Flask: 通常はAlembicを使用（基本サンプルには含まれていません）

## ポート規約

サンプル全体で標準化：
- **3000**: Node.js/Next.jsフロントエンド
- **5001**: Flaskバックエンド（ホスト側）、5000（コンテナ内）
- **8000**: FastAPIバックエンド
- **5433**: PostgreSQL（ホスト側）、5432（コンテナ内）
- **6379**: Redis
- **9229**: Node.jsデバッガー

**重要な注意:** devcontainer内からサービスにアクセスする際は、コンテナ内部のポートを使用します（例：PostgreSQLは `db:5432`）。ホストマシンからアクセスする際は、マッピングされたポートを使用します（例：`localhost:5433`）。

## よくある問題のトラブルシューティング

### コンテナが起動しない
```bash
# Docker Desktopが起動しているか確認
docker ps

# ログを確認
docker compose logs app

# 最終手段：ゼロから再構築
docker compose down -v  # ボリュームも削除！
F1 → "Dev Containers: Rebuild Container"
```

### ポートがすでに使用されている
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000

# devcontainer.jsonのforwardPortsでポートを変更
```

### ファイル同期が遅い（macOS/Windows）
```bash
# docker-compose.ymlのvolumesに追加
- ..:/workspace:cached  # cachedフラグでパフォーマンス向上

# またはボリューム専用dev containerを使用
F1 → "Dev Containers: Clone Repository in Container Volume"
```

### データベース接続拒否
- docker-compose.ymlで`depends_on`に`condition: service_healthy`があるか確認
- データベースコンテナが起動しているか確認: `docker compose ps db`
- DATABASE_URLのサービス名が正しいか確認（`localhost`ではなくサービス名を使用）

## 新規プロジェクト用にサンプルを改変する方法

1. **サンプルディレクトリをコピー:**
   ```bash
   cp -r examples/python-fastapi/ ../my-new-project/
   ```

2. **devcontainer.jsonをカスタマイズ:**
   - `name`を変更
   - `forwardPorts`を更新
   - VSCode拡張機能を追加/削除
   - ライフサイクルコマンドを修正

3. **Dockerfileを更新:**
   - 必要に応じてベースイメージのバージョンを変更
   - プロジェクト固有の依存関係を追加
   - ヘルスチェックエンドポイントを調整

4. **docker-compose.ymlを設定:**
   - サービス名を更新
   - 環境変数を修正
   - サービスを追加/削除（例：MongoDB追加、Redis削除）

5. **テスト:** F1 → "Dev Containers: Reopen in Container"

## ドキュメント相互参照

- **メインガイド:** README.md（VSCode + Dockerの包括的な日本語チュートリアル）
- **サンプル概要:** examples/README.md（各サンプルのクイックスタート）
- **個別サンプル:** 各サンプルには独自の.devcontainer設定ファイルがあります

変更を加える際は、以下の間で一貫性を保ってください：
1. README.mdのセクション
2. examples/README.md
3. 個別のdevcontainer.jsonファイル
4. このCLAUDE_ja.mdファイル
