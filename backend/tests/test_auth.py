from uuid import uuid4
from app.core.auth import authenticate_token, CurrentUser
from app.models import User
import pytest
from fastapi import HTTPException
from unittest.mock import AsyncMock, patch


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


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_returns_supabase_session_and_persists_profile(mock_async_client, client):
    response = AsyncMock()
    response.status_code = 200
    response.json.return_value = {
        "access_token": "supabase-access",
        "refresh_token": "supabase-refresh",
        "user": {"id": "00000000-0000-0000-0000-000000000099", "email": "alice@example.com", "user_metadata": {"name": "Alice Example"}},
    }
    mock_async_client.return_value.__aenter__.return_value.post.return_value = response

    result = client.post("/api/v1/users/login", json={"email": "alice@example.com", "password": "StrongPass1"})

    assert result.status_code == 200
    assert result.json()["access_token"] == "supabase-access"
    assert result.json()["user"]["name"] == "Alice Example"


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_hides_provider_credentials_error(mock_async_client, client):
    response = AsyncMock()
    response.status_code = 400
    response.json.return_value = {"error_description": "Invalid login credentials"}
    mock_async_client.return_value.__aenter__.return_value.post.return_value = response

    result = client.post("/api/v1/users/login", json={"email": "alice@example.com", "password": "wrong"})

    assert result.status_code == 401
    assert result.json()["error"] == {"code": "invalid_credentials", "message": "Invalid email or password."}


def test_cookie_authentication_uses_secure_session_cookie(client):
    client.cookies.set("grillr_access_token", "dev:00000000-0000-0000-0000-000000000098:cookie@example.com:Cookie User")
    result = client.get("/api/v1/users/me")

    assert result.status_code == 200
    assert result.json()["email"] == "cookie@example.com"
