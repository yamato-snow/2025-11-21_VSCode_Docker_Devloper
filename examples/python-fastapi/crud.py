"""
データベースCRUD操作（Create, Read, Update, Delete）
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import models


# ==========================================
# ユーザー関連CRUD
# ==========================================

async def get_user_by_username(db: AsyncSession, username: str):
    """ユーザー名でユーザーを取得"""
    result = await db.execute(
        select(models.User).where(models.User.username == username)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    """メールアドレスでユーザーを取得"""
    result = await db.execute(
        select(models.User).where(models.User.email == email)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int):
    """IDでユーザーを取得"""
    result = await db.execute(
        select(models.User).where(models.User.id == user_id)
    )
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, username: str, email: str, hashed_password: str):
    """新規ユーザーを作成"""
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_active=True,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """ユーザー一覧を取得"""
    result = await db.execute(
        select(models.User).offset(skip).limit(limit)
    )
    return result.scalars().all()


# ==========================================
# アイテム関連CRUD
# ==========================================

async def get_items(db: AsyncSession, skip: int = 0, limit: int = 100):
    """アイテム一覧を取得"""
    result = await db.execute(
        select(models.Item).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_item_by_id(db: AsyncSession, item_id: int):
    """IDでアイテムを取得"""
    result = await db.execute(
        select(models.Item).where(models.Item.id == item_id)
    )
    return result.scalar_one_or_none()


async def get_items_by_owner(db: AsyncSession, owner_id: int, skip: int = 0, limit: int = 100):
    """特定ユーザーのアイテムを取得"""
    result = await db.execute(
        select(models.Item)
        .where(models.Item.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_item(db: AsyncSession, title: str, description: str | None, price: float, owner_id: int):
    """新規アイテムを作成"""
    db_item = models.Item(
        title=title,
        description=description,
        price=price,
        owner_id=owner_id,
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def update_item(db: AsyncSession, item_id: int, title: str | None = None, description: str | None = None, price: float | None = None):
    """アイテムを更新"""
    db_item = await get_item_by_id(db, item_id)
    if not db_item:
        return None

    if title is not None:
        db_item.title = title
    if description is not None:
        db_item.description = description
    if price is not None:
        db_item.price = price

    await db.commit()
    await db.refresh(db_item)
    return db_item


async def delete_item(db: AsyncSession, item_id: int):
    """アイテムを削除"""
    db_item = await get_item_by_id(db, item_id)
    if not db_item:
        return None

    await db.delete(db_item)
    await db.commit()
    return db_item
