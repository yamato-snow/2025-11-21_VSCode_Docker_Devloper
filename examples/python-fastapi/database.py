"""
データベース設定（SQLAlchemy 2.0 + asyncpg）
"""
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# 環境変数からDATABASE_URLを取得
# postgresql:// → postgresql+asyncpg:// に変換
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/fastapi_db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 非同期エンジンの作成
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # SQLログを出力（開発環境）
    future=True,
)

# 非同期セッションメーカー
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Baseクラス（すべてのモデルの基底クラス）
class Base(DeclarativeBase):
    pass


# 依存性注入用のセッション取得関数
async def get_db():
    """
    データベースセッションを取得する依存関数
    FastAPIのDependsで使用
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
