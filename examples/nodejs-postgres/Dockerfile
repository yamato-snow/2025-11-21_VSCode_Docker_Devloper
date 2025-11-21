# ==========================================
# Multi-Stage Dockerfile
# 開発環境と本番環境を1つのファイルで管理
# ==========================================

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
    wget \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# グローバルツールのインストール
RUN npm install -g typescript ts-node nodemon

# パッケージファイルのコピー（存在する場合）
# Dev Containersではボリュームマウントで上書きされるため、
# 初回ビルド時のみ有効
COPY package*.json ./

# 開発用依存関係を含めてインストール
# Dev Containersの場合は postCreateCommand で再実行される
RUN npm install || echo "npm install failed, will retry in postCreateCommand"

# ソースコードのコピー（ボリュームマウントで上書きされる）
COPY . .

# 開発用ポート
EXPOSE 3000
EXPOSE 9229

# ホットリロード対応のコマンド
# Dev Containersではこのコマンドは使用されず、
# docker-compose.ymlの command が優先される
CMD ["npm", "run", "dev"]

# ==========================================
# Stage 3: Build（ビルド専用ステージ）
# ==========================================
FROM base AS build

WORKDIR /workspace

# パッケージファイルのコピーと本番用依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

# ソースコードのコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# ==========================================
# Stage 4: Production（本番環境）
# ==========================================
FROM node:20-alpine AS production

# 非rootユーザーの作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /workspace

# ビルド成果物と依存関係のコピー
COPY --from=build --chown=nodejs:nodejs /workspace/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /workspace/dist ./dist
COPY --from=build --chown=nodejs:nodejs /workspace/package*.json ./

# 非rootユーザーで実行
USER nodejs

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
