"""
Items API endpoint tests for Flask
"""
import pytest


def test_create_item_success(authenticated_client):
    """Should create new item with authentication"""
    item_data = {
        "title": "Test Item",
        "description": "This is a test item",
        "price": 99.99,
        "owner_id": authenticated_client.user_data["user"]["id"],
    }

    response = authenticated_client.post("/api/items", json=item_data)

    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == item_data["title"]
    assert data["description"] == item_data["description"]
    assert float(data["price"]) == item_data["price"]
    assert data["owner_id"] == item_data["owner_id"]
    assert "id" in data


def test_create_item_without_auth(client):
    """Should fail without authentication"""
    item_data = {
        "title": "Unauthorized Item",
        "description": "This should fail",
        "price": 50.0,
        "owner_id": 1,
    }

    response = client.post("/api/items", json=item_data)
    assert response.status_code == 401


def test_create_item_missing_fields(authenticated_client):
    """Should fail with missing required fields"""
    incomplete_data = {"description": "Missing title and price"}
    response = authenticated_client.post("/api/items", json=incomplete_data)
    assert response.status_code == 400


def test_get_items_list(authenticated_client):
    """Should return items list with authentication"""
    # Create test items
    for i in range(3):
        authenticated_client.post(
            "/api/items",
            json={
                "title": f"Item {i}",
                "description": f"Desc {i}",
                "price": 10.0 * i,
                "owner_id": authenticated_client.user_data["user"]["id"],
            },
        )

    response = authenticated_client.get("/api/items")

    assert response.status_code == 200
    data = response.get_json()
    assert "items" in data
    assert len(data["items"]) >= 3


def test_get_items_without_auth(client):
    """Should fail without authentication"""
    response = client.get("/api/items")
    assert response.status_code == 401


def test_get_item_by_id_success(authenticated_client):
    """Should return specific item by ID"""
    # Create item
    create_response = authenticated_client.post(
        "/api/items",
        json={
            "title": "Specific Item",
            "description": "Test",
            "price": 123.45,
            "owner_id": authenticated_client.user_data["user"]["id"],
        },
    )
    item_id = create_response.get_json()["id"]

    # Get item by ID
    response = authenticated_client.get(f"/api/items/{item_id}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == item_id
    assert data["title"] == "Specific Item"


def test_update_item_success(authenticated_client):
    """Should update item owned by user"""
    # Create item
    create_response = authenticated_client.post(
        "/api/items",
        json={
            "title": "Original Title",
            "price": 100.0,
            "owner_id": authenticated_client.user_data["user"]["id"],
        },
    )
    item_id = create_response.get_json()["id"]

    # Update item
    update_data = {"title": "Updated Title", "price": 200.0}
    response = authenticated_client.put(f"/api/items/{item_id}", json=update_data)

    assert response.status_code == 200
    data = response.get_json()
    assert data["title"] == "Updated Title"
    assert float(data["price"]) == 200.0


def test_delete_item_success(authenticated_client):
    """Should delete item owned by user"""
    # Create item
    create_response = authenticated_client.post(
        "/api/items",
        json={
            "title": "Item to Delete",
            "price": 10.0,
            "owner_id": authenticated_client.user_data["user"]["id"],
        },
    )
    item_id = create_response.get_json()["id"]

    # Delete item
    response = authenticated_client.delete(f"/api/items/{item_id}")

    assert response.status_code == 200

    # Verify item is deleted
    get_response = authenticated_client.get(f"/api/items/{item_id}")
    assert get_response.status_code == 404


def test_cascade_delete(app, authenticated_client):
    """Should cascade delete items when user is deleted"""
    user_id = authenticated_client.user_data["user"]["id"]

    # Create item
    create_response = authenticated_client.post(
        "/api/items",
        json={"title": "Item to Cascade", "price": 10.0, "owner_id": user_id},
    )
    item_id = create_response.get_json()["id"]

    # Delete user
    with app.app_context():
        from models import User, Item
        from app import db

        user = User.query.get(user_id)
        db.session.delete(user)
        db.session.commit()

        # Verify item is deleted
        item = Item.query.get(item_id)
        assert item is None
