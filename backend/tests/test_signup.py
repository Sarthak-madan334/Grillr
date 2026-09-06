from __future__ import annotations

import os
from unittest.mock import AsyncMock, patch
from uuid import UUID

from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models import User


client = TestClient(app)


@patch("app.api.v1.users.httpx.AsyncClient")
def test_signup_success_returns_session(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "user": {"id": "00000000-0000-0000-0000-000000000123", "email": "new@example.com"},
        "session": {"access_token": "abc", "refresh_token": "def"},
    }
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    payload = {
        "first_name": "  Ada ",
        "last_name": "  Lovelace ",
        "email": " ADA@EXAMPLE.COM ",
        "password": "StrongPass1",
    }

    response = client.post("/api/v1/users/signup", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "ada@example.com"
    assert body["user"]["first_name"] == "Ada"
    assert body["user"]["last_name"] == "Lovelace"
    assert body["access_token"] == "abc"
    assert body["refresh_token"] == "def"
    assert body["requires_email_confirmation"] is False
    with SessionLocal() as db:
        user = db.get(User, UUID("00000000-0000-0000-0000-000000000123"))
        assert user is not None
        assert user.email == "ada@example.com"


@patch("app.api.v1.users.httpx.AsyncClient")
def test_signup_duplicate_email_returns_409(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 409
    mock_response.json.return_value = {"msg": "User already registered"}
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/signup",
        json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "password": "StrongPass1",
        },
    )

    assert response.status_code == 409
    assert "already exists" in response.json()["error"]["message"].lower()


@patch("app.api.v1.users.httpx.AsyncClient")
def test_signup_validation_failure_returns_400(mock_async_client):
    response = client.post(
        "/api/v1/users/signup",
        json={
            "first_name": "",
            "last_name": "Doe",
            "email": "not-an-email",
            "password": "weak",
        },
    )

    assert response.status_code == 422
    assert mock_async_client.called is False


@patch("app.api.v1.users.httpx.AsyncClient")
def test_signup_provider_unavailable_returns_503(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 503
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/signup",
        json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "password": "StrongPass1",
        },
    )

    assert response.status_code == 503
    assert "unavailable" in response.json()["error"]["message"].lower()


@patch("app.api.v1.users.httpx.AsyncClient")
def test_signup_email_confirmation_mode_returns_flag(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"user": {"id": "00000000-0000-0000-0000-000000000456", "email": "wait@example.com"}}
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/signup",
        json={
            "first_name": "Wait",
            "last_name": "List",
            "email": "wait@example.com",
            "password": "StrongPass1",
        },
    )

    assert response.status_code == 201
    assert response.json()["requires_email_confirmation"] is True


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_success_returns_session(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "user": {"id": "00000000-0000-0000-0000-000000000999", "email": "login@example.com"},
        "access_token": "login-token",
        "refresh_token": "login-refresh",
    }
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/login",
        json={"email": "login@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "login@example.com"
    assert body["access_token"] == "login-token"
    assert body["refresh_token"] == "login-refresh"


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_invalid_credentials_returns_401(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {"error": "Invalid login credentials"}
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/login",
        json={"email": "login@example.com", "password": "wrong-pass"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Invalid email or password."


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_nonexistent_email_returns_generic_401(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {"error": "User not found"}
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/login",
        json={"email": "missing@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Invalid email or password."


@patch("app.api.v1.users.httpx.AsyncClient")
def test_login_provider_unavailable_returns_503(mock_async_client):
    mock_response = AsyncMock()
    mock_response.status_code = 503
    mock_async_client.return_value.__aenter__.return_value.post.return_value = mock_response

    response = client.post(
        "/api/v1/users/login",
        json={"email": "login@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 503
    assert "unavailable" in response.json()["error"]["message"].lower()
