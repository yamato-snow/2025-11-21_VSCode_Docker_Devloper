"""
Pytest configuration and fixtures for Flask tests
"""
import pytest
from app import app as flask_app, db
from models import User, Item


@pytest.fixture(scope="function")
def app():
    """Create and configure a new app instance for each test"""
    # Set testing configuration
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = (
        "postgresql://postgres:postgres@localhost:5433/flask_db"
    )
    flask_app.config["WTF_CSRF_ENABLED"] = False  # Disable CSRF for testing

    # Create tables
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        # Cleanup
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """A test client for the app"""
    return app.test_client()


@pytest.fixture(scope="function")
def runner(app):
    """A test runner for the app's Click commands"""
    return app.test_cli_runner()


@pytest.fixture(scope="function")
def test_user_data():
    """Test user data factory"""
    import random
    timestamp = random.randint(100000, 999999)
    return {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "password123",
    }


@pytest.fixture(scope="function")
def authenticated_client(client, test_user_data):
    """Create authenticated test client with user and token"""
    # Register user
    response = client.post(
        "/auth/register",
        json=test_user_data,
        content_type="application/json",
    )
    assert response.status_code == 201
    user_response = response.get_json()

    # Get token
    token = user_response["access_token"]

    # Create a client wrapper with auth header
    class AuthenticatedClient:
        def __init__(self, client, token):
            self._client = client
            self.token = token
            self.user_data = user_response

        def get(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.get(*args, **kwargs)

        def post(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.post(*args, **kwargs)

        def put(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.put(*args, **kwargs)

        def delete(self, *args, **kwargs):
            kwargs.setdefault("headers", {})
            kwargs["headers"]["Authorization"] = f"Bearer {self.token}"
            return self._client.delete(*args, **kwargs)

    return AuthenticatedClient(client, token)
