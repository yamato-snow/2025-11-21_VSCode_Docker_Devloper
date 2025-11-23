"""
Authentication endpoint tests for Flask
"""
import pytest
import jwt
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
SECRET_KEY = "your-secret-key-keep-it-secret"  # Should match app.py


def test_register_user_success(client, test_user_data):
    """Should register new user successfully"""
    response = client.post(
        "/auth/register",
        json=test_user_data,
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["username"] == test_user_data["username"]
    assert data["email"] == test_user_data["email"]
    assert data["is_active"] is True
    assert "id" in data
    assert "password_hash" not in data
    assert "access_token" in data  # Registration returns token


def test_register_duplicate_username(client, test_user_data):
    """Should fail with duplicate username"""
    # Register first user
    client.post("/auth/register", json=test_user_data)

    # Try to register with same username
    response = client.post("/auth/register", json=test_user_data)

    assert response.status_code == 400
    assert "already exists" in response.get_json()["error"].lower()


def test_register_duplicate_email(client, test_user_data):
    """Should fail with duplicate email"""
    # Register first user
    client.post("/auth/register", json=test_user_data)

    # Try different username but same email
    duplicate_data = test_user_data.copy()
    duplicate_data["username"] = "different_user"
    response = client.post("/auth/register", json=duplicate_data)

    assert response.status_code == 400
    assert "already exists" in response.get_json()["error"].lower()


def test_register_short_password(client):
    """Should fail with password less than 8 characters"""
    invalid_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "short",  # Too short
    }
    response = client.post("/auth/register", json=invalid_data)

    assert response.status_code == 400
    assert "at least 8 characters" in response.get_json()["error"].lower()


def test_register_missing_fields(client):
    """Should fail with missing required fields"""
    incomplete_data = {"username": "testuser"}
    response = client.post("/auth/register", json=incomplete_data)

    assert response.status_code == 400


def test_password_hashed(app, client, test_user_data):
    """Should hash password with bcrypt"""
    client.post("/auth/register", json=test_user_data)

    # Verify password is hashed
    with app.app_context():
        from models import User

        user = User.query.filter_by(username=test_user_data["username"]).first()
        assert user is not None
        assert user.password_hash.startswith("$2b$")
        assert bcrypt.check_password_hash(user.password_hash, test_user_data["password"])


def test_login_success(client, test_user_data):
    """Should login with correct credentials"""
    # Register user first
    client.post("/auth/register", json=test_user_data)

    # Login
    login_data = {
        "username": test_user_data["username"],
        "password": test_user_data["password"],
    }
    response = client.post("/auth/token", json=login_data)

    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Verify token is valid JWT
    decoded = jwt.decode(data["access_token"], SECRET_KEY, algorithms=["HS256"])
    assert decoded["sub"] == test_user_data["username"]


def test_login_wrong_password(client, test_user_data):
    """Should fail with incorrect password"""
    # Register user first
    client.post("/auth/register", json=test_user_data)

    # Try wrong password
    login_data = {"username": test_user_data["username"], "password": "wrongpassword"}
    response = client.post("/auth/token", json=login_data)

    assert response.status_code == 401
    assert "Incorrect username or password" in response.get_json()["error"]


def test_login_nonexistent_user(client):
    """Should fail with non-existent username"""
    login_data = {"username": "nonexistent", "password": "password123"}
    response = client.post("/auth/token", json=login_data)

    assert response.status_code == 401
    assert "Incorrect username or password" in response.get_json()["error"]


def test_login_inactive_user(app, client, test_user_data):
    """Should fail with inactive user"""
    # Register and deactivate user
    client.post("/auth/register", json=test_user_data)

    with app.app_context():
        from models import User

        user = User.query.filter_by(username=test_user_data["username"]).first()
        user.is_active = False
        from app import db

        db.session.commit()

    # Try to login
    login_data = {
        "username": test_user_data["username"],
        "password": test_user_data["password"],
    }
    response = client.post("/auth/token", json=login_data)

    assert response.status_code == 403
    assert "inactive" in response.get_json()["error"].lower()


def test_get_current_user_success(authenticated_client):
    """Should return current user info with valid token"""
    response = authenticated_client.get("/auth/me")

    assert response.status_code == 200
    data = response.get_json()
    assert data["username"] == authenticated_client.user_data["username"]
    assert data["email"] == authenticated_client.user_data["email"]
    assert "password_hash" not in data


def test_protected_endpoint_no_token(client):
    """Should fail without authorization token"""
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_protected_endpoint_invalid_token(client):
    """Should fail with invalid token"""
    response = client.get(
        "/auth/me", headers={"Authorization": "Bearer invalid_token_here"}
    )

    assert response.status_code == 401


def test_protected_endpoint_expired_token(client, test_user_data):
    """Should fail with expired token"""
    from datetime import datetime, timedelta

    # Create expired token
    expire = datetime.utcnow() - timedelta(hours=1)
    expired_token = jwt.encode(
        {"sub": test_user_data["username"], "exp": expire},
        SECRET_KEY,
        algorithm="HS256",
    )

    response = client.get(
        "/auth/me", headers={"Authorization": f"Bearer {expired_token}"}
    )

    assert response.status_code == 401
