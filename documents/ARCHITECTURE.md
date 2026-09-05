# System Architecture

## 1. Overview

The Interview Coach uses a client-server architecture with real-time communication between the frontend, backend, AI services, and database.

The architecture is designed around the following flow:

**User → Frontend → Backend → AI/Speech Services → Backend → Frontend**

## 2. High-Level Architecture

```text
┌─────────────────────┐
│        User         │
│  Microphone / UI    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Next.js Frontend  │
│                     │
│ Interview UI        │
│ Audio Handling      │
│ WebSocket Client    │
└──────────┬──────────┘
           │
       API / WebSocket
           │
           ▼
┌─────────────────────┐
│   FastAPI Backend   │
│                     │
│ Interview Engine    │
│ Session Manager     │
│ AI Interviewer      │
│ Speech Analysis     │
│ Evaluation Engine   │
└──────┬───────┬──────┘
       │       │
       │       ├─────────────────┐
       │                         │
       ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ AI Services   │         │ Speech        │
│               │         │ Services      │
│ LLM           │         │ STT / TTS     │
└───────────────┘         └───────────────┘
       │
       ▼
┌─────────────────────┐
│ PostgreSQL /        │
│ Supabase            │
└─────────────────────┘
```

## 3. Frontend

The frontend is responsible for:

* User authentication UI
* Interview configuration
* Interview interface
* Microphone access
* Audio playback
* Real-time transcript display
* Interview controls
* Feedback display
* Interview history

The frontend communicates with the backend through:

* REST APIs for standard operations
* WebSockets for real-time interview interaction

The frontend should not contain core AI or evaluation logic.

## 4. Backend

The FastAPI backend is the primary application layer.

Responsibilities include:

* Authentication validation
* Interview session management
* Question orchestration
* AI interviewer coordination
* Speech processing coordination
* Answer evaluation
* Interview state management
* Database operations
* WebSocket communication

Recommended backend modules:

```text
backend/
├── api/
├── core/
├── models/
├── schemas/
├── services/
│   ├── interview/
│   ├── ai/
│   ├── speech/
│   └── evaluation/
├── websocket/
└── main.py
```

## 5. Interview Engine

The Interview Engine controls the interview lifecycle.

Responsibilities:

1. Create interview session.
2. Load interview configuration.
3. Generate the first question.
4. Deliver the question.
5. Receive the user's answer.
6. Process the transcript.
7. Evaluate the answer.
8. Determine whether a follow-up is required.
9. Continue the interview.
10. Complete the session.
11. Generate final feedback.

The Interview Engine should maintain explicit session state.

## 6. AI Interviewer

The AI Interviewer is responsible for generating:

* Interview questions
* Follow-up questions
* Clarifying questions
* Interview responses
* Feedback

The AI should receive relevant context including:

* Interview type
* Job role
* Experience level
* Difficulty
* Interview personality
* Previous questions
* Previous answers
* Current answer

AI providers should be abstracted behind a service interface so providers can be changed without rewriting the application.

## 7. Speech Pipeline

The speech pipeline consists of:

```text
User Speech
    │
    ▼
Microphone
    │
    ▼
Audio Stream
    │
    ▼
Speech-to-Text
    │
    ▼
Transcript
    │
    ├──► Speech Analysis
    │
    └──► Answer Evaluation
```

For AI responses:

```text
AI Response
    │
    ▼
Text-to-Speech
    │
    ▼
Audio Stream
    │
    ▼
Frontend
    │
    ▼
User
```

## 8. Real-Time Communication

WebSockets are used for real-time interview events.

Example flow:

```text
Frontend
   │
   │ connect
   ▼
Backend
   │
   │ question
   ▼
Frontend
   │
   │ user audio / transcript
   ▼
Backend
   │
   │ process
   ▼
AI + Speech Services
   │
   │ response
   ▼
Backend
   │
   ▼
Frontend
```

The WebSocket layer should support:

* Connection management
* Authentication
* Session validation
* Event routing
* Error handling
* Reconnection handling
* Interview state synchronization

## 9. Database

PostgreSQL stores persistent application data.

Supabase may provide:

* PostgreSQL
* Authentication
* Database access
* Storage where required

The database should store interview data separately from temporary real-time session state.

## 10. Session State

Temporary interview state may include:

* Current question
* Current answer
* Interview state
* AI speaking state
* User speaking state
* Current transcript
* Follow-up context

Persistent data should be stored in PostgreSQL.

## 11. Request Flow

### Start Interview

```text
User
 → Frontend
 → POST /interviews
 → Backend
 → Create Session
 → Generate Question
 → Return Session
```

### Answer Question

```text
User speaks
 → Frontend
 → WebSocket
 → Backend
 → STT
 → Transcript
 → Evaluation
 → AI decision
 → Follow-up / next question
 → Frontend
```

### Complete Interview

```text
Interview ends
 → Backend
 → Calculate final metrics
 → Generate final feedback
 → Store results
 → Frontend displays results
```

## 12. Error Boundaries

Failures should be isolated between services.

For example:

* STT failure should not crash the interview server.
* TTS failure should not invalidate the transcript.
* AI failure should return a recoverable interview state.
* WebSocket failure should support reconnection where possible.
* Database failure should be logged and surfaced appropriately.

## 13. Scalability

The architecture should allow individual services to scale independently.

Priority areas:

* WebSocket connections
* AI requests
* Speech processing
* Database queries

Long-running or expensive operations should be handled asynchronously where appropriate.

## 14. Architecture Principles

* Keep business logic in the backend.
* Keep UI logic in the frontend.
* Separate AI providers from application logic.
* Separate speech providers from application logic.
* Use typed API contracts.
* Keep real-time state explicit.
* Prefer small, testable services.
* Avoid unnecessary infrastructure during MVP development.
* Design interfaces so external providers can be replaced later.
