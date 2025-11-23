"""
Authentication endpoint tests for FastAPI
"""
import pytest
from httpx import AsyncClient
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-keep-it-secret"  # Should match main.py
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.mark.asyncio
class TestUserRegistration:
    """Test POST /users endpoint"""

    async def test_register_user_success(self, client: AsyncClient, test_user_data: dict):
        """Should register new user successfully"""
        response = await client.post("/users", json=test_user_data)

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == test_user_data["username"]
        assert data["email"] == test_user_data["email"]
        assert data["is_active"] is True
        assert "id" in data
        assert "hashed_password" not in data  # Password should not be in response
        assert "access_token" in data  # Registration returns token

    async def test_register_duplicate_username(
        self, client: AsyncClient, test_user_data: dict
    ):
        """Should fail with duplicate username"""
        # Register first user
        await client.post("/users", json=test_user_data)

        # Try to register with same username
        response = await client.post("/users", json=test_user_data)

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_invalid_email(self, client: AsyncClient):
        """Should fail with invalid email format"""
        invalid_data = {
            "username": "testuser",
            "email": "invalid-email",  # Invalid format
            "password": "password123",
        }
        response = await client.post("/users", json=invalid_data)

        assert response.status_code == 422  # Pydantic validation error

    async def test_register_short_password(self, client: AsyncClient):
        """Should fail with password less than 8 characters"""
        invalid_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "short",  # Too short
        }
        response = await client.post("/users", json=invalid_data)

        assert response.status_code == 422  # Pydantic validation error

    async def test_password_hashed(self, client: AsyncClient, test_user_data: dict, db_session):
        """Should hash password with bcrypt"""
        await client.post("/users", json=test_user_data)

        # Verify password is hashed (bcrypt format: $2b$...)
        from models import User
        from sqlalchemy import select

        result = await db_session.execute(
            select(User).where(User.username == test_user_data["username"])
        )
        user = result.scalar_one()

        assert user.hashed_password.startswith("$2b$")
        assert pwd_context.verify(test_user_data["password"], user.hashed_password)


@pytest.mark.asyncio
class TestLogin:
    """Test POST /token endpoint"""

    async def test_login_success(self, client: AsyncClient, test_user_data: dict):
        """Should login with correct credentials"""
        # Register user first
        await client.post("/users", json=test_user_data)

        # Login
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"],
        }
        response = await client.post(
            "/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Verify token is valid JWT
        decoded = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == test_user_data["username"]

    async def test_login_wrong_password(self, client: AsyncClient, test_user_data: dict):
        """Should fail with incorrect password"""
        # Register user first
        await client.post("/users", json=test_user_data)

        # Try wrong password
        login_data = {"username": test_user_data["username"], "password": "wrongpassword"}
        response = await client.post(
            "/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Should fail with non-existent username"""
        login_data = {"username": "nonexistent", "password": "password123"}
        response = await client.post(
            "/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    async def test_login_inactive_user(self, client: AsyncClient, test_user_data: dict, db_session):
        """Should fail with inactive user"""
        # Register and deactivate user
        await client.post("/users", json=test_user_data)

        from models import User
        from sqlalchemy import select, update

        await db_session.execute(
            update(User)
            .where(User.username == test_user_data["username"])
            .values(is_active=False)
        )
        await db_session.commit()

        # Try to login
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"],
        }
        response = await client.post(
            "/token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 400
        assert "Inactive user" in response.json()["detail"]


@pytest.mark.asyncio
class TestProtectedEndpoints:
    """Test protected endpoints requiring authentication"""

    async def test_get_current_user_success(self, authenticated_client):
        """Should return current user info with valid token"""
        client, auth_data = authenticated_client

        response = await client.get("/users/me")

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == auth_data["user"]["username"]
        assert data["email"] == auth_data["user"]["email"]
        assert "hashed_password" not in data

    async def test_protected_endpoint_no_token(self, client: AsyncClient):
        """Should fail without authorization token"""
        response = await client.get("/users/me")

        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]

    async def test_protected_endpoint_invalid_token(self, client: AsyncClient):
        """Should fail with invalid token"""
        client.headers["Authorization"] = "Bearer invalid_token_here"
        response = await client.get("/users/me")

        assert response.status_code == 401

    async def test_protected_endpoint_expired_token(self, client: AsyncClient, test_user_data: dict):
        """Should fail with expired token"""
        from datetime import datetime, timedelta

        # Create expired token (expired 1 hour ago)
        expire = datetime.utcnow() - timedelta(hours=1)
        expired_token = jwt.encode(
            {"sub": test_user_data["username"], "exp": expire},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        client.headers["Authorization"] = f"Bearer {expired_token}"
        response = await client.get("/users/me")

        assert response.status_code == 401
