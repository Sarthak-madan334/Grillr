import os
from pathlib import Path
from uuid import UUID, uuid4

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.core.auth import DEV_USER_ID
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models import User


SECOND_USER_ID = uuid4()


def auth_header(user_id: UUID) -> dict[str, str]:
    return {"Authorization": f"Bearer dev:{user_id}:user@example.com:Test User"}


def test_username_is_nullable_and_me_reports_incomplete(client):
    response = client.get("/api/v1/users/me")

    assert response.status_code == 200
    assert response.json()["username"] is None
    assert response.json()["username_complete"] is False


def test_username_is_normalized_and_reported_by_me(client):
    response = client.put("/api/v1/users/me/username", json={"username": "  Alice_1  "})

    assert response.status_code == 200
    assert response.json()["username"] == "alice_1"
    assert response.json()["username_complete"] is True

    me = client.get("/api/v1/users/me")
    assert me.json()["username"] == "alice_1"
    assert me.json()["username_complete"] is True


def test_username_duplicate_is_case_insensitive(client):
    first = client.put("/api/v1/users/me/username", json={"username": "Alice"})
    assert first.status_code == 200

    with SessionLocal() as db:
        db.add(User(id=SECOND_USER_ID, email="second@example.com", name="Second User"))
        db.commit()

    response = client.put(
        "/api/v1/users/me/username",
        json={"username": "ALICE"},
        headers=auth_header(SECOND_USER_ID),
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "username_taken"


def test_username_validation_returns_structured_errors(client):
    response = client.put("/api/v1/users/me/username", json={"username": "bad name!"})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_username_update_cannot_target_another_user(client):
    with SessionLocal() as db:
        db.add(User(id=SECOND_USER_ID, email="second@example.com", name="Second User"))
        db.commit()

    response = client.put(
        "/api/v1/users/me/username",
        json={"username": "seconduser"},
        headers=auth_header(SECOND_USER_ID),
    )

    assert response.status_code == 200
    with SessionLocal() as db:
        first_user = db.get(User, DEV_USER_ID)
        second_user = db.get(User, SECOND_USER_ID)
        assert first_user is None or first_user.username != "seconduser"
        assert second_user is not None
        assert second_user.username == "seconduser"


def _alembic_config(database_url: str) -> Config:
    backend_root = Path(__file__).resolve().parents[1]
    config = Config(str(backend_root / "alembic.ini"))
    config.set_main_option("script_location", str(backend_root / "migrations"))
    os.environ["DATABASE_URL"] = database_url
    get_settings.cache_clear()
    return config


def test_username_migration_adds_nullable_column_and_index(tmp_path):
    database_url = f"sqlite:///{tmp_path / 'clean.db'}"
    config = _alembic_config(database_url)

    try:
        command.upgrade(config, "head")
        engine = create_engine(database_url)
        columns = {column["name"]: column for column in inspect(engine).get_columns("users")}
        index_sql = engine.connect().execute(
            text("SELECT sql FROM sqlite_master WHERE type = 'index' AND name = 'users_username_lower_unique'")
        ).scalar_one()
    finally:
        get_settings.cache_clear()

    assert columns["username"]["nullable"] is True
    assert index_sql.startswith("CREATE UNIQUE INDEX")
    assert "LOWER(username)" in index_sql
    assert "username IS NOT NULL" in index_sql


def test_username_migration_preserves_existing_user(tmp_path):
    database_url = f"sqlite:///{tmp_path / 'existing.db'}"
    config = _alembic_config(database_url)

    try:
        command.upgrade(config, "head")
        engine = create_engine(database_url)
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO users (id, email, name) VALUES (:id, :email, :name)"), {"id": str(uuid4()), "email": "legacy@example.com", "name": "Legacy"})
        command.downgrade(config, "0002_add_question_count")
        command.upgrade(config, "head")
        with engine.connect() as connection:
            row = connection.execute(text("SELECT email, username FROM users WHERE email = 'legacy@example.com'")).one()
    finally:
        get_settings.cache_clear()

    assert row.email == "legacy@example.com"
    assert row.username is None
