# Security Specification

## 1. Overview

The Interview Coach must protect user accounts, interview data, transcripts, resumes, job descriptions, and AI service credentials.

Security should be implemented across:

* Authentication
* Authorization
* API access
* WebSocket connections
* Data storage
* File storage
* AI provider access
* Logging
* Rate limiting

## 2. Authentication

Supabase Auth is responsible for user authentication.

The backend must:

1. Validate authentication tokens.
2. Identify the authenticated user.
3. Reject invalid or expired credentials.
4. Never trust user identity supplied directly in request bodies.

Protected resources must require authentication.

## 3. Authorization

Authentication alone is not sufficient.

Every protected resource must verify ownership.

Users may only access their own:

* Interview sessions
* Questions
* Answers
* Transcripts
* Evaluations
* Performance data
* Resume files
* Job descriptions

Unauthorized access should return an appropriate error without exposing resource details.

## 4. WebSocket Security

WebSocket connections must be authenticated before accessing an interview session.

The backend must validate:

* Authentication
* Session ownership
* Session state
* Event type
* Event payload
* Message size

Invalid or unauthorized connections should be closed safely.

WebSocket authentication must not rely only on an untrusted session ID.

## 5. API Security

REST endpoints must:

* Require authentication where appropriate.
* Validate all request data.
* Enforce authorization.
* Apply rate limits to expensive operations.
* Return structured errors.
* Avoid exposing internal implementation details.

Client-provided user IDs must never determine resource ownership.

## 6. Input Validation

All external input must be validated at the application boundary.

Validate:

* UUIDs
* Enums
* Text lengths
* Interview configuration
* Pagination values
* File metadata
* WebSocket events
* Audio message sizes

Pydantic should be used for backend request and response validation.

## 7. Secrets Management

Secrets must be stored using environment variables or a secure secrets manager.

Examples:

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AI_API_KEY
STT_API_KEY
TTS_API_KEY
```

Secrets must never be:

* Committed to Git
* Included in frontend bundles
* Returned through APIs
* Logged
* Embedded in WebSocket messages

The Supabase service-role key must remain server-side only.

## 8. Data Protection

Sensitive user data should be protected both in transit and at rest.

Use:

* HTTPS for HTTP communication
* Secure WebSocket connections
* Encrypted managed database/storage services where available
* Access-controlled file storage

The application should minimize collection and storage of unnecessary data.

## 9. Interview Data

Interview transcripts and evaluations may contain personal or professional information.

Access must be restricted to the authenticated owner.

The system should avoid exposing:

* Private transcripts
* Resume contents
* Job descriptions
* Internal prompts
* Provider credentials
* Internal system errors

## 10. Resume and File Security

Resume uploads must be treated as untrusted input.

The system should:

* Validate file type
* Enforce file size limits
* Generate safe storage identifiers
* Restrict access by user ownership
* Avoid executing uploaded files
* Prevent arbitrary path manipulation

Uploaded files should not be publicly accessible unless explicitly required.

## 11. AI Security

User-provided content may contain malicious or misleading instructions.

The AI system should treat:

* Resume content
* Job descriptions
* Interview answers
* Transcripts

as untrusted context rather than system instructions.

System-level AI instructions must remain separate from user-provided content.

The application must not expose internal prompts or provider credentials through generated responses.

## 12. Prompt Injection Protection

The system should assume that user-controlled text can contain prompt injection attempts.

Controls should include:

* Clear separation of trusted and untrusted context
* Structured prompt construction
* Restricted AI actions
* Server-side validation of AI output
* No direct execution of AI-generated instructions

AI output must never directly control privileged application operations without validation.

## 13. AI Output Validation

Structured AI responses must be validated before use.

For example:

```json
{
  "action": "follow_up",
  "question": "What was your specific contribution?",
  "reason": "The answer did not clearly identify individual contribution."
}
```

The backend should validate:

* Allowed action
* Required fields
* Text length
* Valid interview state
* Consistency with current session

Invalid AI output should trigger a safe fallback or retry.

## 14. Rate Limiting

Rate limits should protect expensive and abuse-prone operations.

Potential targets:

* Interview creation
* Answer retry
* AI generation
* Speech processing
* WebSocket connections
* Authentication endpoints

Limits should be applied per user and, where appropriate, per IP or connection.

## 15. Idempotency

Operations that may be retried must prevent duplicate effects.

Use idempotency keys for operations such as:

```text
POST /api/v1/interviews
POST /api/v1/interviews/{session_id}/cancel
POST /api/v1/questions/{question_id}/retry
```

This is especially important during WebSocket reconnection or network failures.

## 16. Logging

Security and operational events should be logged.

Examples:

* Authentication failures
* Authorization failures
* Invalid WebSocket connections
* Rate-limit violations
* Provider failures
* Unexpected application errors

Logs must not contain:

* API keys
* Access tokens
* Passwords
* Sensitive user data
* Raw audio
* Full transcripts unless explicitly required and protected

## 17. Error Handling

User-facing errors should provide enough information for recovery without revealing internal details.

Do not expose:

* Stack traces
* Database errors
* Provider credentials
* Internal service topology
* Prompt contents
* Internal file paths

Detailed errors may be recorded securely in server-side logs.

## 18. Database Security

The database should enforce:

* Foreign keys
* Valid constraints
* User ownership
* Appropriate indexes
* Restricted credentials

Where Supabase is used, Row Level Security should protect user-owned data.

Application-level authorization should still be maintained for backend operations.

## 19. Privacy

The product should collect only data required for its functionality.

The system should define policies for:

* Transcript retention
* Resume retention
* Job-description retention
* Audio retention
* Evaluation retention
* Account deletion

Audio recordings should not be permanently stored unless required by the product.

## 20. Account and Data Deletion

Users should eventually be able to delete their account and associated application data.

Deletion should consider:

* Interview sessions
* Questions
* Answers
* Transcripts
* Evaluations
* Uploaded files
* Performance history

Authentication records managed by Supabase should follow the configured account-deletion process.

## 21. Dependency Security

Dependencies should be kept reasonably up to date.

The project should use:

* Dependency lock files
* Automated vulnerability scanning where practical
* Minimal third-party dependencies
* Regular dependency updates

New dependencies should have a clear justification.

## 22. Security Testing

Security testing should cover:

* Authentication failures
* Authorization failures
* Cross-user resource access
* Invalid tokens
* WebSocket authentication
* WebSocket event validation
* Rate limiting
* File upload validation
* Prompt injection
* Invalid AI output
* Duplicate requests
* Sensitive information leakage

## 23. Security Principles

* Never trust client-provided identity.
* Authenticate before accessing protected resources.
* Authorize every protected resource.
* Treat user content as untrusted.
* Keep secrets server-side.
* Validate all external input.
* Validate AI output before use.
* Minimize stored sensitive data.
* Avoid sensitive logging.
* Prefer secure defaults.
* Fail safely.
* Keep security controls simple enough to maintain.
