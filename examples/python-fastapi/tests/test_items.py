"""
Items API endpoint tests for FastAPI
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestCreateItem:
    """Test POST /items endpoint"""

    async def test_create_item_success(self, authenticated_client):
        """Should create new item with authentication"""
        client, auth_data = authenticated_client
        owner_id = auth_data["user"]["id"]

        item_data = {
            "title": "Test Item",
            "description": "This is a test item",
            "price": 99.99,
        }

        response = await client.post("/items", json=item_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == item_data["title"]
        assert data["description"] == item_data["description"]
        assert float(data["price"]) == item_data["price"]
        assert data["owner_id"] == owner_id
        assert "id" in data
        assert "created_at" in data

    async def test_create_item_without_auth(self, client: AsyncClient):
        """Should fail without authentication"""
        item_data = {
            "title": "Unauthorized Item",
            "description": "This should fail",
            "price": 50.0,
        }

        response = await client.post("/items", json=item_data)

        assert response.status_code == 401

    async def test_create_item_missing_fields(self, authenticated_client):
        """Should fail with missing required fields"""
        client, _ = authenticated_client

        incomplete_data = {"description": "Missing title and price"}

        response = await client.post("/items", json=incomplete_data)

        assert response.status_code == 422  # Pydantic validation error

    async def test_create_item_null_description(self, authenticated_client):
        """Should allow null description"""
        client, auth_data = authenticated_client

        item_data = {
            "title": "Item without description",
            "description": None,
            "price": 25.50,
        }

        response = await client.post("/items", json=item_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == item_data["title"]
        assert data["description"] is None


@pytest.mark.asyncio
class TestGetItems:
    """Test GET /items endpoint"""

    async def test_get_items_list(self, authenticated_client):
        """Should return items list with authentication"""
        client, _ = authenticated_client

        # Create some test items
        for i in range(3):
            await client.post(
                "/items",
                json={"title": f"Item {i}", "description": f"Desc {i}", "price": 10.0 * i},
            )

        response = await client.get("/items")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        assert all("id" in item for item in data)
        assert all("title" in item for item in data)
        assert all("owner_id" in item for item in data)

    async def test_get_items_without_auth(self, client: AsyncClient):
        """Should fail without authentication"""
        response = await client.get("/items")

        assert response.status_code == 401

    async def test_get_items_pagination(self, authenticated_client):
        """Should support skip and limit parameters"""
        client, _ = authenticated_client

        # Create test items
        for i in range(10):
            await client.post(
                "/items", json={"title": f"Item {i}", "price": 10.0}
            )

        # Get with limit
        response = await client.get("/items?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

        # Get with skip
        response = await client.get("/items?skip=5&limit=5")
        assert response.status_code == 200
        data2 = response.json()

        # Items should be different
        if len(data) > 0 and len(data2) > 0:
            assert data[0]["id"] != data2[0]["id"]


@pytest.mark.asyncio
class TestGetItemById:
    """Test GET /items/{item_id} endpoint"""

    async def test_get_item_by_id_success(self, authenticated_client):
        """Should return specific item by ID"""
        client, _ = authenticated_client

        # Create item
        create_response = await client.post(
            "/items",
            json={"title": "Specific Item", "description": "Test", "price": 123.45},
        )
        created_item = create_response.json()
        item_id = created_item["id"]

        # Get item by ID
        response = await client.get(f"/items/{item_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == item_id
        assert data["title"] == "Specific Item"
        assert float(data["price"]) == 123.45

    async def test_get_item_nonexistent(self, authenticated_client):
        """Should return 404 for non-existent item"""
        client, _ = authenticated_client

        response = await client.get("/items/999999")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    async def test_get_item_without_auth(self, client: AsyncClient):
        """Should fail without authentication"""
        response = await client.get("/items/1")

        assert response.status_code == 401


@pytest.mark.asyncio
class TestDatabaseConstraints:
    """Test database constraints and relationships"""

    async def test_foreign_key_constraint(self, authenticated_client, db_session):
        """Should enforce foreign key constraint on owner_id"""
        client, auth_data = authenticated_client

        # Create item
        await client.post(
            "/items", json={"title": "Test Item", "price": 10.0}
        )

        # Verify foreign key exists in database
        from models import Item
        from sqlalchemy import select

        result = await db_session.execute(select(Item).where(Item.title == "Test Item"))
        item = result.scalar_one()
        assert item.owner_id == auth_data["user"]["id"]

    async def test_cascade_delete(self, authenticated_client, db_session):
        """Should cascade delete items when user is deleted"""
        client, auth_data = authenticated_client
        user_id = auth_data["user"]["id"]

        # Create item
        create_response = await client.post(
            "/items", json={"title": "Item to Delete", "price": 10.0}
        )
        item_id = create_response.json()["id"]

        # Delete user (cascade should delete items)
        from models import User, Item
        from sqlalchemy import select, delete

        await db_session.execute(delete(User).where(User.id == user_id))
        await db_session.commit()

        # Verify item is deleted
        result = await db_session.execute(select(Item).where(Item.id == item_id))
        item = result.scalar_one_or_none()
        assert item is None
