"""
FastAPI サンプルアプリケーション
Node.js（Next.js）フロントエンド連携を想定したバックエンドAPI

動作確認:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health
"""

from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
import os

# ==========================================
# 設定
# ==========================================
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# CORS設定（環境変数から取得）
CORS_ORIGINS_STR = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
)
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

# ==========================================
# セキュリティ
# ==========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ==========================================
# Pydanticモデル（スキーマ定義）
# ==========================================
class UserBase(BaseModel):
    """ユーザーベーススキーマ"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    """ユーザー作成スキーマ"""
    password: str = Field(..., min_length=8)


class User(UserBase):
    """ユーザーレスポンススキーマ"""
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True


class Token(BaseModel):
    """トークンレスポンススキーマ"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """トークンペイロードスキーマ"""
    username: str | None = None


class ItemBase(BaseModel):
    """アイテムベーススキーマ"""
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    price: float = Field(..., gt=0)


class ItemCreate(ItemBase):
    """アイテム作成スキーマ"""
    pass


class Item(ItemBase):
    """アイテムレスポンススキーマ"""
    id: int
    owner_id: int

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """ヘルスチェックレスポンス"""
    status: str
    timestamp: datetime
    environment: str


# ==========================================
# データベース（モック）
# ==========================================
# 実際のアプリケーションではSQLAlchemyやSQLModelを使用
fake_users_db = {
    "testuser": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("password123"),
        "is_active": True,
    }
}

fake_items_db: list[dict] = []

# ==========================================
# ユーティリティ関数
# ==========================================
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワード検証"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """パスワードハッシュ化"""
    return pwd_context.hash(password)


def get_user(username: str):
    """ユーザー取得（DB）"""
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return user_dict
    return None


def authenticate_user(username: str, password: str):
    """ユーザー認証"""
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """JWTアクセストークン作成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """現在のユーザー取得（依存関数）"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """アクティブユーザー取得（依存関数）"""
    if not current_user.get("is_active"):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# ==========================================
# FastAPIアプリケーション
# ==========================================
app = FastAPI(
    title="FastAPI Backend API",
    description="Node.js（Next.js）フロントエンド連携を想定したバックエンドAPI",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# ==========================================
# CORS設定（Next.jsフロントエンド連携用）
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,  # 本番では具体的なドメインを指定
    allow_credentials=True,  # Cookie、Authorizationヘッダーを許可
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)

# ==========================================
# エンドポイント
# ==========================================

@app.get("/", tags=["Root"])
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Welcome to FastAPI Backend API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """ヘルスチェックエンドポイント"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        environment=os.getenv("ENVIRONMENT", "production"),
    )


@app.post("/token", response_model=Token, tags=["Authentication"])
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    ログインエンドポイント（JWT トークン発行）

    デフォルトユーザー:
    - username: testuser
    - password: password123
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/users/me", response_model=User, tags=["Users"])
async def read_users_me(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """現在のユーザー情報取得（認証必須）"""
    return User(**current_user)


@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(user: UserCreate):
    """ユーザー登録"""
    if user.username in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed_password = get_password_hash(user.password)
    new_user_id = len(fake_users_db) + 1
    user_dict = {
        "id": new_user_id,
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "is_active": True,
    }
    fake_users_db[user.username] = user_dict
    return User(**user_dict)


@app.get("/items", response_model=list[Item], tags=["Items"])
async def read_items(
    skip: int = 0,
    limit: int = 10,
    current_user: Annotated[dict, Depends(get_current_active_user)] = None,
):
    """アイテム一覧取得（認証必須）"""
    return fake_items_db[skip : skip + limit]


@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED, tags=["Items"])
async def create_item(
    item: ItemCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """アイテム作成（認証必須）"""
    new_item_id = len(fake_items_db) + 1
    item_dict = {
        "id": new_item_id,
        "owner_id": current_user["id"],
        **item.model_dump(),
    }
    fake_items_db.append(item_dict)
    return Item(**item_dict)


@app.get("/items/{item_id}", response_model=Item, tags=["Items"])
async def read_item(
    item_id: int,
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """アイテム詳細取得（認証必須）"""
    for item in fake_items_db:
        if item["id"] == item_id:
            return Item(**item)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found",
    )


# ==========================================
# 起動時の情報表示
# ==========================================
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    print("=" * 60)
    print("FastAPI Backend API が起動しました！")
    print("=" * 60)
    print(f"Swagger UI: http://localhost:8000/docs")
    print(f"ReDoc: http://localhost:8000/redoc")
    print(f"Health Check: http://localhost:8000/health")
    print("-" * 60)
    print("デフォルトユーザー:")
    print("  username: testuser")
    print("  password: password123")
    print("-" * 60)
    print(f"CORS Origins: {CORS_ORIGINS}")
    print("=" * 60)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 開発環境のみ
    )
