from uuid import uuid4
from app.core.auth import authenticate_token, CurrentUser
from app.models import User
import pytest
from fastapi import HTTPException


def test_dev_token_authentication(client):
    headers = {"Authorization": "Bearer dev:00000000-0000-0000-0000-000000000001:alice@example.com:Alice"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"


def test_invalid_dev_token_format_returns_401(client):
    headers = {"Authorization": "Bearer dev:invalid-uuid-format"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_invalid_jwt_token_returns_401(client):
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"
