# The Interview Coach

AI-powered mock interviews with real-time voice interaction, adaptive questioning, and structured feedback.

## Local development

The verified setup, environment variables, database migrations, startup commands, health check, frontend-backend connectivity check, tests, and CI commands are documented in [docs/local-development.md](docs/local-development.md).

Quick start on Windows:

```powershell
Set-Location .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[test]"
Copy-Item .env.example .env

Set-Location ..\frontend
npm ci
Copy-Item .env.example .env.local
```

Run the backend with `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` and the frontend with `npm run dev -- --hostname 127.0.0.1 --port 3000` from their respective directories.

## Overview

The Interview Coach simulates realistic job interviews using voice. It asks questions, listens to answers, analyzes response quality and communication, asks follow-up questions, and provides actionable feedback.

Core loop:

**Answer → Analyze → Follow Up → Feedback → Retry → Improve**

## Key Features

- Voice-based mock interviews
- AI-generated interview questions
- Role-specific interview sessions
- Contextual follow-up questions
- Real-time interruption
- Speech-to-text transcription
- Speech and communication analysis
- AI-powered answer evaluation
- Retry and improvement tracking
- Interview history and performance metrics
- Resume and job-description based interviews

## Interview Types

- Behavioral
- Technical
- HR
- System Design
- Company-specific interviews

## Evaluation

Answers are evaluated on:

- Relevance
- Clarity
- Structure
- Technical accuracy
- Specificity
- Conciseness
- Communication quality

Speech analysis includes:

- Speaking speed
- Filler words
- Pauses
- Repetition
- Rambling
- Answer duration

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Web Audio API
- WebSockets

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- WebSockets

### Database & Auth
- PostgreSQL
- Supabase
- Supabase Auth

### AI
- Speech-to-Text
- LLM
- Text-to-Speech

## Architecture

```text
User
 │
 ▼
Next.js Frontend
 │
 │ WebSocket / API
 ▼
FastAPI Backend
 │
 ├── Interview Engine
 ├── AI Interviewer
 ├── Speech Analysis
 ├── Evaluation
 └── Session Management
 │
 ├── STT
 ├── LLM
 └── TTS
 │
 ▼
PostgreSQL / Supabase