# VSCode拡張機能で実現するDocker開発環境：開発から本番まで完全ガイド

**このリポジトリには、本格的なデータベース統合を含む3つの実践サンプルが付属しています：**
- 🟢 [Node.js + PostgreSQL + Redis](examples/nodejs-postgres/) - Express + React フルスタック + JWT認証
- 🔵 [FastAPI + React + PostgreSQL](examples/python-fastapi/) - FastAPI + React フルスタック + JWT認証（2025年推奨）
- 🟡 [Flask + React + PostgreSQL](examples/python-flask/) - Flask + React フルスタック + JWT認証（学習向け）

すべてのサンプルに詳細なREADME、テスト手順、データベース接続例が含まれています。

---

## 目次
1. [はじめに：なぜVSCode + Dockerなのか](#はじめになぜvscode--dockerなのか)
2. [必要なツールのインストール](#必要なツールのインストール)
3. [VSCode拡張機能の詳細解説](#vscode拡張機能の詳細解説)
4. [Dev Containersの具体的な使い方](#dev-containersの具体的な使い方)
5. [Docker拡張機能の具体的な使い方](#docker拡張機能の具体的な使い方)
6. [Pythonフレームワーク選択：Flask vs FastAPI（2025年版）](#pythonフレームワーク選択flask-vs-fastapi2025年版)
7. [実践：プロジェクトのコンテナ化](#実践プロジェクトのコンテナ化)
   - 7.1. [サンプルプロジェクト一覧](#pythonflask--fastapiでの-dev-container例)
8. [本番環境へのデプロイ](#本番環境へのデプロイ)
9. [トラブルシューティング](#トラブルシューティング)

---

## はじめに：なぜVSCode + Dockerなのか

### 解決される問題

Docker環境での開発は、以下のような「あるある」問題を根本的に解決します。

- **「ローカルでは動いたのに本番で動かない」問題の解消**
  - 開発環境と本番環境で完全に同一のDockerイメージを使用することで、環境差異を完全に排除

- **新メンバーの環境構築時間の短縮**
  - 従来の手動セットアップ（言語インストール、ライブラリ管理、データベース設定など）が不要に
  - Dev Containersにより、初回起動からすぐに開発開始可能

- **チーム全員が同一環境で作業**
  - OS（Windows/macOS/Linux）の違いを吸収
  - Node.js、Python、データベースなどのバージョン違いが発生しない

- **複数プロジェクトでの環境の切り替えが容易**
  - プロジェクトごとに独立したコンテナ環境
  - 他プロジェクトの環境に影響を与えない

### VSCodeの2つの重要な拡張機能

本記事では、以下2つの拡張機能を中心に解説します。

1. **Dev Containers** (ms-vscode-remote.remote-containers)
   - コンテナ内で直接VSCodeを動かすための拡張機能
   - ローカルのVSCodeからコンテナ内の開発環境にシームレスに接続

2. **Docker** (ms-azuretools.vscode-docker)
   - Dockerコンテナ・イメージをVSCode上でGUI操作するための拡張機能
   - コマンドを覚えなくても直感的にDocker操作が可能

---

## 必要なツールのインストール

### 1. Docker Desktopのインストール

#### macOS

```bash
# Homebrewを使用する場合
brew install --cask docker

# または公式サイトからダウンロード
# https://www.docker.com/products/docker-desktop
```

#### Windows

```powershell
# Wingetを使用する場合
winget install Docker.DockerDesktop

# または公式サイトからダウンロード
# https://www.docker.com/products/docker-desktop
```

#### 動作確認

ターミナル（またはPowerShell）で以下を実行：

```bash
docker --version
# 出力例: Docker version 24.0.7, build afdd53b

docker compose version
# 出力例: Docker Compose version v2.23.3
```

**重要:** Docker Desktopアプリケーションを起動し、アクティビティトレイ（またはシステムトレイ）でクジラアイコンが表示されていることを確認してください。

---

### 2. VSCode拡張機能のインストール

#### 方法1: VSCode GUIからインストール

1. VSCodeを起動
2. **`Ctrl + Shift + X`** (Windows/Linux) または **`Cmd + Shift + X`** (macOS) で拡張機能パネルを開く
3. 以下の拡張機能を検索してインストール：
   - **Dev Containers** (`ms-vscode-remote.remote-containers`)
   - **Docker** (`ms-azuretools.vscode-docker`)

#### 方法2: コマンドラインからインストール

```bash
# Dev Containers拡張機能
code --install-extension ms-vscode-remote.remote-containers

# Docker拡張機能
code --install-extension ms-azuretools.vscode-docker
```

#### インストール確認

- ステータスバー（画面下部）の左端に新しいアイコンが表示される
- サイドバー（画面左側）にDockerアイコンが追加される

---

## VSCode拡張機能の詳細解説

### Dev Containers拡張機能

#### 概要

Dev Containers拡張機能は、**Dockerコンテナを完全な開発環境として使用する**ための機能です。

**動作の仕組み：**
1. ローカルのVSCodeからコンテナ内にリモート接続
2. コンテナ内でVSCode Serverが起動
3. ソースコード、拡張機能、ターミナルなど全てがコンテナ内で動作
4. ローカルのVSCode UIで操作

**メリット：**
- ✅ ホストマシンを汚さない（Node.jsやPythonのインストール不要）
- ✅ プロジェクトごとに完全に独立した環境
- ✅ `.devcontainer/devcontainer.json` でチーム全員が同じ環境を共有
- ✅ ホストOSに関係なく同じ開発環境を提供

---

#### 主要なコマンド（コマンドパレット: F1）

| コマンド | 機能 | 使用タイミング |
|---------|------|---------------|
| **Dev Containers: Open Folder in Container** | 既存フォルダをコンテナで開く | プロジェクトを初めてコンテナ化する時 |
| **Dev Containers: Reopen in Container** | 現在のフォルダを再度コンテナで開く | devcontainer.json作成後、または設定変更後 |
| **Dev Containers: Rebuild Container** | コンテナを再構築 | Dockerfile変更後、または環境リセット時 |
| **Dev Containers: Add Dev Container Configuration Files** | 設定ファイルを追加 | 既存プロジェクトにdevcontainerを追加 |
| **Dev Containers: Clone Repository in Container Volume** | リポジトリをボリュームで開く | 大規模プロジェクトでパフォーマンス重視 |
| **Dev Containers: Try a Dev Container Sample** | サンプルプロジェクト起動 | Dev Containersを初めて試す時 |

**実際の操作手順（初回セットアップ）：**

1. VSCodeでプロジェクトフォルダを開く
2. **`F1`** キーを押してコマンドパレットを開く
3. 「**Dev Containers: Add Dev Container Configuration Files**」と入力して選択
4. テンプレートを選択（例：Node.js、Python、PHP、Javaなど）
5. 追加オプションを選択（バージョン番号など）
6. `.devcontainer/devcontainer.json` が自動生成される
7. 「**Dev Containers: Reopen in Container**」で初回起動

---

#### devcontainer.json: 設定ファイルの詳細

`.devcontainer/devcontainer.json` は、Dev Containersの中核となる設定ファイルです。

##### 基本構造

```json
{
  "name": "プロジェクト名",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "forwardPorts": [3000, 5433],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint"],
      "settings": {
        "editor.formatOnSave": true
      }
    }
  }
}
```

##### 主要な設定項目

###### 1. コンテナイメージの指定

```json
{
  // パターン1: 既存のイメージを使用
  "image": "mcr.microsoft.com/devcontainers/python:3.11"
}
```

```json
{
  // パターン2: Dockerfileを使用
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  }
}
```

```json
{
  // パターン3: Docker Composeを使用（複数コンテナ）
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace"
}
```

###### 2. ポートフォワーディング

```json
{
  // 基本的なポート転送
  "forwardPorts": [3000, 5433, 6379],

  // ポートごとの詳細設定
  "portsAttributes": {
    "3000": {
      "label": "Application",
      "onAutoForward": "notify"  // ポート転送時に通知
    },
    "5433": {
      "label": "PostgreSQL",
      "onAutoForward": "silent"   // 通知しない
    }
  }
}
```

###### 3. VSCode拡張機能の自動インストール

```json
{
  "customizations": {
    "vscode": {
      // コンテナ内に自動インストールされる拡張機能
      "extensions": [
        "dbaeumer.vscode-eslint",           // ESLint
        "esbenp.prettier-vscode",           // Prettier
        "ms-azuretools.vscode-docker",      // Docker
        "bradlc.vscode-tailwindcss",        // Tailwind CSS
        "prisma.prisma"                      // Prisma
      ]
    }
  }
}
```

**拡張機能のID取得方法：**
1. VSCodeの拡張機能パネルで拡張機能を選択
2. 右クリック → 「拡張機能IDをコピー」

**除外する拡張機能：**
```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "-dbaeumer.vscode-eslint"  // マイナス記号で除外
      ]
    }
  }
}
```

###### 4. VSCode設定のカスタマイズ

```json
{
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  }
}
```

###### 5. ライフサイクルコマンド

```json
{
  // コンテナ作成直後に1回だけ実行（依存関係インストールなど）
  "postCreateCommand": "npm install && npm run build",

  // コンテナ起動後に毎回実行（データベースマイグレーションなど）
  "postStartCommand": "npm run migrate",

  // コンテナに接続した後に実行
  "postAttachCommand": "echo 'Welcome to Dev Container!'"
}
```

###### 6. Features機能（追加ツールのインストール）

Features は、再利用可能なインストールユニットで、GitHub CLIやAWS CLIなどのツールを簡単に追加できます。

```json
{
  "features": {
    // GitHub CLI
    "ghcr.io/devcontainers/features/github-cli:1": {
      "version": "latest"
    },
    // AWS CLI
    "ghcr.io/devcontainers/features/aws-cli:1": {
      "version": "latest"
    },
    // Docker in Docker（コンテナ内でDockerを使用）
    "ghcr.io/devcontainers/features/docker-in-docker:2": {
      "version": "latest"
    }
  }
}
```

**利用可能なFeatures一覧：**
https://containers.dev/features

###### 7. ユーザー設定

```json
{
  // コンテナ内で使用するユーザー名
  "remoteUser": "node",

  // rootユーザーで実行（開発時のみ推奨）
  // "remoteUser": "root"
}
```

###### 8. コンテナ終了時の動作

```json
{
  // VSCodeを閉じた時のコンテナの動作
  "shutdownAction": "none",        // コンテナを停止しない（デフォルト）
  // "shutdownAction": "stopCompose"  // Docker Composeを停止
}
```

---

##### 完全な設定例（Node.js + PostgreSQL + Redis）

```json
{
  "name": "Node.js Fullstack App",

  // Docker Composeを使用
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",

  // ポート転送
  "forwardPorts": [3000, 5433, 6379],
  "portsAttributes": {
    "3000": {
      "label": "Application Server",
      "onAutoForward": "notify"
    },
    "5433": {
      "label": "PostgreSQL Database"
    },
    "6379": {
      "label": "Redis Cache"
    }
  },

  // 追加機能
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {
      "version": "latest"
    },
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    }
  },

  // VSCodeカスタマイズ
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "prisma.prisma",
        "bradlc.vscode-tailwindcss"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        "[typescript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      }
    }
  },

  // ライフサイクルコマンド
  "postCreateCommand": "npm install",
  "postStartCommand": "npm run db:migrate",

  // ユーザー設定
  "remoteUser": "node",

  // コンテナ終了設定
  "shutdownAction": "stopCompose"
}
```

---

### Docker拡張機能

#### 概要

Docker拡張機能は、**VSCode上でDockerをGUI操作する**ための機能です。

**主な機能：**
- コンテナ・イメージ・ボリューム・ネットワークの可視化と操作
- `Dockerfile` と `docker-compose.yml` のIntelliSense（補完機能）
- 右クリックメニューで一般的なコマンドを実行
- ログの表示とコンテナ内ファイルの編集

**Dev Containersとの違い：**

| | Dev Containers | Docker拡張機能 |
|---|---|---|
| 目的 | コンテナ内で開発 | Dockerをホストから操作 |
| 操作場所 | コンテナ内 | ホストマシン |
| 主な用途 | 開発環境の提供 | Docker管理・デバッグ |
| 必要性 | 開発に必須 | 管理・運用で便利 |

---

#### Docker拡張機能の具体的な使い方

##### 1. Dockerビューの表示

1. サイドバー（左側）の **Dockerアイコン** をクリック
2. 以下のカテゴリが表示される：
   - **CONTAINERS**: 実行中・停止中のコンテナ一覧
   - **IMAGES**: ローカルにあるDockerイメージ
   - **REGISTRIES**: Docker Hub、Azure Container Registryなど
   - **VOLUMES**: Dockerボリューム
   - **NETWORKS**: Dockerネットワーク
   - **CONTEXTS**: Dockerコンテキスト

---

##### 2. コンテナの操作（GUIで完結）

###### コンテナの起動・停止

**右クリックメニューで操作：**

1. **CONTAINERSセクション** でコンテナを右クリック
2. 以下のメニューが表示される：
   - **Start**: コンテナ起動
   - **Stop**: コンテナ停止
   - **Restart**: コンテナ再起動
   - **Remove**: コンテナ削除
   - **View Logs**: ログ表示
   - **Attach Shell**: コンテナ内にシェル接続
   - **Inspect**: コンテナ詳細情報（JSON形式）
   - **Open in Browser**: コンテナのポートをブラウザで開く

###### ログの確認

1. コンテナを右クリック → **View Logs**
2. 新しいタブでログが表示される
3. リアルタイムで更新される（`docker logs -f` 相当）

###### コンテナ内に接続

1. コンテナを右クリック → **Attach Shell**
2. VSCodeのターミナルパネルでコンテナ内のシェルが起動
3. **ターミナルコマンドを実行せずに**コンテナ内に入れる

---

##### 3. コンテナ内ファイルの編集

**驚くべき機能：** コンテナ内のファイルをVSCodeで直接編集可能

**手順：**
1. CONTAINERSセクションでコンテナを展開
2. **Files** を展開してディレクトリ構造を表示
3. ファイルをクリックして編集
4. `Ctrl + S` (Windows/Linux) または `Cmd + S` (macOS) で保存
5. 編集内容が即座にコンテナに反映

**用途：**
- デバッグ時の設定ファイル編集
- コンテナ内のログファイル確認
- 一時的な修正

---

##### 4. イメージの管理

###### イメージのビルド

**方法1: Dockerfileから右クリック**

1. エクスプローラーで `Dockerfile` を右クリック
2. **Build Image** を選択
3. タグ名を入力（例：`myapp:latest`）
4. ビルドが開始され、ターミナルに出力が表示される

**方法2: IMAGESセクションから**

1. IMAGESセクションの右上の **+** アイコンをクリック
2. Dockerfileを選択
3. タグ名を入力してビルド

###### イメージの操作

IMAGESセクションでイメージを右クリック：
- **Run**: コンテナとして起動
- **Run Interactive**: インタラクティブモードで起動（`-it` オプション）
- **Push**: レジストリにプッシュ
- **Tag**: 新しいタグを付ける
- **Remove**: イメージ削除
- **Inspect**: イメージ詳細情報

---

##### 5. Docker Composeの操作

###### Compose Up（起動）

**方法1: docker-compose.ymlから右クリック**

1. エクスプローラーで `docker-compose.yml` を右クリック
2. **Compose Up** を選択
3. すべてのサービスが起動

**特定のサービスのみ起動：**
1. `docker-compose.yml` を右クリック
2. **Compose Up - Select Services** を選択
3. 起動したいサービスにチェック
4. OK をクリック

###### Compose Down（停止・削除）

1. `docker-compose.yml` を右クリック
2. **Compose Down** を選択
3. すべてのコンテナが停止・削除される

###### Compose Restart（再起動）

1. `docker-compose.yml` を右クリック
2. **Compose Restart** を選択

---

##### 6. Dockerfileの編集支援

VSCodeでDockerfileを開くと、以下の機能が自動的に有効になります：

###### IntelliSense（補完機能）

- `FROM` と入力すると、利用可能なベースイメージが表示される
- `RUN` と入力すると、一般的なコマンドが補完候補に表示される
- `Ctrl + Space` で手動補完

###### 構文チェック

- 問題パネル（`Ctrl + Shift + M`）にエラーが表示される
- 一般的なミス（スペルミス、非推奨のコマンドなど）を検出

###### ホバーヘルプ

- Dockerコマンドの上にマウスを置くと、説明が表示される

---

##### 7. レジストリの管理

###### Docker Hubへの接続

1. REGISTRIESセクションで **Docker Hub** を展開
2. **Connect Registry** をクリック
3. Docker Hubの認証情報を入力
4. 自分のリポジトリが表示される

###### イメージのPush

1. IMAGESセクションでイメージを右クリック
2. **Push** を選択
3. レジストリとタグを選択
4. 自動的にプッシュ

**対応レジストリ：**
- Docker Hub
- GitHub Container Registry (ghcr.io)
- Azure Container Registry
- その他のプライベートレジストリ

---

##### 8. ボリュームとネットワークの管理

###### ボリュームの確認

1. VOLUMESセクションでボリューム一覧を確認
2. 右クリック → **Inspect** で詳細表示
3. 右クリック → **Remove** で削除

###### ネットワークの確認

1. NETWORKSセクションでネットワーク一覧を確認
2. 右クリック → **Inspect** で接続されているコンテナを確認
3. 右クリック → **Remove** で削除（未使用のみ）

---

## Pythonフレームワーク選択：Flask vs FastAPI（2025年版）

### なぜこの比較が重要なのか

Pythonバックエンド開発では、Flask と FastAPI が2大フレームワークとして君臨しています。本記事ではNode.js（Express + React）のサンプルに加えて、Pythonバックエンドのサンプルも提供していますが、**2025年時点でどちらを選ぶべきか**は重要な判断です。

---

### パフォーマンス比較

#### ベンチマーク結果（同一ハードウェア）[^5]

| フレームワーク | リクエスト/秒 | 倍率 |
|---------------|--------------|------|
| **FastAPI** | 15,000-20,000 | 基準 |
| **Flask** | 2,000-5,000 | 1/4〜1/3 |

#### 非同期処理の違い

**FastAPI:**
- ASGI（Asynchronous Server Gateway Interface）ベース
- ネイティブな非同期サポート（`async def`構文）
- 単一ワーカーで複数リクエストを同時処理可能
- I/O処理が多い場合に特に高パフォーマンス

**Flask:**
- WSGI（Web Server Gateway Interface）ベース
- 基本的に同期処理
- 新バージョンで非同期対応可能だが、FastAPIほどファーストクラスではない

**重要な補足:**
データベース処理が絡む場合、単一のSELECT文の処理時間がフレームワークのオーバーヘッドを大きく上回るため、実際のアプリケーションではフレームワーク間の性能差は縮小します。

---

### 開発体験の違い

#### 型ヒントとバリデーション

**FastAPI:**
```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    email: EmailStr  # 自動でメールアドレス検証
    age: int = Field(..., gt=0, lt=150)  # 範囲検証

app = FastAPI()

@app.post("/users")
async def create_user(user: User):
    # userは自動的にバリデーション済み
    return {"email": user.email}
```

- Pydantic V2/V3による強力な型バリデーション
- スキーマバリデーションとシリアライゼーションが型アノテーションで制御
- IDEとの統合が優れており、エディタサポートが充実

**Flask:**
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    # 手動でバリデーション必要
    email = data.get("email")
    return jsonify({"email": email})
```

- 型ヒントは任意（サードパーティライブラリで対応可能）
- よりシンプルで学習曲線が緩やか
- 柔軟性が高く、開発者が実装方法を選択可能

#### 自動ドキュメント生成

**FastAPI:**
- **Swagger UI**（OpenAPI）と**ReDoc**が自動生成される
- 型定義から自動的にAPIドキュメントが作成される
- インタラクティブなAPIテストが可能

**アクセス方法:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Flask:**
- デフォルトでは自動ドキュメント生成なし
- Flask-RESTXなどのサードパーティ拡張で対応可能

---

### エコシステムと採用状況（2025年）

#### 市場動向

**FastAPI:**
- PyPI月間ダウンロード: 約214百万/月[^1]
- 過去2年で使用率35%増加
- **求人市場で150%増加**（2024-2025）[^2]
- **エンタープライズ採用でFlaskを上回る**

**主要採用企業:**[^3]
- Uber（Ludwigフレームワーク）
- Microsoft（Azure Functions）
- Netflix（Dispatchシステム）

**Flask:**
- PyPI月間ダウンロード: わずかにFastAPIに負ける
- 15年の歴史と安定性
- 豊富な拡張機能とコミュニティ

#### AI/ML統合での優位性

**2025年のトレンド:**
- FastAPI求人は特にAI企業とFintechで急増[^2]
- レガシー企業の45%がAI統合にFastAPIを選択[^4]
- AI/MLプロジェクトで事実上の標準に

---

### Flask vs FastAPI 比較表

| 観点 | Flask | FastAPI |
|------|-------|---------|
| **リリース年** | 2010年（15年の歴史） | 2018年（7年の歴史） |
| **アーキテクチャ** | WSGI（同期） | ASGI（非同期ネイティブ） |
| **パフォーマンス** | 2,000-5,000 req/sec | 15,000-20,000 req/sec |
| **型ヒント** | 任意 | Pydantic V2/V3による強力なバリデーション |
| **自動ドキュメント** | なし（拡張で対応可能） | Swagger UI + ReDocが標準 |
| **非同期サポート** | 追加で実装可能 | ネイティブサポート（`async def`） |
| **学習曲線** | 緩やか（初心者フレンドリー） | 中程度（モダンPython知識が必要） |
| **エコシステム** | 非常に豊富（15年の蓄積） | 質重視（若いが急成長中） |
| **求人増加率** | 安定 | 150%増（2024-2025） |
| **主要採用企業** | 広範囲 | Uber, Microsoft, Netflix |

---

### 他の主要フレームワークとの比較（2025年版）

Pythonのバックエンドフレームワークを選択する際、Flask と FastAPI 以外にも、Node.js、PHP、Java、Go、Rust、Rubyなど様々な選択肢があります。ここでは、**なぜPython（FastAPI/Flask）を選ぶべきか**を他の主流フレームワークと比較して解説します。

#### 主要バックエンドフレームワーク比較表

| フレームワーク | 言語 | パフォーマンス（req/sec） | 学習曲線 | AI/ML統合 | 適したユースケース |
|--------------|------|------------------------|---------|-----------|-----------------|
| **FastAPI** | Python | 15,000-20,000[^5] | 中 | ★★★★★ | API開発、AI/MLサービス、マイクロサービス |
| **Flask** | Python | 2,000-5,000[^5] | 低 | ★★★★☆ | プロトタイプ、小規模API、学習 |
| **Django REST** | Python | 3,000-8,000 | 高 | ★★★★☆ | フルスタックWeb、管理画面付きAPI |
| **Express.js** | Node.js | 10,000-15,000 | 低 | ★★☆☆☆ | リアルタイムアプリ、フロントエンド統合 |
| **NestJS** | Node.js | 8,000-12,000 | 中 | ★★☆☆☆ | エンタープライズAPI、マイクロサービス |
| **Laravel** | PHP | 1,000-3,000 | 中 | ★☆☆☆☆ | 従来型Webアプリ、CMS |
| **Spring Boot** | Java | 5,000-10,000 | 高 | ★★★☆☆ | エンタープライズ、金融システム |
| **Gin** | Go | 30,000-50,000 | 中 | ★★☆☆☆ | 超高速API、インフラツール |
| **Actix Web** | Rust | 50,000-100,000 | 高 | ★☆☆☆☆ | 超高速・低レベル制御、システムプログラミング |
| **Rails API** | Ruby | 1,500-4,000 | 中 | ★★☆☆☆ | スタートアップMVP、Web開発 |

#### なぜPython（FastAPI/Flask）なのか？

##### 1. AI/ML統合の圧倒的優位性 ★★★★★

**Pythonが他の言語を圧倒する理由：**

- **機械学習ライブラリのエコシステム**
  - TensorFlow、PyTorch、scikit-learn、Transformers、LangChainなどがPythonネイティブ
  - Node.js、PHP、Javaでは同等のライブラリが存在しないか、バインディング経由で性能劣化

- **データサイエンスとの親和性**
  - Pandas、NumPy、Matplotlibなどデータ処理・可視化ツールが充実
  - Jupyter Notebookでの実験コードをそのままAPIに組み込み可能

- **実際の採用事例**
  - OpenAI API（FastAPI製）
  - Hugging Face Inference API（FastAPI製）
  - Netflix Dispatch（FastAPI製）
  - レガシー企業の45%がAI統合にFastAPIを選択[^4]

**他言語との比較：**
- **Node.js**: TensorFlow.jsは存在するが、Pythonライブラリの1/10の機能
- **Java**: Deeplearning4jはあるが、エコシステムが小さく、最新モデル対応が遅い
- **Go/Rust**: 高速だが、機械学習ライブラリがほぼ存在しない

##### 2. 開発速度とプロトタイピング

**Pythonの強み：**
- シンプルな構文で学習コストが低い（特にFlask）
- 少ないコード量で実装可能
- 豊富なサードパーティライブラリ（PyPI: 50万パッケージ以上）

**実例比較（同じAPIエンドポイント実装）：**

```python
# Python (FastAPI): 10行
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    age: int

@app.post("/users")
async def create_user(user: User):
    return {"id": 1, **user.dict()}
```

```java
// Java (Spring Boot): 40行+アノテーション
@RestController
@RequestMapping("/users")
public class UserController {
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        // バリデーション、変換ロジック...
        return ResponseEntity.ok(new UserResponse(1L, request.getName(), request.getAge()));
    }
}
// + UserRequest, UserResponse DTOクラス定義
```

##### 3. 人材採用のしやすさ

**Pythonエンジニアの市場状況：**
- **学習者数**: 世界で最も学ばれているプログラミング言語（Stack Overflow Survey 2024）
- **求人増加率**: FastAPI関連求人が150%増（2024-2025）[^2]
- **汎用性**: Web開発だけでなく、データ分析、AI/ML、自動化など幅広いスキルセット

**採用コスト比較：**
- **Python**: 大学・オンライン学習者が多く、中級者の採用が容易
- **Java**: エンタープライズ経験者は豊富だが、給与水準が高い
- **Go/Rust**: エンジニア人口が少なく、採用難易度が高い

#### パフォーマンスが必要な場合は？

**「GoやRustの方が速いのでは？」→正しいが、多くの場合不要**

**実際のボトルネック：**
1. データベースクエリ（50-200ms）
2. 外部API呼び出し（100-500ms）
3. 機械学習推論（100-1000ms）

フレームワークのオーバーヘッド（1-5ms）は全体の5%未満。

**FastAPIで十分なケース：**
- 99%のWebアプリケーション
- I/O処理が支配的なシステム
- AI/ML推論サービス

**Go/Rustが必要なケース：**
- 毎秒10万リクエスト以上の超高負荷API
- マイクロ秒単位のレイテンシが必要
- インフラツール（Kubernetes、Prometheusなど）

#### まとめ：2025年の最適選択

**FastAPIを選ぶべき理由：**

1. ✅ **AI/ML統合**: 他言語の追随を許さないエコシステム
2. ✅ **開発速度**: 短いコードで高品質なAPIを実装
3. ✅ **採用しやすさ**: Pythonエンジニアの豊富な人材プール
4. ✅ **パフォーマンス**: 非同期処理で実用十分な速度
5. ✅ **自動ドキュメント**: Swagger UI/ReDocで協業効率化
6. ✅ **市場価値**: 求人150%増、エンタープライズ採用拡大

**他フレームワークが適している場合：**
- **Express.js**: フロントエンド（React.js）と言語統一したい
- **Spring Boot**: 既存のJavaエコシステムに統合
- **Go/Rust**: 極限のパフォーマンスが必要（インフラレイヤー）
- **Laravel**: PHP既存資産の活用

**3年目エンジニアへの推奨：**

Python（特にFastAPI）は、2025年時点で**最もバランスの取れた選択**です。AI/MLの需要増加、求人市場の拡大、実用的なパフォーマンスを考慮すると、キャリア形成において最も有利な投資となります。

---

### 使い分けの基準

#### FastAPIが向いているケース

1. **高同時実行性が必要なAPI**
   - 機械学習予測サービス
   - マイクロサービス連携
   - WebSocketストリーミング

2. **API駆動型アプリケーション**
   - 複数のフロントエンド（Web、モバイル、IoT）
   - RESTful APIやGraphQL API

3. **型安全性と自動化が重要**
   - 大規模チーム開発
   - 長期保守が必要なプロジェクト

4. **AI/MLプロジェクト（2025年のトレンド）**
   - データ集約型産業（医療、金融、AI企業）

#### Flaskが向いているケース

1. **シンプルなマイクロサービス**
   - 数個のAPIエンドポイント
   - プロトタイプ開発

2. **学習目的**
   - Web開発の概念学習
   - 初心者向けプロジェクト

3. **小規模から始めて拡張が不明確**
   - 最小限の依存関係で開始
   - 柔軟な成長パス

---

### 3年目エンジニアへの推奨

**FastAPIを推奨します。理由:**

#### 1. キャリア的観点
- 求人市場で150%増加（2024-2025）
- エンタープライズ採用が拡大中
- AI/ML統合の需要が高い

#### 2. 技術的観点
- モダンなPython機能（型ヒント、非同期）を学べる
- 業界標準のベストプラクティスを習得
- 大規模システムへのスケーラビリティ

#### 3. 実務的観点
- 自動ドキュメント生成でチーム協業が容易
- 型安全性でバグを早期発見
- パフォーマンスが高く、クライアント満足度向上

**ただし、以下の場合はFlaskも検討:**
- 学習コストを最小化したい
- シンプルな内部ツールやプロトタイプ
- 組織がFlask中心のエコシステム

---

### Node.js（React/React.js）フロントエンドとの連携

#### CORS設定（FastAPI）

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS設定（React.jsフロントエンド連携用）
origins = [
    "http://localhost:3000",  # React.js開発サーバー
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 本番では"*"を避ける
    allow_credentials=True,  # Cookie、Authorizationヘッダーを許可
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### React.js側のAPIクライアント

```typescript
// lib/api.ts
const API_BASE_URL = process.env.React_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Cookieを送信
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

#### 型定義の共有

FastAPIは自動的にOpenAPIスキーマを生成するため、TypeScript型定義を自動生成できます：

```bash
# openapi-typescript使用
npx openapi-typescript http://localhost:8000/openapi.json -o types/api.ts
```

```typescript
// React.js側で使用
import type { components } from './types/api';

type User = components['schemas']['User'];
```

---

### まとめ

**2025年時点では、FastAPIが明確に優位です。**

特に以下の理由から3年目エンジニアには強く推奨します。

1. **市場価値**: 求人150%増、エンタープライズ採用拡大
2. **技術トレンド**: AI/ML統合の事実上の標準
3. **開発効率**: 型安全性、自動ドキュメント、高パフォーマンス
4. **キャリア展望**: モダンなPythonスキルを習得

Flaskは依然として価値がありますが、新規プロジェクトではFastAPIを選択することで、より長期的な競争力を確保できます。

**本記事では、Flask と FastAPI 両方のサンプルコードを提供しています。**実際に両方を試して、違いを体感してみてください。

---

## Node.jsフレームワーク選択：Express.js vs Fastify vs NestJS vs Koa（2025年版）

### なぜこの比較が重要なのか

本記事ではNode.js（Express + React）のフルスタックサンプルを提供していますが、Express.jsは2010年リリースの古いフレームワークです。**2025年時点で本当にExpress.jsを選ぶべきか**、それとも新しいフレームワークを検討すべきかは重要な判断です。

---

### パフォーマンス比較

#### ベンチマーク結果（同一ハードウェア）

| フレームワーク | リクエスト/秒 | Express.jsとの比較 |
|---------------|--------------|-------------------|
| **Fastify** | 45,000 | **2-3倍速** |
| **Koa** | 38,000 | 1.7倍速 |
| **NestJS** | 35,000 | 1.6倍速 |
| **Express.js** | 22,000 | 基準 |

**重要な補足:**
データベース処理が絡む場合、単一のSELECT文の処理時間（50-200ms）がフレームワークのオーバーヘッド（1-5ms）を大きく上回るため、実際のアプリケーションではフレームワーク間の性能差は縮小します。

---

### 主要フレームワーク詳細比較

#### 1. Express.js - 業界標準の軽量フレームワーク

**基本思想:**
- **ミニマリズム** - 最小限の機能のみ提供
- **柔軟性** - 開発者が自由に設計できる
- **middleware重視** - 処理をパイプライン化

**コード例:**
```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();

// ミドルウェアチェーン
app.use(express.json());
app.use(cors());

// 認証ミドルウェア
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ルート定義（try-catch必須）
app.get('/api/users', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    // ❌ エラーハンドリングを毎回書く必要がある
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000);
```

**特徴:**

✅ **メリット**
- **最も人気** - npm週間ダウンロード3000万+
- **シンプル** - 5分で基本的なAPIが作れる
- **豊富なミドルウェア** - passport（認証）、helmet（セキュリティ）など
- **求人が多い** - 業界標準、学習すれば仕事に直結
- **ドキュメント豊富** - Stack Overflowに大量の情報

❌ **デメリット**
- **TypeScript対応が弱い** - `req.user` などの拡張が難しい
- **ボイラープレート多い** - 毎回 try-catch を書く
- **バリデーションがない** - 別ライブラリ（Joi、Yup）が必要
- **パフォーマンス** - 最新フレームワークより遅い

**使うべき場面:**
- 小〜中規模プロジェクト（マイクロサービス、REST API）
- チームに初心者がいる
- 既存のExpressプロジェクトがある

---

#### 2. Fastify - 高速・TypeScript重視

**基本思想:**
- **パフォーマンス最優先** - ベンチマークで最速クラス
- **スキーマベース** - JSON Schemaでバリデーション
- **プラグインアーキテクチャ** - 機能を独立したプラグインとして追加

**コード例:**
```typescript
import Fastify from 'fastify';
import { Type, Static } from '@sinclair/typebox';

const fastify = Fastify({
  logger: true // 組み込みロガー
});

// JSON Schemaでバリデーション定義
const UserSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 20 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 })
});

type User = Static<typeof UserSchema>;

// GET /api/users - スキーマでレスポンス型を定義
fastify.get('/api/users', {
  schema: {
    response: {
      200: Type.Object({
        users: Type.Array(UserSchema)
      })
    }
  },
  preHandler: fastify.authenticate
}, async (request, reply) => {
  // ✅ try-catch 不要！Fastifyが自動でエラーハンドリング
  const result = await db.query('SELECT * FROM users');

  // ✅ return するだけでJSON化される
  return { users: result.rows };
});

await fastify.listen({ port: 3000 });
```

**特徴:**

✅ **メリット**
- **高速** - Express.jsの2-3倍速い（JSON処理が最適化）
- **自動バリデーション** - スキーマ違反を自動で400エラー返却
- **TypeScript完全対応** - 型推論が強力
- **組み込みロガー** - pino（高速ロガー）標準搭載
- **エラーハンドリング自動** - async関数のエラーを自動キャッチ

❌ **デメリット**
- **学習コスト** - JSON Schema の知識が必要
- **エコシステム** - Expressより小さい
- **求人** - Expressより少ない

**使うべき場面:**
- 高トラフィックAPI（金融、リアルタイムシステム）
- TypeScriptプロジェクト
- パフォーマンスが重要

**実際の採用例:**
- **Microsoft** - Azure Functions
- **trivago** - ホテル検索API

---

#### 3. NestJS - エンタープライズ向けフルスタックフレームワーク

**基本思想:**
- **Angular風アーキテクチャ** - デコレータ、依存性注入
- **モジュール化** - 機能ごとにモジュール分割
- **オールインワン** - ORM、GraphQL、WebSocket標準サポート

**コード例:**
```typescript
// Controller（ルーティング）
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

@Controller('api/users')
@UseGuards(JwtAuthGuard) // ✅ 認証ガード（全エンドポイントに適用）
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // ✅ @Body() で自動バリデーション（class-validator）
    return this.usersService.create(createUserDto);
  }
}

// Service（ビジネスロジック）
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}

// DTO（バリデーション）
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**特徴:**

✅ **メリット**
- **構造化されたアーキテクチャ** - 大規模プロジェクトでもコードが整理される
- **依存性注入** - テストしやすい、疎結合
- **TypeScript完全対応** - デコレータで型安全
- **豊富な組み込み機能** - TypeORM/Prisma、GraphQL、WebSocket、Swagger
- **バリデーション自動** - class-validator
- **CLI** - `nest generate controller users` でコード生成

❌ **デメリット**
- **学習コスト高** - デコレータ、DI、Angularの概念が必要
- **オーバーエンジニアリング** - 小規模プロジェクトには重い
- **起動が遅い** - リフレクション処理のオーバーヘッド

**使うべき場面:**
- 大規模プロジェクト（50+ エンドポイント）
- チーム開発（10人以上）
- GraphQL API
- マイクロサービス

**実際の採用例:**
- **Adidas** - Eコマースバックエンド
- **Roche** - 医療データプラットフォーム
- **Autodesk** - CADソフトウェアAPI

---

#### 4. Koa - Express.jsの後継、async/await ネイティブ

**基本思想:**
- **Next世代Express** - Express.js作者（TJ Holowaychuk）が作成
- **async/awaitネイティブ** - コールバック地獄を解決
- **軽量** - Expressよりさらにミニマル

**コード例:**
```typescript
import Koa from 'koa';
import Router from '@koa/router';

const app = new Koa();
const router = new Router();

// エラーハンドリングミドルウェア
app.use(async (ctx, next) => {
  try {
    await next(); // 次のミドルウェアを実行
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});

// 認証ミドルウェア
const authenticate = async (ctx: Koa.Context, next: Koa.Next) => {
  const token = ctx.headers['authorization'];
  if (!token) {
    ctx.throw(401, 'Unauthorized'); // ✅ ctx.throw で例外投げる
  }

  const user = await verifyToken(token);
  ctx.state.user = user; // ✅ ctx.state にユーザー情報保存
  await next();
};

// GET /api/users
router.get('/api/users', authenticate, async (ctx) => {
  const result = await db.query('SELECT * FROM users');

  // ✅ ctx.body にセットするだけ
  ctx.body = { users: result.rows };
});

app.use(router.routes());
app.listen(3000);
```

**特徴:**

✅ **メリット**
- **async/await ネイティブ** - Promise チェーンが綺麗
- **軽量** - Expressより小さい（依存関係が少ない）
- **contextオブジェクト** - `ctx.request`, `ctx.response` で統一
- **エラーハンドリング** - `ctx.throw()` で中断できる
- **カスケード処理** - `await next()` でミドルウェアを明示的に制御

❌ **デメリット**
- **エコシステムが小さい** - Expressの1/10のダウンロード数
- **組み込み機能が少ない** - ルーター、ボディパーサーすら別パッケージ
- **求人が少ない** - 日本ではほぼ見かけない

**使うべき場面:**
- Expressの煩雑さを避けたい
- async/await中心のコードを書きたい
- シンプルなマイクロサービス

---

### フレームワーク比較表

| 特徴 | Express.js | Fastify | NestJS | Koa |
|------|-----------|---------|--------|-----|
| **パフォーマンス** | 基準 | 2-3倍速 | 1-1.5倍速 | 1-1.2倍速 |
| **学習コスト** | ⭐️ 低 | ⭐️⭐️ 中 | ⭐️⭐️⭐️⭐️ 高 | ⭐️⭐️ 中 |
| **TypeScript対応** | △ 弱い | ◎ 完全対応 | ◎ 完全対応 | ○ 良好 |
| **バリデーション** | ❌ 手動 | ✅ 自動（JSON Schema） | ✅ 自動（class-validator） | ❌ 手動 |
| **ORM統合** | ❌ なし | △ 別途設定 | ✅ TypeORM/Prisma統合 | ❌ なし |
| **npm週間DL数** | 3000万 | 200万 | 500万 | 100万 |
| **求人数** | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️ |
| **プロジェクト規模** | 小〜中 | 小〜中 | 中〜大 | 小 |
| **リリース年** | 2010 | 2016 | 2017 | 2013 |

---

### 使い分けの基準（2025年版）

#### Express.jsを選ぶべき場合
- 小〜中規模プロジェクト（マイクロサービス、REST API）
- チームに初心者がいる
- 既存のExpressプロジェクトがある
- **学習目的** - Web開発の基礎を学ぶ

#### Fastifyを選ぶべき場合（推奨）
- 高トラフィックAPI（金融、リアルタイムシステム）
- TypeScriptプロジェクト
- パフォーマンスが重要
- **本番運用の新規プロジェクト**

#### NestJSを選ぶべき場合
- 大規模プロジェクト（50+ エンドポイント）
- チーム開発（10人以上）
- GraphQL API
- マイクロサービス

#### Koaを選ぶべき場合
- Expressの煩雑さを避けたい
- async/await中心のコードを書きたい
- シンプルなマイクロサービス

---

### 3年目エンジニアへの推奨（Node.js）

**このリポジトリではExpress.jsサンプルを提供していますが、新規プロジェクトでは以下を推奨します:**

#### 推奨順位（2025年）:
1. **Fastify** - パフォーマンスとTypeScript対応のバランスが良い
2. **NestJS** - 大規模プロジェクトなら最適
3. **Express.js** - 学習・小規模プロジェクト
4. **Koa** - ニッチな用途

#### Express.jsを学ぶ価値はあるか？

**YES - 以下の理由で依然として価値があります:**

1. **基礎理解** - Webフレームワークの基本概念を学べる
2. **求人市場** - 依然として最も求人が多い
3. **エコシステム** - 既存プロジェクトの保守・改修ニーズ
4. **学習コスト** - 5分で動くものが作れる、挫折しにくい

**ただし、本番運用の新規プロジェクトではFastifyやNestJSを検討すべきです。**

---

### まとめ（Node.jsフレームワーク）

**Express.jsは2010年からの歴史があり、依然として業界標準ですが、2025年時点では以下の状況です:**

- **学習・小規模プロジェクト**: Express.js が最適
- **本番運用・新規プロジェクト**: Fastify を推奨
- **大規模・エンタープライズ**: NestJS を推奨

**本記事のNode.js（Express + React）サンプルは、学習用として最適な構成です。**実際のプロジェクトでは、要件に応じてフレームワークを選択してください。

---

## 実践：プロジェクトのコンテナ化

ここからは、実際のプロジェクトをDev Containersでコンテナ化する手順を、具体的に解説します。

### 初めてのDev Container: サンプルプロジェクトで試す

**まずは公式サンプルで動作を体験することを強く推奨します。**

#### 手順

1. VSCodeを起動
2. **`F1`** でコマンドパレットを開く
3. 「**Dev Containers: Try a Dev Container Sample**」と入力して選択
4. サンプル一覧から **Node.js** を選択
5. コンテナのビルドを待つ（初回は5〜10分）
6. ビルド完了後、以下を確認：
   - ステータスバー左下に「**Dev Container: Node.js**」と表示
   - ターミナルで `node --version` と入力し、Node.js v18がインストール済みを確認
7. **`F5`** キーでアプリケーション起動
8. ブラウザで `http://localhost:3000` にアクセス
9. Node.jsサーバーが稼働していることを確認

**終了方法：**
- メニュー → **ファイル** → **リモート接続を閉じる**

---

### 既存プロジェクトのコンテナ化（Node.js + PostgreSQL 例）

**完全に動作するNode.js + PostgreSQL + Redisのサンプルは [examples/nodejs-postgres/](examples/nodejs-postgres/) で提供しています。**
- 📖 詳細ドキュメント: [examples/nodejs-postgres/README.md](examples/nodejs-postgres/README.md)
- **フルスタック構成**: Express + TypeScript + React 19 + Vite 6 + Tailwind CSS
- **JWT認証**: ログイン/新規登録UI、トークン管理、認証ガード実装済み
- **データベース**: PostgreSQL + Redis統合、リアルなCRUD操作
- **デフォルトユーザー**: username=testuser, password=password123
- 詳細なテスト手順とトラブルシューティング

以下は、その構成を解説したものです。

#### プロジェクト構成

```
my-project/
├── .devcontainer/
│   ├── devcontainer.json
│   └── docker-compose.yml
├── src/
│   ├── index.ts
│   └── ...
├── Dockerfile
├── docker-compose.yml       # 本番環境用
├── package.json
└── tsconfig.json
```

---

#### ステップ1: Dockerfileの作成

##### Multi-Stage Dockerfile（開発と本番を1つで管理）

`Dockerfile` を作成：

```dockerfile
# ==========================================
# Stage 1: Base（共通ベース）
# ==========================================
FROM node:20-bullseye AS base

WORKDIR /workspace

# ==========================================
# Stage 2: Development（開発環境）
# ==========================================
FROM base AS development

# 開発ツールのインストール
RUN apt-get update && apt-get install -y \
    git \
    vim \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# グローバルツールのインストール
RUN npm install -g typescript ts-node nodemon

# パッケージファイルのコピー
COPY package*.json ./

# 開発用依存関係を含めてインストール
RUN npm install

# ソースコードのコピー
COPY . .

# 開発用ポート
EXPOSE 3000
EXPOSE 9229

# ホットリロード対応
CMD ["npm", "run", "dev"]

# ==========================================
# Stage 3: Production（本番環境）
# ==========================================
FROM base AS production

# 本番用依存関係のみインストール
COPY package*.json ./
RUN npm ci --only=production

# ソースコードとビルド
COPY . .
RUN npm run build

# 非rootユーザーで実行（セキュリティ）
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /workspace
USER appuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

#### ステップ2: 開発環境用 Docker Compose

`.devcontainer/docker-compose.yml` を作成：

```yaml
version: '3.8'

services:
  # アプリケーション（開発環境）
  app:
    build:
      context: ..
      dockerfile: Dockerfile
      target: development  # developmentステージを使用
    volumes:
      # ソースコードのホットリロード
      - ..:/workspace:cached
      # node_modulesはボリュームで保持（パフォーマンス向上）
      - node_modules:/workspace/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # デバッグ用
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  # PostgreSQLデータベース
  db:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis（キャッシュ）
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  node_modules:
  postgres_data:
  redis_data:
```

---

#### ステップ3: devcontainer.jsonの作成

`.devcontainer/devcontainer.json` を作成：

```json
{
  "name": "Node.js Fullstack Development",

  // Docker Composeを使用
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",

  // ポート転送（ローカルからアクセス可能に）
  "forwardPorts": [3000, 5433, 6379],
  "portsAttributes": {
    "3000": {
      "label": "Application",
      "onAutoForward": "notify"
    },
    "5433": {
      "label": "PostgreSQL"
    },
    "6379": {
      "label": "Redis"
    }
  },

  // Features（追加ツール）
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {
      "version": "latest"
    }
  },

  // VSCode拡張機能
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "prisma.prisma",
        "mtxr.sqltools",
        "mtxr.sqltools-driver-pg"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        "[typescript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "sqltools.connections": [
          {
            "name": "PostgreSQL",
            "driver": "PostgreSQL",
            "server": "db",
            "port": 5433,
            "database": "myapp",
            "username": "postgres",
            "password": "postgres"
          }
        ]
      }
    }
  },

  // ライフサイクルコマンド
  "postCreateCommand": "npm install",
  "postStartCommand": "npm run db:migrate",

  // コンテナ内の実行ユーザー
  "remoteUser": "node",

  // VSCode終了時にコンテナを停止
  "shutdownAction": "stopCompose"
}
```

---

#### ステップ4: コンテナで開発環境を起動

1. VSCodeでプロジェクトフォルダを開く
2. **`F1`** → 「**Dev Containers: Reopen in Container**」
3. 初回ビルドを待つ（5〜10分）
4. ビルド完了後、以下を確認：
   - ステータスバー左下: 「Dev Container: Node.js Fullstack Development」
   - ターミナルで `node --version`、`npm --version` を確認
   - `psql --version` でPostgreSQLクライアント確認

##### 開発開始

コンテナ内のターミナルで：

```bash
# 依存関係は既にインストール済み
# 開発サーバー起動
npm run dev

# データベースマイグレーション
npm run db:migrate

# テスト実行
npm test
```

ブラウザで `http://localhost:3000` にアクセスして動作確認。

##### デバッグ

1. `.vscode/launch.json` を作成（コンテナ内で）
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

2. **`F5`** キーでデバッグ開始
3. ブレークポイントを設定して動作確認

---

### Python（Flask / FastAPI）での Dev Container例

**このリポジトリでは、3つの本格的なサンプルプロジェクトを提供しています：**

1. **Node.js + PostgreSQL + Redis**: Express + React フルスタック開発
   - サンプルコード: [examples/nodejs-postgres/](examples/nodejs-postgres/)
   - 📖 詳細ドキュメント: [examples/nodejs-postgres/README.md](examples/nodejs-postgres/README.md)
   - Express + TypeScript、React + Vite、PostgreSQL、Redis統合
   - リアルタイムデータベース接続テスト

2. **FastAPI + React + PostgreSQL**: フルスタック開発 + JWT認証（2025年推奨）
   - サンプルコード: [examples/python-fastapi/](examples/python-fastapi/)
   - 📖 詳細ドキュメント: [examples/python-fastapi/README.md](examples/python-fastapi/README.md)
   - **React 19 + Vite 6** フロントエンド（Tailwind CSS）
   - **JWT認証UI** 完全統合（ログイン/新規登録フォーム）
   - **PostgreSQL統合済み** (SQLAlchemy 2.0 + asyncpg)
   - Swagger UI、完全な型安全性、認証ガード

3. **Flask + React + PostgreSQL**: フルスタック開発 + JWT認証（学習向け）
   - サンプルコード: [examples/python-flask/](examples/python-flask/)
   - 📖 詳細ドキュメント: [examples/python-flask/README.md](examples/python-flask/README.md)
   - **React 19 + Vite 6** フロントエンド（Tailwind CSS）
   - **JWT認証UI** 完全統合（ログイン/新規登録フォーム）
   - **PostgreSQL統合済み** (Flask-SQLAlchemy)
   - シンプルで理解しやすい構成、学習に最適

**すべてのサンプルに共通する特徴：**
- ✅ 本物のPostgreSQLデータベース統合（モックではない）
- ✅ 詳細なテスト手順と期待される出力の記載
- ✅ Dev Container対応（即座に開発開始可能）
- ✅ Multi-stage Dockerfile（開発・本番環境対応）
- ✅ 完全な動作サンプルとドキュメント

**どれを選ぶべきか？**
- Node.js経験者 → [nodejs-postgres](examples/nodejs-postgres/)
- 本番環境のPython API → [python-fastapi](examples/python-fastapi/)
- Pythonを初めて学ぶ → [python-flask](examples/python-flask/)
- 詳細な比較 → [Flask vs FastAPI 比較セクション](#pythonフレームワーク選択flask-vs-fastapi2025年版)

---

#### FastAPIサンプルの特徴

FastAPIサンプルは、**フルスタック開発環境**として、React フロントエンドと FastAPI バックエンドが完全統合されています：

**ファイル構成:**
```
examples/python-fastapi/
├── client/           # Reactフロントエンド
│   ├── src/
│   │   ├── components/  # Login, UserList, ItemList
│   │   ├── App.tsx      # 認証状態管理
│   │   └── api.ts       # JWT トークン管理
│   └── vite.config.ts   # Vite設定（APIプロキシ）
├── main.py           # FastAPIアプリケーション（JWT認証付き）
├── database.py       # SQLAlchemy非同期エンジンとセッション管理
├── models.py         # データベーステーブル定義（User、Item）
├── crud.py           # データベースCRUD操作（非同期）
├── init_db.py        # データベース初期化スクリプト
├── package.json      # npm依存関係（React, Vite, Tailwind）
├── requirements.txt  # Python本番用依存関係
└── .devcontainer/    # Dev Container設定
    ├── devcontainer.json
    └── docker-compose.yml
```

**データベーステーブル:**
- **users**: id, email, username, hashed_password, is_active, created_at, updated_at
- **items**: id, title, description, price, owner_id, created_at, updated_at

**主要機能:**
- ✅ **React 19 + Vite 6** フロントエンド（Tailwind CSS）
- ✅ **JWT認証UI** - ログイン/新規登録フォーム完備
- ✅ **認証ガード** - トークンベースのルーティング保護
- ✅ PostgreSQL統合 (SQLAlchemy 2.0 + asyncpg)
- ✅ JWT認証（バックエンド - Bearer トークン）
- ✅ Pydantic V2による型安全なバリデーション
- ✅ 自動生成されるAPI ドキュメント（Swagger UI / ReDoc）
- ✅ CORS設定済み（React Vite + React.js連携対応）
- ✅ Ruff linter（2025年推奨）

**セットアップ手順:**
```bash
# 1. Dev Container起動後、データベース初期化（初回のみ）
python init_db.py

# 2. フロントエンド起動（別ターミナル）
npm run dev
```

これにより以下が作成されます：
- データベーステーブル（users、items）
- テストユーザー（username: testuser, password: password123）

**動作確認:**

**React UIで確認（推奨）:**
1. ブラウザで http://localhost:5173 を開く
2. デフォルトユーザーでログイン: `testuser` / `password123`
3. ユーザー情報タブ、アイテム管理タブで機能を確認

**API ドキュメント:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**curlで確認:**
```bash
# ヘルスチェック
curl http://localhost:8000/health

# ユーザー登録
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser2","password":"password123"}'

# ログイン（トークン取得）
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123"
```

---

#### Flaskサンプルの特徴

Flaskサンプルは、**フルスタック開発環境**として、React フロントエンドと Flask バックエンドが完全統合されています。FastAPIサンプルと同様の機能を持ちつつ、シンプルで学習しやすい構成になっています。

**ファイル構成:**
```
examples/python-flask/
├── client/           # Reactフロントエンド
│   ├── src/
│   │   ├── components/  # Login, UserList, ItemList
│   │   ├── App.tsx      # 認証状態管理
│   │   └── api.ts       # JWT トークン管理
│   └── vite.config.ts   # Vite設定（APIプロキシ）
├── app.py            # Flaskアプリケーション本体（JWT認証付き）
├── init_db.py        # データベース初期化スクリプト
├── package.json      # npm依存関係（React, Vite, Tailwind）
├── requirements.txt  # Python依存関係
└── .devcontainer/    # Dev Container設定
    ├── devcontainer.json
    └── docker-compose.yml
```

**データベーステーブル:**
- **users**: id, username, email, password_hash, is_active, created_at
- **items**: id, title, description, price, owner_id, created_at

**主要機能:**
- ✅ **React 19 + Vite 6** フロントエンド（Tailwind CSS）
- ✅ **JWT認証UI** - ログイン/新規登録フォーム完備
- ✅ **認証ガード** - トークンベースのルーティング保護
- ✅ PostgreSQL統合 (Flask-SQLAlchemy)
- ✅ JWT認証（バックエンド - Bearer トークン）
- ✅ パスワードハッシュ化（Flask-Bcrypt）
- ✅ CORS設定済み（React Vite連携対応）
- ✅ RESTful API（GET, POST, PUT, DELETE）
- ✅ ページネーション対応
- ✅ シンプルな構成（学習に最適）

**セットアップ手順:**
```bash
# 1. Dev Container起動後、データベース初期化（初回のみ）
python init_db.py

# 2. フロントエンド起動（別ターミナル）
npm run dev
```

これにより以下が作成されます：
- データベーステーブル（users、items）
- テストユーザー（username: testuser, password: password123）

**動作確認:**

**React UIで確認（推奨）:**
1. ブラウザで http://localhost:5173 を開く
2. デフォルトユーザーでログイン: `testuser` / `password123`
3. ユーザー情報タブ、アイテム管理タブで機能を確認

**API直接テスト:**
```bash
# ヘルスチェック
curl http://localhost:5001/health

# データベース接続テスト
curl http://localhost:5001/api/db-test

# ユーザー登録（JWTトークン付与）
curl -X POST "http://localhost:5001/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'

# ログイン（JWTトークン取得）
curl -X POST "http://localhost:5001/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

詳細は [Flask サンプルREADME](examples/python-flask/README.md) を参照してください。

---

以下、Flaskの例を示します。Flaskはシンプルで学習しやすいフレームワークです。

#### Dockerfile

```dockerfile
FROM python:3.11-slim AS development

WORKDIR /workspace

# 開発ツール
RUN apt-get update && apt-get install -y \
    git \
    vim \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 依存関係インストール
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
```

#### devcontainer.json

```json
{
  "name": "Python Flask Development",
  "build": {
    "dockerfile": "../Dockerfile",
    "target": "development"
  },
  "forwardPorts": [5001],
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-python.black-formatter"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python",
        "python.linting.enabled": true,
        "python.linting.pylintEnabled": true,
        "python.formatting.provider": "black"
      }
    }
  },
  "postCreateCommand": "pip install -r requirements.txt"
}
```

---

## 本番環境へのデプロイ

Dev Containersで開発した環境を、本番環境にデプロイする手順を解説します。

### 本番用Dockerイメージのビルド

#### Multi-Stageの "production" ステージを使用

```bash
# productionステージをターゲットにビルド
docker build --target production -t myapp:latest .

# イメージサイズの確認
docker images myapp:latest
```

**開発環境との違い：**
- 開発ツール（git、vim、debuggerなど）を含まない
- `npm ci --only=production` で本番用依存関係のみ
- 非rootユーザーで実行（セキュリティ）
- イメージサイズが小さい（Alpine Linuxベース）

---

### 本番用 Docker Compose

#### docker-compose.yml（ベース）

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production  # 本番ステージ
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### docker-compose.prod.yml（本番用オーバーライド）

```yaml
version: '3.8'

services:
  app:
    ports:
      - "80:3000"
    environment:
      - LOG_LEVEL=error
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  db:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    command: redis-server --maxmemory 512mb
    deploy:
      resources:
        limits:
          memory: 512M

  # Nginxリバースプロキシ
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: always
```

---

### デプロイ手順

#### ローカルでの本番環境テスト

```bash
# ベース + 本番用オーバーライドで起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ログ確認
docker compose logs -f app

# 動作確認
curl http://localhost/health

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

#### CI/CD: GitHub Actions による自動デプロイ

`.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # テスト
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build dev container
        run: docker build --target development -t test-image .

      - name: Run tests
        run: docker run test-image npm test

  # ビルド
  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build production image
        run: |
          docker build --target production \
            -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
            .

      - name: Push images
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest

  # デプロイ
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/myapp
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            docker system prune -f
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. コンテナが起動しない

**症状:** 「Dev Containers: Reopen in Container」を実行してもエラーが出る

**確認事項:**
```bash
# Docker Desktopが起動しているか確認
docker ps

# Dockerコンテキストの確認
docker context list
docker context use default

# ディスク容量の確認
docker system df
```

**解決方法:**
- Docker Desktopを再起動
- 不要なコンテナ・イメージを削除: `docker system prune -a`
- `.devcontainer/devcontainer.json` の構文エラーを確認（JSON Lintで検証）

---

#### 2. ポートがすでに使用されている

**症状:** `Error: listen EADDRINUSE: address already in use :::3000`

**確認方法:**
```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :3000

# ポート使用状況確認（Windows）
netstat -ano | findstr :3000
```

**解決方法:**
- `devcontainer.json` の `forwardPorts` を別のポートに変更
- または、既存のプロセスを終了

---

#### 3. コンテナ内で拡張機能が動作しない

**症状:** ESLintやPrettierが効かない

**解決方法:**
1. `devcontainer.json` の `extensions` 配列に拡張機能IDを追加
2. コンテナを再構築: `F1` → 「Dev Containers: Rebuild Container」
3. 拡張機能パネルで「コンテナ内にインストール」をクリック

---

#### 4. ボリュームマウントが遅い（macOS/Windows）

**症状:** ファイル保存時の反映が遅い

**解決方法:**
- `docker-compose.yml` のボリュームに `:cached` オプションを追加
```yaml
volumes:
  - ..:/workspace:cached
```
- または、Dev Container Clone in Volume を使用（ボリューム専用コンテナ）
  - `F1` → 「Dev Containers: Clone Repository in Container Volume」

---

#### 5. データベース接続エラー

**症状:** `ECONNREFUSED` または `Cannot connect to database`

**確認事項:**
```bash
# コンテナが起動しているか
docker ps

# ヘルスチェック確認
docker inspect <container_name> | grep Health

# データベース接続テスト
docker exec -it <db_container> psql -U postgres
```

**解決方法:**
- `docker-compose.yml` の `depends_on` に `condition: service_healthy` を追加
- データベースの起動を待つコマンドを `postStartCommand` に追加

---

#### 6. コンテナ再構築後に node_modules が消える

**症状:** `npm install` が毎回必要

**解決方法:**
- `docker-compose.yml` で `node_modules` を名前付きボリュームで管理
```yaml
volumes:
  - ..:/workspace
  - node_modules:/workspace/node_modules  # 永続化

volumes:
  node_modules:
```

---

#### 7. Dev ContainerとDocker拡張機能のコンテナが重複表示される

**症状:** 同じコンテナが2つ表示される

**説明:**
- これは正常な動作です
- Dev Containersは開発環境として接続
- Docker拡張機能は管理用として表示

**使い分け:**
- 開発: Dev Containersで接続
- ログ確認・デバッグ: Docker拡張機能で操作

---

### デバッグのヒント

#### ビルドログの確認

```bash
# コンテナのビルドログを詳細表示
docker compose -f .devcontainer/docker-compose.yml build --no-cache --progress=plain
```

#### コンテナ内での手動確認

```bash
# コンテナに直接接続
docker exec -it <container_name> /bin/bash

# 環境変数の確認
env

# 依存関係の確認
npm list  # Node.js
pip list  # Python
```

---

## まとめ

### VSCode + Docker 開発環境のメリット

- ✅ **環境構築時間の短縮**: 新メンバーも即座に開発開始可能
- ✅ **本番環境との一致**: 「ローカルでは動いたのに」問題の解消
- ✅ **チーム全員が同一環境**: OS依存の問題を排除
- ✅ **複数プロジェクトの切り替えが容易**: プロジェクトごとに独立した環境
- ✅ **GUI操作で直感的**: Docker拡張機能でコマンドレスに管理

### 2つの拡張機能の役割

| 拡張機能 | 役割 | 主な使用場面 |
|---------|------|-------------|
| **Dev Containers** | コンテナ内で開発 | 日常の開発作業 |
| **Docker** | Dockerを管理 | コンテナ・イメージの操作、デバッグ |

### React Steps

1. **今すぐ試す:**
   - Docker Desktopをインストール
   - VSCode拡張機能をインストール
   - `Dev Containers: Try a Dev Container Sample` でNode.jsサンプルを起動

2. **既存プロジェクトに適用:**
   - `.devcontainer/devcontainer.json` を作成
   - プロジェクトの依存関係に合わせてカスタマイズ
   - チームメンバーと共有

3. **本番環境への適用:**
   - Multi-Stage Dockerfileで開発と本番を統一
   - GitHub Actionsで自動デプロイパイプライン構築

---

### 参考リンク

**公式ドキュメント:**
- [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Containers Tutorial](https://code.visualstudio.com/docs/devcontainers/tutorial)
- [VSCode Docker Extension](https://code.visualstudio.com/docs/containers/overview)
- [Docker公式ドキュメント](https://docs.docker.com/)

**Dev Container仕様:**
- [Dev Container Features](https://containers.dev/features)
- [Dev Container Templates](https://containers.dev/templates)

**ベストプラクティス:**
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose Best Practices](https://docs.docker.com/compose/production/)

---

#### データ出典

本記事で引用した数値データの出典：

[^1]: **FastAPI PyPI月間ダウンロード数（約214百万/月）**
PyPI Stats - FastAPI Package Statistics
https://pypistats.org/packages/fastapi

[^2]: **FastAPI求人市場150%増加（2024-2025）**
Freelance Start - FastAPIスキル求人動向
https://freelance-start.com/jobs/skill-505
※2024年から2025年にかけて、FastAPI案件が月次平均21%増、6ヶ月で約2倍の成長を記録

[^3]: **主要採用企業（Uber, Microsoft, Netflix）**
Planeks - Companies Using FastAPI
https://www.planeks.net/companies-using-fastapi/
※Uber（Ludwig）、Microsoft（Azure Functions）、Netflix（Dispatch）などでの採用事例

[^4]: **レガシー企業の45%がAI統合にFastAPIを選択**
Medium - Legacy Companies in the AI Era: Why FastAPI is the Key
https://medium.com/@sausi/legacy-companies-in-the-ai-era-why-fastapi-is-the-key-to-python-integration-2be089d8fb8c

[^5]: **パフォーマンスベンチマーク（FastAPI: 15,000-20,000 req/sec）**
FastAPI公式ドキュメント - Benchmarks
https://fastapi.tiangolo.com/benchmarks/
※Uvicorn + FastAPIでの標準的なベンチマーク結果。実際の性能はハードウェアと実装により変動

---

**作成日**: 2025-11-21
**対象読者**: 3年目エンジニア、開発チームリーダー
**想定読了時間**: 40分
**実践時間**: 初回セットアップ 2時間、既存プロジェクト適用 4〜8時間
