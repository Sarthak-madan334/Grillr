# Technology Stack

## 1. Overview

The Interview Coach uses a modern full-stack architecture optimized for real-time voice interaction, AI processing, and scalable application development.

## 2. Frontend

### Next.js

* Application framework
* Routing
* Server/client rendering
* Application structure

### React

* UI components
* Interactive interview interface
* Application state

### TypeScript

* Type-safe frontend development
* API contracts
* Component props
* State management

### Tailwind CSS

* Responsive styling
* Layout
* Design system implementation

### shadcn/ui

* Reusable UI components
* Accessible interface primitives

### Web Audio API

* Microphone access
* Audio capture
* Audio playback
* Voice activity handling

### WebSockets

* Real-time interview communication
* Audio streaming
* Transcript updates
* Interview state updates

## 3. Backend

### Python

Primary backend language.

### FastAPI

Used for:

* REST APIs
* WebSocket endpoints
* Request handling
* Dependency injection

### Pydantic

Used for:

* Request validation
* Response schemas
* Configuration
* Structured AI output validation

### SQLAlchemy

Used for:

* ORM
* Database models
* Database queries
* Transaction management

## 4. Database

### PostgreSQL

Primary relational database for:

* Users
* Interview sessions
* Questions
* Answers
* Transcripts
* Evaluations
* Speech metrics
* Interview summaries
* Interview history

### Supabase

Used for managed:

* PostgreSQL
* Authentication
* File storage where required

## 5. Authentication

### Supabase Auth

Used for:

* User registration
* Login
* Session management
* Access tokens

FastAPI validates authenticated requests before accessing protected resources.

## 6. AI Stack

### LLM

Used for:

* Interview question generation
* Follow-up questions
* Clarification questions
* Difficulty adaptation
* Answer evaluation
* Feedback generation

The LLM provider must be hidden behind an internal service interface.

### Speech-to-Text

Used for:

* User speech transcription
* Partial transcripts
* Final transcripts
* Word timing data where supported

### Text-to-Speech

Used for:

* AI interviewer voice
* Question playback
* Follow-up playback
* Streaming AI audio where supported

## 7. Service Abstraction

External providers should never be tightly coupled to business logic.

```text
backend/
└── services/
    ├── ai/
    │   ├── base.py
    │   └── provider.py
    ├── speech/
    │   ├── stt.py
    │   └── tts.py
    └── evaluation/
        └── evaluator.py
```

Application code should depend on internal interfaces rather than specific providers.

## 8. API Communication

### REST

Used for:

* Authentication-related application operations
* Interview CRUD
* Interview history
* Feedback
* Retry operations

Base path:

```text
/api/v1
```

### WebSockets

Used for:

* Real-time interview state
* Audio streaming
* Partial transcription
* AI audio
* Interruptions
* Real-time events

Endpoint:

```text
/ws/interviews/{session_id}
```

## 9. Development Tools

Recommended:

* Git
* GitHub
* ESLint
* Prettier
* Ruff
* Pytest
* TypeScript compiler

## 10. Environment Configuration

Configuration must use environment variables.

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AI_API_KEY
STT_API_KEY
TTS_API_KEY
```

Secrets must never be committed to the repository or exposed to the frontend.

## 11. Testing Stack

### Frontend

* TypeScript compiler
* ESLint
* Component/UI tests where required

### Backend

* Pytest
* API integration tests
* WebSocket tests
* Unit tests

### End-to-End

Use an appropriate browser automation framework when E2E testing is introduced.

## 12. Technology Principles

* Prefer simple technologies for the MVP.
* Keep AI and speech providers replaceable.
* Use TypeScript across the frontend.
* Use Python type hints throughout the backend.
* Validate API boundaries explicitly.
* Keep real-time communication separate from business logic.
* Avoid unnecessary infrastructure.
* Add new dependencies only when they solve a clear requirement.
