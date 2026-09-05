# Grillr Backend

FastAPI backend foundation for the Interview Coach. It includes SQLAlchemy models, ownership-scoped repositories, Supabase-compatible JWT validation, interview lifecycle APIs, and mock AI/speech providers.

## Run locally

Requires Python 3.11+.

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[test]"
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The default database is local SQLite. Set `DATABASE_URL` to a PostgreSQL URL for deployment. Set `AUTH_REQUIRED=true` and `SUPABASE_JWT_SECRET` in environments where authentication must be mandatory. In development, requests without a token use a local development user; a deterministic token can also be supplied as `Bearer dev:<uuid>:<email>:<name>`.

For a production-like local stack, set `SUPABASE_JWT_SECRET` and run `docker compose up --build`. The container runs `alembic upgrade head` before starting the API. Production and staging reject automatic schema creation and require authentication settings at startup.

## API

- `GET /health`
- `GET /docs`
- `GET /api/v1/users/me`
- `POST /api/v1/interviews`
- `GET /api/v1/interviews`
- `GET /api/v1/interviews/{id}`
- `POST /api/v1/interviews/{id}/start`
- `POST /api/v1/interviews/{id}/complete`
- `POST /api/v1/interviews/{id}/cancel`
- `GET /api/v1/interviews/{id}/questions`
- `POST /api/v1/interviews/questions/{question_id}/answer`
- `POST /api/v1/interviews/questions/{question_id}/retry`
- `POST /api/v1/questions/{question_id}/answer`
- `POST /api/v1/questions/{question_id}/retry`
- `GET /api/v1/answers/{id}/feedback`
- `GET /api/v1/interviews/{id}/feedback`

All resource reads and writes are filtered by the authenticated user. Production database changes should use Alembic migrations.
