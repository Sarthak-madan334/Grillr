# Real-Time Interruption Specification

## 1. Overview

The Interview Coach must support natural, real-time voice interaction between the user and AI interviewer.

The system should allow:

* Streaming user audio
* Streaming AI audio
* Partial transcription
* Voice activity detection
* User interruption of AI speech
* AI interruption handling
* Real-time session state synchronization

The goal is to make the interaction feel like a live interview rather than turn-based chat.

## 2. Real-Time Architecture

```text
User Microphone
      ↓
Frontend Audio Capture
      ↓
WebSocket
      ↓
FastAPI WebSocket Handler
      ↓
Speech / AI Services
      ↓
WebSocket
      ↓
Frontend
      ↓
AI Audio / Transcript
```

## 3. Connection Lifecycle

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

The backend must reject connections that are:

* Unauthenticated
* Associated with an invalid session
* Associated with another user's session
* Using an invalid session state

## 4. Session States

The real-time layer should maintain explicit states:

```text
created
asking
ai_speaking
listening
processing
follow_up
completed
error
```

The Interview Engine remains the source of truth for interview state.

The WebSocket layer is responsible for communicating state changes to the client.

## 5. Audio Streaming

The frontend captures microphone audio and sends it through the WebSocket connection.

Audio should preferably be transmitted as binary frames.

Example:

```text
Microphone
    ↓
Audio Chunk
    ↓
WebSocket Binary Frame
    ↓
Backend
    ↓
STT Provider
```

The implementation should use a consistent audio format supported by the selected speech provider.

## 6. Partial Transcription

During an answer, the STT service may produce partial transcripts.

Example event:

```json
{
  "type": "transcript.partial",
  "data": {
    "text": "I worked on a distributed..."
  }
}
```

Partial transcripts should:

* Be displayed in the UI
* Not be persisted as final answers
* Be replaceable by newer transcript updates

The final transcript becomes the authoritative answer text.

## 7. Final Transcription

When the user stops speaking, the backend should request or receive the final transcript.

Example:

```json
{
  "type": "transcript.final",
  "data": {
    "answer_id": "uuid",
    "text": "I worked on a distributed system..."
  }
}
```

The final transcript should trigger:

```text
Final Transcript
      ↓
Speech Analysis
      ↓
Answer Evaluation
      ↓
Interview Decision
```

## 8. AI Audio Streaming

AI responses should be streamed to the frontend where supported.

```text
AI Response Text
      ↓
TTS
      ↓
Audio Chunks
      ↓
WebSocket
      ↓
Frontend Playback
```

The frontend should begin playback without waiting for the complete audio response when technically possible.

## 9. User Interruption

The user must be able to interrupt AI speech.

Example:

```json
{
  "type": "interview.interrupt",
  "data": {}
}
```

When an interruption occurs:

1. Stop AI audio playback.
2. Cancel active TTS generation where supported.
3. Update session state.
4. Begin listening for the user's response.
5. Preserve already-generated AI text for context when appropriate.

## 10. Voice Activity Detection

Voice Activity Detection may be used to identify when the user:

* Starts speaking
* Stops speaking
* Pauses
* Resumes speaking

Example events:

```text
speech.start
speech.stop
```

VAD should be used to improve responsiveness but should not be the sole source of truth for final answer boundaries when reliable STT signals are available.

## 11. AI Interruption Handling

If the user starts speaking while the AI is speaking:

```text
AI Speaking
    ↓
User Speech Detected
    ↓
Stop AI Playback
    ↓
Cancel TTS
    ↓
Switch to Listening
```

The system should avoid continuing AI speech over the user's voice.

## 12. Event Protocol

All control events should use:

```json
{
  "type": "event_name",
  "data": {}
}
```

Core client events:

```text
session.start
audio.chunk
speech.start
speech.stop
interview.interrupt
answer.retry
session.end
```

Core server events:

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

Event names and payloads should remain version-compatible.

## 13. Event Ordering

The backend should maintain logical event ordering.

Example:

```text
question.created
      ↓
audio.ai
      ↓
speech.start
      ↓
transcript.partial
      ↓
transcript.final
      ↓
answer.evaluated
      ↓
question.follow_up
```

Clients must not assume that network arrival order always represents business state.

Important state transitions should include sufficient metadata for the frontend to reconcile state.

## 14. Reconnection

The frontend should attempt to reconnect after temporary WebSocket failures.

On reconnection:

1. Re-authenticate.
2. Validate the session.
3. Request current session state.
4. Synchronize the client state.
5. Resume the interview where possible.

The backend must avoid creating duplicate answers or questions during reconnection.

## 15. Heartbeats

The WebSocket connection should support heartbeat or ping/pong behavior to detect stale connections.

The server should close connections that remain inactive beyond a configured timeout when appropriate.

## 16. Error Handling

Real-time errors should use structured events.

Example:

```json
{
  "type": "error",
  "data": {
    "code": "STT_UNAVAILABLE",
    "message": "Speech recognition is temporarily unavailable."
  }
}
```

Recoverable errors should allow the session to continue whenever possible.

Examples:

* TTS failure → show text question or retry audio
* STT failure → allow answer retry
* AI failure → retry generation
* WebSocket disconnect → reconnect and synchronize

## 17. Concurrency

The backend must prevent conflicting operations within the same interview session.

Examples:

* Two answers must not be processed simultaneously for the same question.
* Multiple retry requests must not create duplicate attempts.
* A completed session must reject new answer processing.
* AI speech cancellation must not race with a new question generation.

Session-level locking or equivalent coordination may be used where required.

## 18. Latency Goals

The system should optimize for low perceived latency.

Priority areas:

* Audio transmission
* Partial transcription
* AI response generation
* TTS generation
* WebSocket event delivery

Long-running processing should not block unrelated real-time operations.

## 19. Security

The WebSocket layer must:

* Authenticate connections.
* Validate session ownership.
* Validate incoming event types.
* Validate payloads.
* Limit message sizes.
* Rate-limit abusive clients.
* Avoid exposing provider credentials.
* Close invalid or unauthorized connections.

## 20. Observability

The backend should log important real-time events including:

* Connection established
* Authentication failure
* Session started
* Session completed
* Reconnection
* Provider failures
* Unexpected disconnects
* Processing failures

Logs must not contain sensitive audio, transcripts, tokens, or credentials unless explicitly required and protected.

## 21. Testing

Real-time tests should cover:

* Connection authentication
* Session validation
* Audio streaming
* Partial transcripts
* Final transcripts
* AI audio streaming
* User interruption
* Reconnection
* Duplicate events
* Concurrent operations
* Provider failures
* Session completion

## 22. Principles

* Keep real-time state explicit.
* Prefer streaming over unnecessary request/response waits.
* Interrupt AI speech immediately when the user speaks.
* Preserve user answers during failures.
* Make reconnection safe.
* Prevent duplicate processing.
* Keep WebSocket transport separate from interview business logic.
* Optimize for perceived responsiveness.
