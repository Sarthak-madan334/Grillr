from unittest.mock import patch

import pytest

from app.core.auth import authenticate_token, CurrentUser
from app.core.config import Settings


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


def test_frontend_access_cookie_is_used_for_authentication(client):
    client.cookies.set("grillr_access_token", "dev:00000000-0000-0000-0000-000000000003:cookie@example.com:Cookie User")
    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "cookie@example.com"


def test_invalid_jwt_token_returns_401(client):
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


@patch("app.core.auth.httpx.get")
@patch("app.core.auth.jwt.decode")
@patch("app.core.auth.jwt.get_unverified_header")
def test_signing_key_token_uses_supabase_jwks(mock_header, mock_decode, mock_get, client):
    mock_header.return_value = {"alg": "RS256", "kid": "key-1"}
    mock_get.return_value.json.return_value = {"keys": [{"kid": "key-1", "kty": "RSA"}]}
    mock_decode.return_value = {
        "sub": "00000000-0000-0000-0000-000000000002",
        "email": "signed@example.com",
        "user_metadata": {"name": "Signed User"},
    }

    response = client.get("/api/v1/users/me", headers={"Authorization": "Bearer signed-token"})

    assert response.status_code == 200
    assert response.json()["email"] == "signed@example.com"
    mock_get.assert_called_once()


def test_production_settings_require_authentication():
    with pytest.raises(ValueError, match="AUTH_REQUIRED must be true outside development"):
        Settings(environment="production", auth_required=False, supabase_jwt_secret="test-secret", auto_create_schema=False)
