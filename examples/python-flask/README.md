# Flask + PostgreSQL Dev Container Example

このディレクトリには、VSCode Dev Containersで動作するFlask + PostgreSQLのシンプルなバックエンド開発環境サンプルが含まれています。

## 🌟 特徴

- **Flask**: Pythonの軽量かつ柔軟なWebフレームワーク
- **PostgreSQL**: 本番環境対応のリレーショナルデータベース
- **Flask-SQLAlchemy**: Flaskに最適化されたORM
- **Flask-Bcrypt**: パスワードハッシュ化
- **Flask-CORS**: クロスオリジン対応
- **シンプルな構成**: 学習に最適な最小限の実装

## 📁 プロジェクト構造

```
python-flask/
├── .devcontainer/          # Dev Container設定
│   ├── devcontainer.json   # VSCode Dev Container設定
│   └── docker-compose.yml  # 開発環境用Docker Compose
├── app.py                  # Flaskアプリケーション本体（モデル含む）
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

APIテスト:
  curl http://localhost:5000/health
  curl http://localhost:5000/api/users
============================================================
```

### 4. 開発サーバー起動

データベース初期化後、開発サーバーを起動:

```bash
# Dev Containerでは自動起動されますが、手動起動する場合:
python app.py

# または
flask run --host=0.0.0.0 --port=5000
```

### 5. 動作確認

ブラウザまたはcurlで以下のエンドポイントにアクセス:

```bash
# ルートエンドポイント
curl http://localhost:5000

# ヘルスチェック
curl http://localhost:5000/health

# データベース接続テスト
curl http://localhost:5000/api/db-test
```

詳細なテスト手順は「🧪 詳細なテスト方法」セクションを参照してください。

## 📋 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `python app.py` | 開発サーバー起動（デバッグモード） |
| `flask run` | Flaskの標準起動コマンド |
| `python init_db.py` | データベース初期化（テーブル作成＋初期データ） |
| `black .` | コードフォーマット（Black） |
| `pylint app.py` | コード品質チェック（Pylint） |

## 🔌 サービス構成

### アプリケーション (api)
- **ポート**: 5000
- **フレームワーク**: Flask（WSGI）
- **ORM**: Flask-SQLAlchemy
- **パスワードハッシュ**: Flask-Bcrypt
- **CORS**: Flask-CORS

### PostgreSQL (db)
- **ポート**: 5433 (ホストからアクセス) / 5432 (コンテナ間通信)
- **ユーザー**: postgres
- **パスワード**: postgres
- **データベース**: flask_app
- **接続文字列**: `postgresql://postgres:postgres@db:5432/flask_app`

## 🛠️ 開発ツール

Dev Container内に以下のツールが自動インストールされます:

- **Python 3.11**
- **Flask, SQLAlchemy, psycopg2**
- **Flask-Bcrypt, Flask-CORS, Flask-RESTful**
- **Black** (コードフォーマッター)
- **Pylint** (静的解析ツール)
- **PostgreSQL Client** (psql)
- **Git, Vim, Curl, Wget**
- **GitHub CLI** (gh)

### VSCode拡張機能

以下の拡張機能がコンテナ内に自動インストールされます:

- Python
- Pylance
- Black Formatter
- Pylint
- Docker
- SQLTools (PostgreSQL接続)

## 🧪 詳細なテスト方法

このセクションでは、各エンドポイントの詳細なテスト方法と期待される出力を説明します。

### 前提条件

テスト前に必ず `python init_db.py` を実行してデータベースを初期化してください。

### 1. ルートエンドポイント

APIの基本情報を取得します。

```bash
curl http://localhost:5000
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
    "database_test": "/api/db-test"
  }
}
```

### 2. ヘルスチェックエンドポイント

アプリケーションの健全性を確認します。

```bash
curl http://localhost:5000/health
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
curl http://localhost:5000/api/db-test
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

### 4. ユーザー一覧取得（GET /api/users）

登録されているユーザーの一覧を取得します。

```bash
curl http://localhost:5000/api/users
```

**期待される出力:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "is_active": true,
      "created_at": "2025-11-22T10:00:00.000000"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}
```

**ページネーション:**
```bash
# 2ページ目を取得（1ページあたり5件）
curl "http://localhost:5000/api/users?page=2&per_page=5"
```

### 5. ユーザー登録（POST /api/users）

新しいユーザーを作成します。

```bash
curl -X POST "http://localhost:5000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123"
  }'
```

**期待される出力:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "is_active": true,
    "created_at": "2025-11-22T10:35:00.000000"
  }
}
```

**エラーケース（重複ユーザー名）:**
```json
{
  "error": "Username already exists"
}
```

### 6. ユーザー詳細取得（GET /api/users/{user_id}）

特定のユーザーの情報を取得します。

```bash
curl http://localhost:5000/api/users/1
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

**エラーケース（存在しないユーザー）:**
```json
{
  "error": "Not found"
}
```

### 7. アイテム作成（POST /api/items）

新しいアイテムを作成します。

```bash
curl -X POST "http://localhost:5000/api/items" \
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

### 8. アイテム一覧取得（GET /api/items）

すべてのアイテムを取得します。

```bash
curl http://localhost:5000/api/items
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

### 9. アイテム詳細取得（GET /api/items/{item_id}）

特定のアイテムを取得します。

```bash
curl http://localhost:5000/api/items/1
```

**期待される出力:**
```json
{
  "id": 1,
  "title": "Sample Product",
  "description": "This is a sample product",
  "price": 99.99,
  "owner_id": 1,
  "created_at": "2025-11-22T10:40:00.000000"
}
```

### 10. アイテム更新（PUT /api/items/{item_id}）

既存のアイテムを更新します。

```bash
curl -X PUT "http://localhost:5000/api/items/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Product",
    "price": 149.99
  }'
```

**期待される出力:**
```json
{
  "message": "Item updated successfully",
  "item": {
    "id": 1,
    "title": "Updated Product",
    "description": "This is a sample product",
    "price": 149.99,
    "owner_id": 1,
    "created_at": "2025-11-22T10:40:00.000000"
  }
}
```

### 11. アイテム削除（DELETE /api/items/{item_id}）

アイテムを削除します。

```bash
curl -X DELETE "http://localhost:5000/api/items/1"
```

**期待される出力:**
```json
{
  "message": "Item deleted successfully"
}
```

### 12. ユーザーのアイテム一覧（GET /api/users/{user_id}/items）

特定のユーザーが所有するアイテムを取得します。

```bash
curl http://localhost:5000/api/users/1/items
```

**期待される出力:**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "is_active": true,
    "created_at": "2025-11-22T10:00:00.000000"
  },
  "items": [
    {
      "id": 1,
      "title": "Sample Product",
      "description": "This is a sample product",
      "price": 99.99,
      "owner_id": 1,
      "created_at": "2025-11-22T10:40:00.000000"
    }
  ]
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

-- アイテムの統計
SELECT
  COUNT(*) as total_items,
  AVG(price) as avg_price,
  MAX(price) as max_price,
  MIN(price) as min_price
FROM items;

-- ユーザーごとのアイテム数
SELECT u.username, COUNT(i.id) as item_count
FROM users u
LEFT JOIN items i ON u.id = i.owner_id
GROUP BY u.username;

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

Flask-CORSが設定されており、すべてのオリジンからのリクエストを受け付けます（開発環境用）。

**本番環境では制限することを推奨:**

```python
# app.py
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://your-frontend-domain.com"]
    }
})
```

### フロントエンド連携の例（Next.js）

```javascript
// Next.js API呼び出し例
const response = await fetch('http://localhost:5000/api/items', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
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
curl http://localhost:5000/health

# ログ確認
docker compose logs api -f

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🐛 トラブルシューティング

### エラー: テーブルが存在しない

**原因:** データベース初期化が実行されていない

**解決方法:**
```bash
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
lsof -i :5000

# Windows
netstat -ano | findstr :5000

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

### インポートエラー

```bash
# 依存パッケージを再インストール
pip install -r requirements.txt

# 仮想環境が正しくアクティベートされているか確認
which python
```

## 🎯 統合テストスクリプト

すべてのエンドポイントを順番にテストするスクリプト例:

```bash
#!/bin/bash
set -e

echo "=== Flask + PostgreSQL 統合テスト ==="
echo ""

# 1. ヘルスチェック
echo "1. ヘルスチェック"
curl -s http://localhost:5000/health | jq .
echo ""

# 2. データベース接続テスト
echo "2. データベース接続テスト"
curl -s http://localhost:5000/api/db-test | jq .
echo ""

# 3. ユーザー一覧取得
echo "3. ユーザー一覧取得"
curl -s http://localhost:5000/api/users | jq .
echo ""

# 4. ユーザー登録
echo "4. ユーザー登録"
curl -s -X POST "http://localhost:5000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"testuser2@example.com","password":"password123"}' \
  | jq .
echo ""

# 5. ユーザー詳細取得
echo "5. ユーザー詳細取得"
curl -s http://localhost:5000/api/users/1 | jq .
echo ""

# 6. アイテム作成
echo "6. アイテム作成"
curl -s -X POST "http://localhost:5000/api/items" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Item","description":"Test Description","price":123.45,"owner_id":1}' \
  | jq .
echo ""

# 7. アイテム一覧取得
echo "7. アイテム一覧取得"
curl -s http://localhost:5000/api/items | jq .
echo ""

# 8. ユーザーのアイテム一覧
echo "8. ユーザーのアイテム一覧"
curl -s http://localhost:5000/api/users/1/items | jq .
echo ""

echo "=== テスト完了 ==="
```

このスクリプトを `test.sh` として保存し、実行権限を付与して実行:

```bash
chmod +x test.sh
./test.sh
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

- **高速**: 非同期処理でパフォーマンスが高い
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

## 📚 参考リンク

- [メインREADME](../../README.md) - VSCode + Docker開発環境の包括的ガイド
- [Flask公式ドキュメント](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [SQLAlchemy ドキュメント](https://docs.sqlalchemy.org/)
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [PostgreSQL ドキュメント](https://www.postgresql.org/docs/)
