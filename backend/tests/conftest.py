import os
from uuid import uuid4

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["AUTH_REQUIRED"] = "false"
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "anon-test-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

import app.db.session as sys_db_session
from app.db.session import Base, get_db
from app.core.rate_limit import limiter
from app.main import app

test_engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
sys_db_session.engine = test_engine
sys_db_session.SessionLocal.configure(bind=test_engine)


@pytest.fixture(autouse=True)
def setup_db():
    limiter.clear()
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    limiter.clear()


@pytest.fixture
def client():
    def override_db():
        db = sys_db_session.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
