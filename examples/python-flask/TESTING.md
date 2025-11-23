# Flask アプリケーション テストガイド

このドキュメントでは、Flask + React プロジェクトのテスト方法を初心者にもわかりやすく説明します。

## 💡 専門用語解説

| 用語 | 意味 |
|------|------|
| **テスト** | プログラムが正しく動くか確認する作業 |
| **自動テスト** | 人間が手で確認せず、コンピュータが自動的にテストを実行すること |
| **pytest** | Pythonのテストを実行するツール（Jestの Python版） |
| **フィクスチャ (fixture)** | テストで使う共通のデータや設定を用意する仕組み |
| **カバレッジ** | テストで確認されたコードの割合（%で表示） |
| **統合テスト** | APIとデータベースなど、複数の部品を組み合わせて動作確認するテスト |
| **E2E** | End to End = ユーザーの操作を最初から最後まで再現するテスト |
| **Flask-Bcrypt** | パスワードを暗号化するFlaskの機能 |
| **JWT (ジェイダブリューティー)** | ログイン認証に使うトークン（チケットのようなもの） |
| **test client** | APIを実際に起動せずにテストできる仕組み |

## 📋 テストの概要

このプロジェクトには **62個のテストケース** があります：

### バックエンドテスト (Python Flask)
- **認証テスト (15件)**: ユーザー登録、ログイン、トークン検証
- **ユーザーAPIテスト (15件)**: ユーザーの作成、取得、更新、削除
- **アイテムAPIテスト (14件)**: アイテムのCRUD操作、ページネーション
- **ヘルスチェックテスト (3件)**: サーバーとデータベース接続の確認

### フロントエンドテスト (React)
- **ログインフォームテスト (6件)**: ログイン画面の動作確認
- **ユーザーリストテスト (6件)**: ユーザー一覧の表示確認
- **Appコンポーネントテスト (3件)**: メイン画面の表示確認

## 🚀 テスト実行方法（初心者向け手順）

### ステップ1: 開発環境の準備

まず、Dev Containerを起動します：

```bash
# VSCodeで以下の手順を実行
# 1. F1キーを押す
# 2. "Dev Containers: Reopen in Container" を選択
# 3. コンテナが起動するまで待つ（初回は5-10分かかります）
```

### ステップ2: 必要なパッケージのインストール

```bash
# Python テストツールのインストール
pip install -r requirements-dev.txt

# フロントエンド（React）のツールもインストール
npm install
```

**💡 requirements-dev.txt**: 開発用のツール一覧が書かれたファイル。`pip install -r`でまとめてインストールできます。

### ステップ3: データベースの準備

```bash
# PostgreSQLデータベースを起動
docker compose up -d db

# データベースを初期化（テーブル作成）
python init_db.py
```

**重要**: テストを実行する前に、必ずデータベースが起動していることを確認してください。

### ステップ4: テストの実行

#### すべてのテストを実行

```bash
# バックエンド + フロントエンド 全テスト実行
npm run test:all
```

#### バックエンドテストのみ実行

```bash
# すべてのバックエンドテストを実行
pytest

# カバレッジ（テストの網羅率）付きで実行
pytest --cov=. --cov-report=html

# 特定のファイルだけテスト
pytest tests/test_auth.py        # 認証テストのみ
pytest tests/test_users.py       # ユーザーAPIテストのみ
pytest tests/test_items.py       # アイテムAPIテストのみ

# 詳細な出力で実行（どのテストが実行されているか見やすい）
pytest -v

# 失敗したテストだけ再実行
pytest --lf
```

**💡 pytest**: Python用のテストツール。`test_`で始まるファイルを自動的に見つけてテストを実行します。

**💡 --cov**: カバレッジを測定するオプション。どのコードがテストされていないか確認できます。

#### フロントエンドテストのみ実行

```bash
# Reactコンポーネントのテスト
npm run test:client

# テストを監視モードで実行（ファイル変更時に自動再実行）
npm run test:client:watch
```

## 📁 テストファイルの構成

```
examples/python-flask/
├── tests/                     # テストファイルを格納するフォルダ
│   ├── conftest.py           # テストの共通設定（フィクスチャ）
│   ├── test_auth.py          # 認証機能のテスト (15件)
│   ├── test_users.py         # ユーザーAPI のテスト (15件)
│   ├── test_items.py         # アイテムAPI のテスト (14件)
│   └── test_health.py        # ヘルスチェックのテスト (3件)
├── client/src/__tests__/     # React フロントエンドのテスト
│   ├── Login.test.tsx        # ログインフォームのテスト (6件)
│   ├── UserList.test.tsx     # ユーザー一覧のテスト (6件)
│   └── App.test.tsx          # メインアプリのテスト (3件)
├── pytest.ini                # pytest の設定ファイル
└── TESTING.md                # このファイル
```

## 🔧 フィクスチャの使い方

**フィクスチャ**とは、テストで使う共通のデータや設定を用意する仕組みです。毎回同じコードを書かなくて済みます。

### conftest.py で定義されているフィクスチャ

#### 1. `app` フィクスチャ
Flaskアプリケーションのテスト用インスタンスを作成します。

```python
@pytest.fixture(scope="function")
def app():
    """各テストごとに新しいアプリを作成"""
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = (
        "postgresql://postgres:postgres@localhost:5433/flask_db"
    )

    with flask_app.app_context():
        db.create_all()  # テーブルを作成
        yield flask_app  # テストで使えるようにする
        db.session.remove()
        db.drop_all()    # テスト後にクリーンアップ
```

**💡 scope="function"**: 各テスト関数ごとに新しくデータベースを作成するので、テスト間で影響しません。

#### 2. `client` フィクスチャ
APIをテストするための仮想クライアントです。

```python
@pytest.fixture(scope="function")
def client(app):
    """テスト用のHTTPクライアント"""
    return app.test_client()
```

**使用例**:
```python
def test_health_check(client):
    """ヘルスチェックのテスト"""
    response = client.get("/health")
    assert response.status_code == 200
```

#### 3. `test_user_data` フィクスチャ
テスト用のユーザーデータを生成します（毎回ランダムな値）。

```python
@pytest.fixture(scope="function")
def test_user_data():
    """ランダムなテストユーザーデータを生成"""
    import random
    timestamp = random.randint(100000, 999999)
    return {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "password123",
    }
```

**💡 なぜランダム？**: テストを何度実行しても、ユーザー名が重複しないようにするためです。

#### 4. `authenticated_client` フィクスチャ
ログイン済みのクライアントを作成します（トークン付き）。

```python
@pytest.fixture(scope="function")
def authenticated_client(client, test_user_data):
    """ログイン済みのテストクライアント"""
    # ユーザーを登録
    response = client.post(
        "/auth/register",
        json=test_user_data,
        content_type="application/json",
    )

    # トークンを取得
    token = response.get_json()["access_token"]

    # Authorizationヘッダーを自動で付けるクライアント
    class AuthenticatedClient:
        def __init__(self, client, token):
            self._client = client
            self.token = token

        def get(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.get(*args, **kwargs)

        def post(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.post(*args, **kwargs)

    return AuthenticatedClient(client, token)
```

**使用例**:
```python
def test_get_current_user(authenticated_client):
    """ログインユーザー情報の取得テスト"""
    response = authenticated_client.get("/auth/me")
    assert response.status_code == 200
    # Authorizationヘッダーは自動で付きます
```

## 📝 テストの書き方（初心者向け）

### 基本的なテストの構造

```python
def test_関数名(フィクスチャ名):
    """テストの説明（何を確認するテストか）"""

    # 1. 準備 (Arrange) - テストに必要なデータを用意
    test_data = {"username": "testuser", "password": "password123"}

    # 2. 実行 (Act) - テスト対象の処理を実行
    response = client.post("/auth/token", json=test_data)

    # 3. 検証 (Assert) - 結果が期待通りか確認
    assert response.status_code == 200
    assert "access_token" in response.get_json()
```

### 実際のテスト例

#### 例1: ユーザー登録のテスト

```python
def test_register_user_success(client, test_user_data):
    """ユーザー登録が成功するかテスト"""
    response = client.post(
        "/auth/register",
        json=test_user_data,
        content_type="application/json",
    )

    # ステータスコードが201（作成成功）か確認
    assert response.status_code == 201

    # レスポンスにユーザー情報が含まれているか確認
    data = response.get_json()
    assert data["username"] == test_user_data["username"]
    assert data["email"] == test_user_data["email"]

    # パスワードハッシュは返されないことを確認（セキュリティ）
    assert "password_hash" not in data

    # アクセストークンが発行されているか確認
    assert "access_token" in data
```

#### 例2: ログイン失敗のテスト

```python
def test_login_wrong_password(client, test_user_data):
    """間違ったパスワードでログインできないことを確認"""
    # まずユーザーを登録
    client.post("/auth/register", json=test_user_data)

    # 間違ったパスワードでログイン試行
    login_data = {
        "username": test_user_data["username"],
        "password": "wrongpassword"  # 間違ったパスワード
    }
    response = client.post("/auth/token", json=login_data)

    # 401エラー（認証失敗）が返ることを確認
    assert response.status_code == 401
    assert "Incorrect username or password" in response.get_json()["error"]
```

#### 例3: 認証が必要なエンドポイントのテスト

```python
def test_get_current_user_success(authenticated_client):
    """ログインユーザー情報が取得できるか確認"""
    response = authenticated_client.get("/auth/me")

    assert response.status_code == 200
    data = response.get_json()
    assert data["username"] == authenticated_client.user_data["username"]
    assert data["email"] == authenticated_client.user_data["email"]

    # パスワードハッシュは含まれないことを確認
    assert "password_hash" not in data
```

## 🎯 カバレッジの確認

### カバレッジレポートの生成

```bash
# HTMLレポートを生成
pytest --cov=. --cov-report=html

# ターミナルに結果を表示
pytest --cov=. --cov-report=term-missing
```

### レポートの見方

```bash
# htmlcovフォルダが生成されます
open htmlcov/index.html  # ブラウザで開く
```

**💡 カバレッジ目標**:
- **全体**: 75%以上
- **認証モジュール**: 90%以上
- **APIエンドポイント**: 100%

**色の意味**:
- 🟢 **緑**: テストでカバーされている
- 🔴 **赤**: テストされていない（カバレッジが不足）

## 🔍 よくあるテストパターン

### 1. データベース制約のテスト

```python
def test_register_duplicate_username(client, test_user_data):
    """同じユーザー名で2回登録できないことを確認"""
    # 1回目の登録（成功するはず）
    client.post("/auth/register", json=test_user_data)

    # 2回目の登録（失敗するはず）
    response = client.post("/auth/register", json=test_user_data)

    assert response.status_code == 400
    assert "already exists" in response.get_json()["error"].lower()
```

### 2. パスワードバリデーションのテスト

```python
def test_register_short_password(client):
    """短すぎるパスワードで登録できないことを確認"""
    invalid_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "short",  # 8文字未満
    }
    response = client.post("/auth/register", json=invalid_data)

    assert response.status_code == 400
    assert "at least 8 characters" in response.get_json()["error"].lower()
```

### 3. パスワードハッシュ化のテスト

```python
def test_password_hashed(app, client, test_user_data):
    """パスワードが暗号化されて保存されることを確認"""
    client.post("/auth/register", json=test_user_data)

    # データベースから直接ユーザーを取得
    with app.app_context():
        from models import User
        user = User.query.filter_by(
            username=test_user_data["username"]
        ).first()

        # パスワードが bcrypt でハッシュ化されているか確認
        assert user.password_hash.startswith("$2b$")

        # 元のパスワードで検証できるか確認
        from flask_bcrypt import Bcrypt
        bcrypt = Bcrypt()
        assert bcrypt.check_password_hash(
            user.password_hash,
            test_user_data["password"]
        )
```

### 4. トークンの有効期限テスト

```python
def test_protected_endpoint_expired_token(client, test_user_data):
    """期限切れトークンで認証できないことを確認"""
    from datetime import datetime, timedelta
    import jwt

    SECRET_KEY = "your-secret-key-keep-it-secret"

    # 1時間前に期限切れになるトークンを作成
    expire = datetime.utcnow() - timedelta(hours=1)
    expired_token = jwt.encode(
        {"sub": test_user_data["username"], "exp": expire},
        SECRET_KEY,
        algorithm="HS256",
    )

    # 期限切れトークンでアクセス試行
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )

    assert response.status_code == 401
```

## 🛠️ トラブルシューティング（よくある問題と解決方法）

### 問題1: データベースに接続できない

**エラーメッセージ**:
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解決方法**:
```bash
# 1. データベースコンテナが起動しているか確認
docker compose ps

# 2. データベースが起動していない場合は起動
docker compose up -d db

# 3. 接続をテスト
docker compose exec db psql -U postgres -c "SELECT 1"
```

### 問題2: テストデータベースの設定が間違っている

**エラーメッセージ**:
```
relation "users" does not exist
```

**解決方法**:
```bash
# データベースを初期化
python init_db.py

# または、conftest.py の設定を確認
# SQLALCHEMY_DATABASE_URI が正しいか確認してください
```

### 問題3: フィクスチャが見つからない

**エラーメッセージ**:
```
fixture 'authenticated_client' not found
```

**解決方法**:
- `conftest.py` ファイルが `tests/` フォルダにあることを確認
- pytest は自動的に `conftest.py` を読み込みます

### 問題4: テストが途中で止まる

**解決方法**:
```bash
# タイムアウトを延長
pytest --timeout=30

# または、詳細ログで原因を調査
pytest -vv -s
```

**💡 -s オプション**: print文の出力を表示します（デバッグに便利）

### 問題5: フロントエンドテストが失敗する

**エラーメッセージ**:
```
Cannot find module '@testing-library/react'
```

**解決方法**:
```bash
# npmパッケージを再インストール
npm install

# または、node_modulesをクリーンアップ
rm -rf node_modules package-lock.json
npm install
```

## 📊 CI/CD でのテスト実行

GitHub Actions などで自動テストを実行する場合の例：

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          npm install

      - name: Initialize database
        run: python init_db.py

      - name: Run backend tests
        run: pytest --cov=. --cov-report=xml

      - name: Run frontend tests
        run: npm run test:client

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎓 テストのベストプラクティス

### 1. テスト名は日本語で説明的に

```python
# ❌ 悪い例
def test_auth():
    pass

# ✅ 良い例
def test_register_user_success(client, test_user_data):
    """新しいユーザーが正常に登録できることを確認"""
    pass
```

### 2. 1つのテストで1つのことだけ確認

```python
# ❌ 悪い例（複数のことを1つのテストで確認）
def test_everything(client):
    # 登録もログインもユーザー取得も全部テスト
    pass

# ✅ 良い例（機能ごとに分割）
def test_register_user(client, test_user_data):
    """ユーザー登録のみテスト"""
    pass

def test_login_user(client, test_user_data):
    """ログインのみテスト"""
    pass
```

### 3. テストデータはフィクスチャで共通化

```python
# ❌ 悪い例（毎回同じデータを書く）
def test_1(client):
    data = {"username": "test", "email": "test@test.com"}
    client.post("/users", json=data)

def test_2(client):
    data = {"username": "test", "email": "test@test.com"}
    client.post("/users", json=data)

# ✅ 良い例（フィクスチャを使う）
@pytest.fixture
def test_user_data():
    return {"username": "test", "email": "test@test.com"}

def test_1(client, test_user_data):
    client.post("/users", json=test_user_data)

def test_2(client, test_user_data):
    client.post("/users", json=test_user_data)
```

### 4. エラーケースもテストする

```python
# 成功するケースだけでなく、失敗するケースもテスト
def test_login_success(client, test_user_data):
    """正しい情報でログイン成功"""
    pass

def test_login_wrong_password(client, test_user_data):
    """間違ったパスワードでログイン失敗"""
    pass

def test_login_nonexistent_user(client):
    """存在しないユーザーでログイン失敗"""
    pass
```

### 5. テスト後はクリーンアップ

```python
@pytest.fixture(scope="function")
def app():
    # セットアップ
    db.create_all()

    yield app

    # クリーンアップ（重要！）
    db.session.remove()
    db.drop_all()
```

## 📚 参考資料

- [pytest 公式ドキュメント](https://docs.pytest.org/)
- [Flask Testing ガイド](https://flask.palletsprojects.com/en/3.0.x/testing/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)

## ✅ テスト実行チェックリスト

テストを実行する前に、以下を確認してください：

- [ ] Docker Desktop が起動している
- [ ] データベースコンテナが起動している (`docker compose ps`)
- [ ] データベースが初期化されている (`python init_db.py`)
- [ ] 必要なパッケージがインストールされている (`pip install -r requirements-dev.txt`)
- [ ] Node.js パッケージがインストールされている (`npm install`)

テスト実行後の確認：

- [ ] すべてのテストが成功している
- [ ] カバレッジが 75% 以上である
- [ ] 認証関連のテストが 90% 以上カバーされている
- [ ] エラーメッセージが適切に表示されている

---

**💡 ヒント**: テストに慣れてきたら、自分でテストケースを追加してみましょう！新しい機能を追加したら、必ずテストも追加する習慣をつけると良いです。
