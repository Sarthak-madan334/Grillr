# Implementation Plan

## 1. Overview

Implementation should proceed incrementally from the core interview flow toward real-time voice interaction, evaluation, retry, and analytics.

The MVP should prioritize a working end-to-end interview experience before advanced optimization.

## 2. Implementation Phases

### Phase 1 — Project Foundation

Set up:

* Next.js frontend
* FastAPI backend
* TypeScript configuration
* Python environment
* PostgreSQL / Supabase
* Supabase Auth
* Environment configuration
* Development tooling
* Basic CI checks

Deliverable:

A running frontend and backend with authenticated users and database connectivity.

## 3. Phase 2 — Database and Authentication

Implement:

* User authentication
* User ownership
* Database models
* Database migrations
* Interview session model
* Question model
* Answer model
* Evaluation model
* Speech metrics model
* Interview summary model

Add appropriate:

* Foreign keys
* Constraints
* Indexes
* Row Level Security where applicable

Deliverable:

Authenticated users can securely create and access their own persistent data.

## 4. Phase 3 — Interview Session API

Implement REST endpoints for:

* Current user
* Creating interviews
* Listing interviews
* Getting an interview
* Cancelling interviews
* Getting questions
* Getting answers
* Getting feedback
* Retrying answers

Add:

* Pydantic schemas
* Authentication dependencies
* Authorization checks
* Validation
* Error handling
* Idempotency

Deliverable:

The backend can manage the complete interview data lifecycle.

## 5. Phase 4 — Interview Engine

Implement the core interview state machine.

Initial states:

```text
created
  ↓
asking
  ↓
listening
  ↓
processing
  ↓
follow_up / next_question
  ↓
listening
  ↓
completed
```

The Interview Engine should own:

* Current question
* Interview state
* Answer processing
* Follow-up decisions
* Question progression
* Interview completion

Deliverable:

A complete text-based interview can run without voice streaming.

## 6. Phase 5 — AI Interviewer

Implement the AI service abstraction.

```text
Interview Engine
      ↓
AI Interviewer
      ↓
AI Service Interface
      ↓
LLM Provider
```

Implement:

* Question generation
* Follow-up generation
* Clarification questions
* Difficulty adaptation
* Interviewer personalities
* Structured AI output
* Output validation

Prompts should remain versioned and separated from application code where practical.

Deliverable:

The system can conduct an adaptive interview using AI.

## 7. Phase 6 — Speech-to-Text

Implement the speech pipeline:

```text
Microphone
    ↓
Audio Stream
    ↓
STT Provider
    ↓
Partial Transcript
    ↓
Final Transcript
```

Support:

* Audio capture
* Streaming where supported
* Partial transcription
* Final transcription
* Provider abstraction
* STT failure recovery

Deliverable:

Users can answer interview questions using their microphone.

## 8. Phase 7 — Speech Analysis

Implement deterministic speech metrics.

Initial metrics:

* Speaking duration
* Word count
* Words per minute
* Filler words
* Pauses
* Repetition
* Rambling indicators

Final metrics should be calculated from the completed answer.

Deliverable:

Each answer has measurable communication metrics.

## 9. Phase 8 — Answer Evaluation

Implement the evaluation pipeline:

```text
Final Transcript
      ↓
Speech Metrics
      ↓
Answer Evaluator
      ↓
Structured Evaluation
      ↓
Feedback
```

Evaluate:

* Relevance
* Clarity
* Structure
* Specificity
* Technical accuracy
* Conciseness
* Communication quality

Generate:

* Overall score
* Dimension scores
* Strengths
* Weaknesses
* Suggestions
* Improved answer

Deliverable:

Users receive structured feedback for every completed answer.

## 10. Phase 9 — Text-to-Speech

Implement:

```text
AI Response
    ↓
TTS Provider
    ↓
Audio Stream
    ↓
Frontend Playback
```

Support:

* Voice generation
* Streaming audio where supported
* Playback controls
* TTS failure recovery
* Provider abstraction

Deliverable:

The AI interviewer can conduct the interview through voice.

## 11. Phase 10 — Real-Time WebSocket Layer

Implement the WebSocket session lifecycle:

```text
CONNECT
  ↓
AUTHENTICATE
  ↓
VALIDATE SESSION
  ↓
SESSION READY
  ↓
INTERVIEW ACTIVE
  ↓
SESSION COMPLETED
  ↓
DISCONNECT
```

Implement client events:

```text
session.start
audio.chunk
speech.start
speech.stop
interview.interrupt
answer.retry
session.end
```

Implement server events:

```text
session.ready
question.created
audio.ai
transcript.partial
transcript.final
answer.evaluated
question.follow_up
session.completed
error
```

Deliverable:

The frontend and backend support real-time interview communication.

## 12. Phase 11 — Interruption and Voice Activity

Implement:

* Voice Activity Detection
* User speech detection
* AI playback cancellation
* TTS cancellation
* AI interruption handling
* Speech start/stop detection
* Session state synchronization

The critical behavior is:

```text
AI Speaking
    ↓
User Starts Speaking
    ↓
Stop AI Audio
    ↓
Cancel TTS
    ↓
Switch to Listening
```

Deliverable:

The interaction feels conversational rather than turn-based.

## 13. Phase 12 — Interview UI

Implement the primary user experience:

* Dashboard
* Interview setup
* Live interview screen
* Microphone controls
* Live transcript
* AI speaking state
* Listening state
* Processing state
* Progress indicator
* Interruption control
* Feedback screen
* Retry interface
* Interview history

Prioritize responsive and accessible voice interaction.

Deliverable:

Users can complete the entire MVP through the application interface.

## 14. Phase 13 — Retry and Improvement Tracking

Implement answer retries.

Each retry should:

1. Preserve the original attempt.
2. Capture the new answer.
3. Analyze the new answer.
4. Evaluate it independently.
5. Compare it with the previous attempt.
6. Calculate improvement.
7. Continue the interview using the latest valid attempt.

Deliverable:

Users can see whether repeated practice improves their performance.

## 15. Phase 14 — Interview Completion

Implement final session processing:

```text
Interview Complete
      ↓
Calculate Metrics
      ↓
Generate Summary
      ↓
Store Results
      ↓
Display Results
```

Final results should include:

* Overall score
* Question count
* Interview duration
* Average WPM
* Filler count
* Pause metrics
* Strengths
* Weaknesses
* Recommendations
* Retry improvement

Deliverable:

Users receive a complete interview report.

## 16. Phase 15 — Reliability and Recovery

Test and implement recovery for:

* Microphone permission failures
* STT failures
* TTS failures
* AI provider failures
* WebSocket disconnections
* Database failures
* Duplicate requests
* Invalid sessions
* Browser audio failures

The system should preserve interview state whenever possible.

Deliverable:

Temporary failures do not unnecessarily destroy interview progress.

## 17. Phase 16 — Security Hardening

Verify:

* Authentication
* Authorization
* User ownership
* Row Level Security
* Input validation
* WebSocket security
* Rate limiting
* File upload security
* Secret management
* Prompt injection protection
* AI output validation
* Sensitive logging controls

Deliverable:

The MVP is safe to expose to real users.

## 18. Phase 17 — Testing

### Unit Tests

Test:

* Interview state transitions
* AI output validation
* Speech metrics
* Score calculations
* Retry comparisons
* API validation

### Integration Tests

Test:

* Authentication
* Database operations
* Interview lifecycle
* AI provider integration
* STT integration
* TTS integration
* WebSocket communication

### End-to-End Tests

Test:

```text
Login
 → Setup Interview
 → Start Interview
 → Hear Question
 → Answer
 → Receive Transcript
 → Receive Evaluation
 → Follow-up
 → Retry
 → Complete Interview
 → View Results
```

## 19. MVP Completion Order

Recommended implementation priority:

```text
1. Project foundation
2. Authentication
3. Database
4. Interview APIs
5. Interview Engine
6. AI Interviewer
7. Basic interview UI
8. Speech-to-Text
9. Speech Analysis
10. Answer Evaluation
11. Text-to-Speech
12. WebSockets
13. Real-Time Interruption
14. Retry System
15. Interview Results
16. History
17. Security Hardening
18. Testing
```

## 20. Development Principle

Build and verify one complete vertical slice before expanding the system.

The first meaningful milestone should be:

```text
User
 ↓
Create Interview
 ↓
AI Question
 ↓
User Answer
 ↓
Transcript
 ↓
Evaluation
 ↓
Feedback
```

Once this flow works reliably, add real-time voice behavior and advanced interaction.

Avoid implementing advanced infrastructure before the core interview loop is functional.
