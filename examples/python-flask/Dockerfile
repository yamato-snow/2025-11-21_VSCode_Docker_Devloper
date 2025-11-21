# ==========================================
# Multi-Stage Dockerfile for Python Flask
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
EXPOSE 5000

# Flask開発サーバー起動
CMD ["flask", "run", "--host=0.0.0.0", "--debug"]

# ==========================================
# Stage 2: Production
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

# 依存関係ファイルのコピー
COPY requirements.txt ./

# 本番用依存関係のみインストール
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# ソースコードのコピー
COPY --chown=appuser:appuser . .

# 非rootユーザーで実行
USER appuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000

# Gunicornで本番サーバー起動
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
