# API Specification

## 1. Overview

The Interview Coach API is provided by the FastAPI backend.

The API uses:

* REST for standard application operations
* WebSockets for real-time interview interaction
* JSON for REST request and response bodies
* Supabase Auth for authentication
* PostgreSQL for persistent data

Base API path:

```text
/api/v1
```

## 2. Authentication

Authenticated REST requests must include the Supabase access token.

```http
Authorization: Bearer <access_token>
```

The backend must:

1. Validate the token.
2. Identify the authenticated user.
3. Authorize access to the requested resource.
4. Reject unauthorized access.

WebSocket connections must also be authenticated before accessing an interview session.

## 3. REST Endpoints

### 3.1 User

#### Get Current User

```http
GET /api/v1/users/me
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User"
}
```

### 3.2 Interview Sessions

#### Create Interview

```http
POST /api/v1/interviews
```

Request:

```json
{
  "interview_type": "behavioral",
  "job_role": "Software Engineer",
  "experience_level": "mid",
  "difficulty": "medium",
  "personality": "professional",
  "duration": 30,
  "resume_url": null,
  "job_description": null
}
```

Response:

```json
{
  "id": "uuid",
  "status": "created",
  "interview_type": "behavioral",
  "job_role": "Software Engineer",
  "created_at": "2026-01-01T10:00:00Z"
}
```

#### List Interviews

```http
GET /api/v1/interviews
```

Optional query parameters:

```text
status
limit
offset
```

Response:

```json
{
  "items": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

#### Get Interview

```http
GET /api/v1/interviews/{session_id}
```

Returns interview configuration, state, questions, and completed results available to the user.

#### Cancel Interview

```http
POST /api/v1/interviews/{session_id}/cancel
```

Response:

```json
{
  "id": "uuid",
  "status": "cancelled"
}
```

### 3.3 Questions

#### Get Interview Questions

```http
GET /api/v1/interviews/{session_id}/questions
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "question_number": 1,
      "question_text": "Tell me about yourself.",
      "question_type": "behavioral",
      "is_follow_up": false,
      "answered_at": null
    }
  ]
}
```

### 3.4 Answers

#### Get Answer

```http
GET /api/v1/answers/{answer_id}
```

Returns:

* Transcript
* Duration
* Speech metrics
* Evaluation
* Attempt number

#### Retry Answer

```http
POST /api/v1/questions/{question_id}/retry
```

Request:

```json
{
  "answer_id": "uuid"
}
```

Response:

```json
{
  "question_id": "uuid",
  "attempt_number": 2,
  "status": "ready"
}
```

The actual answer audio/transcript should be submitted through the interview WebSocket.

### 3.5 Feedback

#### Get Answer Feedback

```http
GET /api/v1/answers/{answer_id}/feedback
```

Response:

```json
{
  "overall_score": 82,
  "scores": {
    "relevance": 85,
    "clarity": 80,
    "structure": 84,
    "specificity": 78,
    "technical_accuracy": 88,
    "conciseness": 80,
    "communication": 82
  },
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "improved_answer": "..."
}
```

#### Get Interview Feedback

```http
GET /api/v1/interviews/{session_id}/feedback
```

Returns final interview-level feedback and performance metrics.

## 4. WebSocket API

Real-time interview communication uses:

```text
/ws/interviews/{session_id}
```

The connection must be authenticated and associated with the requested session.

## 5. WebSocket Client Events

All events use a common structure:

```json
{
  "type": "event_name",
  "data": {}
}
```

### Start Session

```json
{
  "type": "session.start",
  "data": {}
}
```

### Audio Chunk

```json
{
  "type": "audio.chunk",
  "data": {
    "audio": "<encoded-or-streamed-audio>"
  }
}
```

Binary WebSocket frames may be used for audio where supported.

### User Speech Started

```json
{
  "type": "speech.start",
  "data": {}
}
```

### User Speech Stopped

```json
{
  "type": "speech.stop",
  "data": {}
}
```

### Interrupt AI

```json
{
  "type": "interview.interrupt",
  "data": {}
}
```

The backend should stop or cancel active AI speech generation where possible.

### Retry Answer

```json
{
  "type": "answer.retry",
  "data": {
    "question_id": "uuid"
  }
}
```

### End Session

```json
{
  "type": "session.end",
  "data": {}
}
```

## 6. WebSocket Server Events

### Session Ready

```json
{
  "type": "session.ready",
  "data": {
    "session_id": "uuid"
  }
}
```

### Question

```json
{
  "type": "question.created",
  "data": {
    "question_id": "uuid",
    "question_text": "Tell me about yourself.",
    "question_number": 1,
    "is_follow_up": false
  }
}
```

### AI Speech

```json
{
  "type": "audio.ai",
  "data": {
    "audio": "<audio-data>"
  }
}
```

### Transcript Partial

```json
{
  "type": "transcript.partial",
  "data": {
    "text": "I worked on..."
  }
}
```

### Transcript Final

```json
{
  "type": "transcript.final",
  "data": {
    "answer_id": "uuid",
    "text": "I worked on..."
  }
}
```

### Answer Evaluation

```json
{
  "type": "answer.evaluated",
  "data": {
    "answer_id": "uuid",
    "overall_score": 82
  }
}
```

### Follow-Up

```json
{
  "type": "question.follow_up",
  "data": {
    "question_id": "uuid",
    "parent_question_id": "uuid",
    "question_text": "What was your specific contribution?"
  }
}
```

### Session Completed

```json
{
  "type": "session.completed",
  "data": {
    "session_id": "uuid",
    "overall_score": 84
  }
}
```

## 7. Error Format

REST errors should use a consistent structure:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The interview configuration is invalid.",
    "details": {}
  }
}
```

WebSocket errors should use the same logical structure:

```json
{
  "type": "error",
  "data": {
    "code": "SESSION_NOT_FOUND",
    "message": "Interview session was not found."
  }
}
```

Errors must not expose:

* API keys
* Internal stack traces
* Provider credentials
* Sensitive user information
* Internal infrastructure details

## 8. HTTP Status Codes

Use standard HTTP status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

Validation failures should normally return `422`.

Authentication failures should return `401`.

Resource ownership failures should return `403` or `404` without revealing whether another user's resource exists.

## 9. Validation

All REST requests must be validated using Pydantic schemas.

Validation should cover:

* Required fields
* Enum values
* String lengths
* Numeric ranges
* UUID formats
* Duration limits
* Interview configuration
* Pagination parameters

The backend must never trust client-provided ownership information.

User identity must come from the authenticated session.

## 10. Idempotency

Idempotency should be used for operations that may be retried by the client.

The following operations should support an idempotency key where appropriate:

```http
POST /api/v1/interviews
POST /api/v1/interviews/{session_id}/cancel
POST /api/v1/questions/{question_id}/retry
```

Example:

```http
Idempotency-Key: <unique-request-id>
```

Repeated requests with the same key should not create duplicate resources or attempts.

## 11. Pagination

Collection endpoints should use:

```text
limit
offset
```

Example:

```text
GET /api/v1/interviews?limit=20&offset=0
```

The backend should enforce reasonable maximum limits.

## 12. API Versioning

The API version should be included in the URL:

```text
/api/v1
```

Breaking changes should require a new API version.

Non-breaking changes should remain backward compatible where practical.

## 13. API Security

The API must:

* Require authentication for protected endpoints.
* Verify resource ownership.
* Validate all client input.
* Rate-limit expensive operations.
* Protect AI and speech provider credentials.
* Avoid exposing internal provider responses directly.
* Log security-relevant failures.
* Never trust client-provided user IDs.

## 14. API Principles

* Keep REST endpoints resource-oriented.
* Use WebSockets only where real-time communication is required.
* Keep request and response schemas explicit.
* Return consistent errors.
* Validate at the API boundary.
* Keep business logic inside backend services.
* Keep provider-specific APIs behind internal service abstractions.
* Make retryable operations safe against duplicate requests.
* Keep API contracts stable and versioned.
* Never expose internal implementation details through public responses.
