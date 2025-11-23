"""
Pytest configuration and fixtures for FastAPI tests
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db

# Test database URL (use 'db' service name when running in container)
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db:5432/fastapi_db"

# Create async engine for tests
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

# Create async session factory
TestingSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with database session"""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Test user data factory"""
    import random
    timestamp = random.randint(100000, 999999)
    return {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "password123",
    }


@pytest.fixture
async def authenticated_client(
    client: AsyncClient, test_user_data: dict
) -> AsyncGenerator[tuple[AsyncClient, dict], None]:
    """Create authenticated test client with user and token"""
    # Register user
    response = await client.post("/users", json=test_user_data)
    assert response.status_code == 201
    registration_response = response.json()

    # Extract user and token from registration response
    # /users endpoint now returns: {access_token, token_type, user}
    user_info = registration_response["user"]
    access_token = registration_response["access_token"]

    # Set authorization header
    client.headers["Authorization"] = f"Bearer {access_token}"

    yield client, {
        "user": user_info,
        "token": {"access_token": access_token, "token_type": "bearer"}
    }

    # Cleanup is handled by db_session fixture
