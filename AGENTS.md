# AGENTS.md

## Project Overview

The Interview Coach is a voice-first AI interview practice platform.

The application simulates realistic interviews, listens to the user's answers, analyzes both content and speech patterns, asks follow-up questions, provides structured feedback, and allows the user to retry answers and measure improvement.

Core loop:

> Answer → Analyze → Follow Up → Critique → Retry → Improve

The goal is to create an interview experience that feels closer to a real interviewer than a static question-and-answer chatbot.

---

## Primary Objectives

The system should:

1. Conduct realistic voice-based interviews.
2. Generate relevant interview questions based on the selected role.
3. Listen to and transcribe spoken answers.
4. Analyze answer quality and communication.
5. Detect speech issues such as filler words, excessive pauses, repetition, and rambling.
6. Ask contextual follow-up questions.
7. Interrupt when appropriate instead of waiting indefinitely.
8. Provide actionable feedback.
9. Allow users to retry answers.
10. Track improvement across attempts.
11. Support different interview types and interviewer personalities.
12. Maintain a clean, responsive, professional UI.

---

## Engineering Principles

### 1. Prefer simplicity

Do not introduce unnecessary abstractions, services, libraries, or infrastructure.

Use the simplest implementation that satisfies the requirement.

### 2. Build modularly

Keep responsibilities separated between:

- UI
- API
- AI orchestration
- speech processing
- interview logic
- database
- authentication
- analytics

Avoid putting business logic directly inside UI components.

### 3. Type safety

Use strong typing wherever possible.

Frontend:

- TypeScript
- Explicit interfaces/types
- Avoid `any` unless absolutely necessary

Backend:

- Python type hints
- Pydantic models
- Typed service interfaces

### 4. API-first architecture

Frontend components should communicate with backend functionality through clearly defined APIs.

Do not duplicate AI or business logic in the frontend.

### 5. Async by default

Speech processing, LLM requests, transcription, TTS, and other network operations should use asynchronous patterns where appropriate.

### 6. Handle failures explicitly

External AI and speech services can fail.

Every external request should have appropriate:

- Error handling
- Timeout handling
- Retry strategy where appropriate
- User-friendly fallback behavior
- Logging

Never silently ignore failures.

---

## Technology Direction

The planned stack is:

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

### Database

- PostgreSQL
- Supabase

### Authentication

- Supabase Auth

### AI

Use provider-agnostic service interfaces for:

- Speech-to-text
- Large language models
- Text-to-speech

Do not tightly couple application logic to a single AI provider.

---

## Project Structure

Follow this general structure:

```text
project-root/
├── app/
│   ├── ...
│
├── components/
│   ├── ...
│
├── lib/
│   ├── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ai/
│   │   └── main.py
│   └── tests/
│
├── docs/
│   ├── 01-PRODUCT.md
│   ├── 02-REQUIREMENTS.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-TECH-STACK.md
│   ├── 05-DATABASE.md
│   ├── 06-API.md
│   ├── 07-AI-INTERVIEWER.md
│   ├── 08-SPEECH-ANALYSIS.md
│   ├── 09-REALTIME-INTERRUPTION.md
│   ├── 10-UI-UX.md
│   ├── 11-SECURITY.md
│   ├── 12-IMPLEMENTATION-PLAN.md
│   └── 13-TASKS.md
│
├── README.md
├── AGENTS.md
└── ...