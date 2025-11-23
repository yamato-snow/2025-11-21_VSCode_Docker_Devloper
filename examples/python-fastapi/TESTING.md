# テストガイド - Python FastAPI + React（初心者向け）

このドキュメントは、FastAPI + Reactプロジェクトのテスト実行方法を、初心者にもわかりやすく説明します。

## 💡 専門用語解説

| 用語 | 意味 |
|------|------|
| **pytest** | Pythonで最も人気のあるテストツール |
| **pytest-asyncio** | async/await（非同期処理）をテストするための拡張 |
| **httpx** | HTTPリクエストを送信するライブラリ（FastAPIのテストで使用） |
| **TestClient** | FastAPIのテスト用の仮想クライアント |
| **async/await** | 処理を待つ仕組み（データベースやAPIは時間がかかる） |
| **フィクスチャ** | テストで使い回せる部品（ユーザーデータ、データベース接続など） |
| **カバレッジ** | テストで確認されたコードの割合（%で表示） |
| **Pydantic** | データの形式を自動でチェックしてくれるライブラリ |
| **Swagger UI** | APIの使い方を確認できるWebページ（FastAPIが自動生成） |

---

## 📋 前提条件

テストを実行する前に、以下が揃っていることを確認してください：

### ✅ 必要なソフトウェア

1. **Docker Desktop** - 起動している状態
2. **Python 3.11** - インストール済み
3. **Node.js 20.x** - フロントエンドテスト用
4. **依存パッケージ** - `pip install -r requirements-dev.txt` でインストール

### ✅ 実行中のサービス

5. **PostgreSQLコンテナ** - データベース（ポート5433）
6. **Redisコンテナ** - キャッシュサーバー（ポート6379）
7. **バックエンドサーバー** - `http://localhost:8000` で起動
8. **フロントエンドサーバー** - `http://localhost:5173` で起動（E2Eテスト時）

### 📝 初期セットアップ手順

```bash
# 1. VSCodeでDev Containerを開く
# F1キーを押して「Dev Containers: Reopen in Container」を選択

# 2. Python依存パッケージをインストール
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Node.js依存パッケージをインストール（フロントエンドテスト用）
npm install

# 4. データベースを初期化
python init_db.py

# 5. 開発サーバーを起動
fastapi dev main.py --host 0.0.0.0 --port 8000   # バックエンド

# 別のターミナルで:
npm run dev                                        # フロントエンド
```

---

## テストの実行方法

### 🧪 バックエンドテスト（pytest）

**何をテストする？**: FastAPIのエンドポイント、データベース操作、認証機能

#### 基本的な実行方法

```bash
# 全てのテストを実行
pytest

# 実行されるテストの例:
# ✅ ユーザー登録APIが動くか
# ✅ ログインしてJWTトークンが取得できるか
# ✅ データベースに正しく保存されるか
# ✅ Pydanticバリデーションが動くか
```

#### 便利なオプション

```bash
# 詳細表示モード（各テストの名前を表示）
pytest -v

# カバレッジレポートを生成
pytest --cov

# 特定のテストファイルだけ実行
pytest tests/test_auth.py

# テスト名で絞り込み
pytest -k "test_register"

# 非同期テストのみ実行
pytest -m asyncio
```

**💡 -v オプション**: verbose（詳細）モードで実行。
どのテストが成功/失敗したか、名前付きで表示されます。

**💡 -k オプション**: keywordの略。テスト名に含まれる文字で絞り込み。
例: `-k "auth"` → 名前に"auth"を含むテストのみ実行

### カバレッジレポートの確認

```bash
# カバレッジレポートを生成
pytest --cov

# HTMLレポートを生成して開く
pytest --cov --cov-report=html
open htmlcov/index.html      # macOS
xdg-open htmlcov/index.html  # Linux
```

### 🎨 フロントエンドテスト（Vitest）

```bash
# 全てのフロントエンドテストを実行
npm run test:client

# ファイル変更時に自動再実行
npm run test:client:watch
```

### 🌐 E2Eテスト（Playwright）

**⚠️ 重要**: バックエンドとフロントエンドの両方を起動してから実行してください！

```bash
# E2Eテストを実行
npm run test:e2e

# ブラウザのUIを表示して実行
npm run test:e2e:ui

# ブラウザを表示して実行（デバッグに便利）
npx playwright test --headed
```

---

## テストの構造

### 📁 ファイル構成

```
examples/python-fastapi/
├── tests/
│   ├── conftest.py           # pytestの設定とフィクスチャ
│   ├── test_auth.py           # 認証テスト（16ケース）
│   ├── test_items.py          # Items APIテスト（14ケース）
│   └── __init__.py
├── client/src/
│   └── __tests__/             # フロントエンドテスト
├── pytest.ini                 # pytestの設定ファイル
└── TESTING.md                 # このファイル
```

### 📚 各テストファイルの内容

#### **conftest.py**（設定とフィクスチャ）

**フィクスチャ**は、テストで使い回せる部品です。

利用可能なフィクスチャ:
```python
# client: 認証なしのテストクライアント
def test_something(client):
    response = await client.get("/endpoint")

# authenticated_client: 認証済みのテストクライアント（ユーザー情報付き）
def test_with_auth(authenticated_client):
    client, auth_data = authenticated_client
    response = await client.get("/items")
    # auth_data には user情報とtokenが含まれる

# test_user_data: ランダムなテストユーザーデータ
def test_something(test_user_data):
    # {'username': 'testuser_123456', 'email': '...', 'password': '...'}

# db_session: データベースセッション
def test_database(db_session):
    # データベースに直接アクセス
```

**💡 フィクスチャの仕組み**: テストごとに新しいデータベースを作成 → テスト実行 → 削除
他のテストに影響を与えません。

#### **test_auth.py**（認証テスト: 16ケース）

FastAPIの認証機能をテストします。

**テスト内容の例**:
```python
# ✅ ユーザー登録成功（201 Created）
async def test_register_user_success(client, test_user_data):
    response = await client.post("/users", json=test_user_data)
    assert response.status_code == 201
    assert "access_token" in response.json()

# ✅ OAuth2形式でログイン成功
async def test_login_success(client, test_user_data):
    # OAuth2はフォーム形式でデータを送信
    login_data = {
        "username": test_user_data["username"],
        "password": test_user_data["password"],
    }
    response = await client.post(
        "/token",
        data=login_data,  # jsonではなくdata
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
```

**💡 OAuth2PasswordRequestForm**: ログインの標準形式。
JSON形式ではなく、フォーム形式（`application/x-www-form-urlencoded`）でデータを送信します。

**テスト内容一覧**:
- ✅ ユーザー登録（成功、重複エラー、バリデーションエラー）
- ✅ ログイン（成功、パスワード間違い、非アクティブユーザー）
- ✅ トークン検証（有効、無効、期限切れ）
- ✅ パスワードのbcrypt暗号化確認
- ✅ Pydanticバリデーションの動作確認

#### **test_items.py**（Items API: 14ケース）

アイテムの作成・取得をテストします。

**テスト内容の例**:
```python
# ✅ アイテム作成成功
async def test_create_item_success(authenticated_client):
    client, auth_data = authenticated_client
    
    item_data = {
        "title": "Test Item",
        "description": "This is a test",
        "price": 99.99,
    }
    
    response = await client.post("/items", json=item_data)
    
    assert response.status_code == 201
    assert response.json()["title"] == "Test Item"
    assert response.json()["owner_id"] == auth_data["user"]["id"]

# ✅ ページネーション動作確認
async def test_get_items_pagination(authenticated_client):
    client, _ = authenticated_client
    
    # skip=0, limit=5 でページ分割
    response = await client.get("/items?skip=0&limit=5")
    assert response.status_code == 200
    assert len(response.json()) <= 5
```

**💡 skip/limit**: FastAPIのページネーション方式。
- `skip=0, limit=10`: 最初の10件
- `skip=10, limit=10`: 11件目から10件（2ページ目）

**テスト内容一覧**:
- ✅ アイテム作成（成功、バリデーションエラー、認証なしエラー）
- ✅ アイテム一覧取得（ページネーション含む）
- ✅ 特定アイテム取得（成功、404エラー）
- ✅ Pydanticスキーマの検証
- ✅ descriptionのオプショナル確認（Noneも可）

---

## テストカバレッジ

### 目標値

| 領域 | 目標カバレッジ |
|------|-------------|
| バックエンド全体 | 80%以上 |
| main.py（エンドポイント） | 100% |
| crud.py | 90%以上 |
| models.py | 100% |
| フロントエンド | 70%以上 |

### カバレッジレポートの見方

```bash
# カバレッジレポート生成
pytest --cov

# 実行結果の例:
# main.py      150    10    93%
# crud.py       80     5    94%
# models.py     30     0   100%
# ------------------------------
# TOTAL        260    15    94%

# HTMLレポート生成
pytest --cov --cov-report=html
open htmlcov/index.html
```

**レポートの見方**:
- **緑色の行**: テストで実行された ✅
- **赤色の行**: テストされていない ❌
- **黄色の行**: 一部のみ実行（条件分岐）

---

## トラブルシューティング

### 問題1: データベースに接続できない

**エラーメッセージ**:
```
asyncpg.exceptions.ConnectionDoesNotExistError
```

**解決方法**:
```bash
# PostgreSQLコンテナを確認
docker compose ps db

# 起動していない場合
docker compose up -d db

# データベース初期化
python init_db.py

# 接続確認
curl http://localhost:8000/health
```

### 問題2: "RuntimeWarning: coroutine was never awaited"

**エラーメッセージ**:
```
RuntimeWarning: coroutine 'test_something' was never awaited
```

**原因**: `async`関数に`await`を付け忘れている

**解決方法**:
```python
# ❌ 間違い
@pytest.mark.asyncio
def test_something(client):  # asyncが抜けている
    response = client.get("/endpoint")  # awaitが抜けている

# ✅ 正しい
@pytest.mark.asyncio
async def test_something(client):  # asyncを追加
    response = await client.get("/endpoint")  # awaitを追加
```

**💡 async/await**: 非同期処理を扱うPythonの文法。
データベースやAPIは時間がかかるので、`await`で「待つ」必要があります。

### 問題3: "asyncio_mode" Configuration Error

**エラーメッセージ**:
```
PytestConfigWarning: asyncio_mode
```

**解決方法**: `pytest.ini` に既に設定済みです:
```ini
[pytest]
asyncio_mode = auto
```

### 問題4: Import Errors

**エラーメッセージ**:
```
ModuleNotFoundError: No module named 'main'
```

**解決方法**:
```bash
# 現在のディレクトリをPYTHONPATHに追加
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# または、パッケージとしてインストール
pip install -e .
```

### 問題5: テストデータベースが汚染されている

**症状**: 重複エラーが出る、テストが失敗する

**解決方法**:
```bash
# データベースをクリーンアップ
docker compose exec db psql -U postgres -d fastapi_db -c "
DELETE FROM items;
DELETE FROM users WHERE username LIKE 'testuser_%';
"

# または、データベースを初期化し直す
python init_db.py
```

---

## 新しいテストを書く方法

### バックエンドテストの例

```python
# tests/test_my_feature.py
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_my_endpoint(authenticated_client):
    """エンドポイントのテスト"""
    client, auth_data = authenticated_client
    
    # テスト実行
    response = await client.get("/my-endpoint")
    
    # 検証
    assert response.status_code == 200
    assert "expected_key" in response.json()


@pytest.mark.asyncio
async def test_with_custom_data(client: AsyncClient, test_user_data: dict):
    """カスタムデータを使ったテスト"""
    # ユーザー登録
    response = await client.post("/users", json=test_user_data)
    
    # 検証
    assert response.status_code == 201
    assert response.json()["username"] == test_user_data["username"]
```

### 使用可能なフィクスチャ

```python
@pytest.mark.asyncio
async def test_example(
    client,                    # 認証なしクライアント
    authenticated_client,      # 認証済みクライアント
    test_user_data,           # テストユーザーデータ
    db_session                # データベースセッション
):
    """利用可能なフィクスチャの例"""
    
    # clientの使い方
    response = await client.get("/public-endpoint")
    
    # authenticated_clientの使い方
    auth_client, auth_data = authenticated_client
    response = await auth_client.get("/protected-endpoint")
    user_id = auth_data["user"]["id"]
    
    # test_user_dataの使い方
    username = test_user_data["username"]
    
    # db_sessionの使い方（直接データベースにアクセス）
    from models import User
    from sqlalchemy import select
    result = await db_session.execute(select(User).where(User.username == username))
    user = result.scalar_one()
```

---

## ベストプラクティス（良い書き方）

1. **必ず`@pytest.mark.asyncio`を付ける**
   ```python
   @pytest.mark.asyncio  # ←これを忘れずに
   async def test_something(client):
       response = await client.get("/endpoint")
   ```

2. **async関数には必ず`await`を付ける**
   ```python
   # ❌ 間違い
   response = client.get("/endpoint")
   
   # ✅ 正しい
   response = await client.get("/endpoint")
   ```

3. **フィクスチャを活用する**
   - データベースセッション
   - 認証済みクライアント
   - テストユーザーデータ

4. **テスト名をわかりやすく**
   ```python
   # ❌ 悪い例
   async def test_1():
   
   # ✅ 良い例
   async def test_register_user_with_valid_data():
   ```

5. **AAA パターンを使う**
   ```python
   async def test_example():
       # Arrange（準備）
       test_data = {"title": "Test", "price": 100}
       
       # Act（実行）
       response = await client.post("/items", json=test_data)
       
       # Assert（検証）
       assert response.status_code == 201
   ```

---

## CI/CD統合の例

### GitHub Actions

```yaml
name: FastAPI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fastapi_db
        ports:
          - 5433:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd examples/python-fastapi
          pip install -r requirements.txt -r requirements-dev.txt

      - name: Initialize database
        run: |
          cd examples/python-fastapi
          python init_db.py
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5433/fastapi_db

      - name: Run tests with coverage
        run: |
          cd examples/python-fastapi
          pytest --cov --cov-report=xml
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5433/fastapi_db
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

---

## 参考資料

### 公式ドキュメント（日本語）

- [pytest（日本語）](https://docs.pytest.org/en/stable/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [FastAPI テスト（日本語）](https://fastapi.tiangolo.com/ja/tutorial/testing/)
- [httpx AsyncClient](https://www.python-httpx.org/async/)

### 学習リソース

- [Pythonテスト入門](https://docs.python.org/ja/3/library/unittest.html)
- [FastAPI公式チュートリアル](https://fastapi.tiangolo.com/ja/tutorial/)

---

## サポート

- **詳細なテスト計画**: [TEST_PLAN.md](../../TEST_PLAN.md) を参照
- **問題が解決しない**: GitHubのIssueで質問してください

---

**最終更新**: 2025-11-22
**バージョン**: 2.0.0（初心者向け日本語版）
