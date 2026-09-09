# Local Development

This guide was verified on Windows with Python 3.14.7, Node.js 24.20.0, and npm 11.19.0. The backend declares Python 3.11 or newer. The backend Docker image uses Python 3.12. The frontend uses npm because `frontend/package-lock.json` is committed.

## Prerequisites

Install:

- Python 3.11 or newer
- Node.js 20 or newer and npm
- Git

PostgreSQL is optional for local development. The verified default is SQLite. Docker Desktop is optional and is only needed for the PostgreSQL production-like stack.

## Backend Setup

From the repository root:

```powershell
Set-Location .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[test]"
Copy-Item .env.example .env
```

The authoritative backend dependency file is `backend/pyproject.toml`. The verified clean install command is `python -m pip install -e ".[test]"`.

## Frontend Setup

From the repository root:

```powershell
Set-Location .\frontend
npm ci
Copy-Item .env.example .env.local
```

The authoritative frontend dependency files are `frontend/package.json` and `frontend/package-lock.json`. `npm ci` was verified from a clean temporary directory.

## Environment Variables

Backend settings are loaded by Pydantic from `backend/.env`. Frontend server routes use `frontend/.env.local`.

### Backend

| Variable | Required locally | Verified example | Purpose |
| --- | --- | --- | --- |
| `APP_NAME` | No | `Grillr Interview Coach API` | API title |
| `ENVIRONMENT` | No | `development` | Enables development defaults |
| `DATABASE_URL` | No | `sqlite:///./grillr.db` | SQLAlchemy database URL |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated browser origins |
| `JWT_SECRET` | No in development | `change-me-in-development` | Local JWT fallback secret |
| `AUTH_REQUIRED` | No | `false` | Requires real auth when true |
| `AUTO_CREATE_SCHEMA` | No | `true` | Creates local schema on startup |
| `SUPABASE_URL` | No in development | empty | Supabase project URL/JWKS source |
| `SUPABASE_JWKS_URL` | No | empty | Explicit Supabase JWKS URL |
| `SUPABASE_JWT_SECRET` | No | empty | Supabase HS256 validation secret |
| `SUPABASE_ANON_KEY` | No | empty | Supabase public API key |
| `OPENAI_API_KEY` | No | empty | Optional OpenAI STT/interviewer provider |
| `RIME_API_KEY` | No in development | empty | Rime question-audio provider |
| `GROQ_API_KEY` | No | empty | Optional answer-evaluation provider |
| `GROQ_MODEL` | No | `llama-3.1-8b-instant` | Groq evaluation model |
| `WHISPER_MODEL_SIZE` | No | `base` | Local Whisper model size |
| `STT_TIMEOUT_SECONDS` | No | `20` | STT timeout |
| `MAX_FOLLOW_UPS_PER_QUESTION` | No | `1` | Follow-up limit |
| `SQL_ECHO` | No | `false` | SQL logging |
| `LOG_LEVEL` | No | `INFO` | Application log level |
| `GLOBAL_RATE_LIMIT` | No | `100` | Global request limit |
| `GLOBAL_RATE_WINDOW_SECONDS` | No | `60` | Global limit window |
| `AUTH_RATE_LIMIT` | No | `10` | Auth request limit |
| `AUTH_RATE_WINDOW_SECONDS` | No | `60` | Auth limit window |
| `INTERVIEW_CREATION_RATE_LIMIT` | No | `5` | Interview creation limit |
| `INTERVIEW_CREATION_RATE_WINDOW_SECONDS` | No | `60` | Interview creation window |
| `ANSWER_RATE_LIMIT` | No | `20` | Answer request limit |
| `ANSWER_RATE_WINDOW_SECONDS` | No | `60` | Answer limit window |
| `USER_RATE_LIMIT` | No | `100` | Per-user request limit |
| `USER_RATE_WINDOW_SECONDS` | No | `60` | Per-user limit window |

For local development, leave `ENVIRONMENT=development`, `AUTH_REQUIRED=false`, and `AUTO_CREATE_SCHEMA=true`. Requests without a token use the deterministic development user. Do not use these defaults in deployment.

### Frontend

| Variable | Required locally | Verified example | Purpose |
| --- | --- | --- | --- |
| `GRILLR_API_URL` | No | `http://localhost:8000` | Next.js server-to-backend API URL |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Browser WebSocket/API origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Only for OAuth | empty | Supabase OAuth URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Only for OAuth | empty | Supabase public OAuth key |

The frontend defaults `GRILLR_API_URL` to `http://localhost:8000`. Set both API URL variables when using another backend port.

## Database and Migrations

The normal local development path uses SQLite and automatic schema creation. To verify or use a migration-only database, run:

```powershell
Set-Location .\backend
$env:DATABASE_URL = "sqlite:///C:/Users/$env:USERNAME/AppData/Local/Temp/grillr-clean-migrations.db"
$env:AUTO_CREATE_SCHEMA = "false"
python -m alembic upgrade head
```

The migration command was verified against an empty SQLite database. For PostgreSQL, set `DATABASE_URL` to a `postgresql+psycopg://...` URL and run the same command. The optional PostgreSQL stack is:

```powershell
Set-Location .\backend
docker compose up --build
```

That stack requires `SUPABASE_URL` and starts PostgreSQL plus the API, which runs `alembic upgrade head` before Uvicorn.

## Run Both Services

Start the backend in one terminal. The default port is 8000; this environment verified the same command on free port 8001 because 8000 was occupied:

```powershell
Set-Location .\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Start the frontend in a second terminal. The default port is 3000; this environment verified the same command on free port 3001:

```powershell
Set-Location .\frontend
npm run dev -- --hostname 127.0.0.1 --port 3001
```

When using the verified 8001/3001 commands, set `GRILLR_API_URL=http://127.0.0.1:8001` and `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` in `frontend/.env.local`. If the default ports are free, use 8000/3000 and the values from `frontend/.env.example`.

## Tests and Checks

Backend tests:

```powershell
Set-Location .\backend
.\.venv\Scripts\python.exe -m pytest -q
```

The current verified result is `145 passed`. The production-settings test supplies a valid production configuration and verifies that missing `RIME_API_KEY` is reported specifically.

Focused WebSocket tests:

```powershell
Set-Location .\backend
.\.venv\Scripts\python.exe -m pytest tests/test_websocket.py -q
```

The current result is `14 passed`.

Frontend tests:

```powershell
Set-Location .\frontend
npm test
```

The current result is `28 passed` across 10 files.

Frontend lint and production build:

```powershell
Set-Location .\frontend
npm run lint
npm run build
```

Both commands were verified successfully.

## Health and Connectivity

With the backend running:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8001/health" -Method Get
```

Expected response:

```json
{"status":"ok","service":"grillr-backend"}
```

Open `http://127.0.0.1:3001` in a browser. The frontend's Next.js auth proxy can be checked directly:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/auth/me" -Method Get
```

It should return HTTP `200` in development. This route uses `GRILLR_API_URL` to call the backend `/api/v1/users/me`; the backend allows the configured frontend origin through `CORS_ORIGINS`. The verified alternate-port setup used backend `8001` and frontend `3001` and returned HTTP `200` for both the frontend page and `/api/auth/me`.

## CI

The repository CI workflow is `.github/workflows/ci.yml`. It uses the same commands documented above: backend editable install, clean SQLite migration, and pytest; frontend `npm ci`, Vitest, lint, and build.
