#!/usr/bin/env python3
"""
データベース初期化スクリプト

使い方:
    python init_db.py
"""
import asyncio
from passlib.context import CryptContext

from database import engine, Base, AsyncSessionLocal
import models
import crud

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def init_database():
    """データベースとテーブルを初期化"""
    print("=" * 60)
    print("データベース初期化を開始...")
    print("=" * 60)

    # テーブル作成
    async with engine.begin() as conn:
        print("テーブルを作成中...")
        await conn.run_sync(Base.metadata.drop_all)  # 既存テーブル削除（開発環境のみ）
        await conn.run_sync(Base.metadata.create_all)
        print("✅ テーブル作成完了")

    # 初期データの投入
    async with AsyncSessionLocal() as session:
        print("\n初期データを投入中...")

        # テストユーザーの作成
        existing_user = await crud.get_user_by_username(session, "testuser")
        if not existing_user:
            hashed_password = pwd_context.hash("password123")
            test_user = await crud.create_user(
                db=session,
                username="testuser",
                email="test@example.com",
                hashed_password=hashed_password,
            )
            print(f"✅ テストユーザー作成: {test_user.username} (ID: {test_user.id})")
        else:
            print(f"ℹ️  テストユーザー既存: {existing_user.username}")

    print("\n" + "=" * 60)
    print("データベース初期化完了！")
    print("=" * 60)
    print("\nデフォルトユーザー:")
    print("  username: testuser")
    print("  password: password123")
    print("\nSwagger UI でテスト:")
    print("  http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(init_database())
