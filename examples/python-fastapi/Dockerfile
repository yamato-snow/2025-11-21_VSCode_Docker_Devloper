# ==========================================
# Multi-Stage Dockerfile for FastAPI
# 2025年版ベストプラクティス準拠
# ==========================================

# ==========================================
# Stage 1: Development
# ==========================================
FROM python:3.11-slim AS development

WORKDIR /workspace

# 開発ツールのインストール
RUN apt-get update && apt-get install -y \
    git \
    vim \
    curl \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルのコピー
COPY requirements.txt requirements-dev.txt ./

# 開発用依存関係を含めてインストール
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# ソースコードのコピー
COPY . .

# 開発用ポート
EXPOSE 8000

# FastAPI開発サーバー起動（ホットリロード有効）
CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0", "--port", "8000"]

# ==========================================
# Stage 2: Builder（本番用依存関係のビルド）
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# 依存関係ファイルのコピー
COPY requirements.txt ./

# 本番用依存関係のみインストール（ユーザーディレクトリに）
RUN pip install --no-cache-dir --user -r requirements.txt

# ==========================================
# Stage 3: Production
# ==========================================
FROM python:3.11-slim AS production

# 非rootユーザーの作成
RUN useradd -m -u 1001 appuser

WORKDIR /app

# 必要な実行時パッケージのみインストール
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ビルダーステージから依存関係をコピー
COPY --from=builder /root/.local /home/appuser/.local

# ソースコードのコピー
COPY --chown=appuser:appuser . .

# 非rootユーザーで実行
USER appuser

# PATHに.localを追加
ENV PATH=/home/appuser/.local/bin:$PATH

# Pythonの最適化設定
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# 本番サーバー起動（fastapi run使用 - 2025年推奨）
# --workersオプションで複数ワーカー対応
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
