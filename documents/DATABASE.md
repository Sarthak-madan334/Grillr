# Database Specification

## 1. Overview

The Interview Coach uses PostgreSQL as the primary relational database.

Supabase may be used for managed PostgreSQL, authentication, and storage.

The database stores persistent user, interview, answer, evaluation, and performance data.

Temporary real-time interview state should not be stored in the database unless required for recovery or auditing.

## 2. Core Entities

```text
User
 │
 └── Interview Session
       │
       ├── Questions
       │     └── Answers
       │           ├── Transcript
       │           ├── Speech Metrics
       │           └── Evaluation
       │
       └── Interview Summary
```

## 3. Users

Authentication should primarily be handled by Supabase Auth.

Application-specific user information may be stored separately.

Suggested fields:

```text
users
├── id
├── email
├── name
├── created_at
└── updated_at
```

`id` should correspond to the authenticated user's identity.

## 4. Interview Sessions

Stores each interview attempt.

```text
interview_sessions
├── id
├── user_id
├── interview_type
├── job_role
├── experience_level
├── difficulty
├── personality
├── duration
├── resume_url
├── job_description
├── status
├── started_at
├── completed_at
├── created_at
└── updated_at
```

Possible status values:

```text
created
active
completed
cancelled
failed
```

## 5. Questions

Stores questions generated or used during an interview.

```text
questions
├── id
├── session_id
├── question_number
├── question_text
├── question_type
├── is_follow_up
├── parent_question_id
├── created_at
└── answered_at
```

`parent_question_id` may reference the question that caused a follow-up question.

## 6. Answers

Stores each user response.

```text
answers
├── id
├── question_id
├── session_id
├── attempt_number
├── transcript
├── duration
├── created_at
└── completed_at
```

Multiple answers can belong to the same question when the user retries.

## 7. Speech Metrics

Stores measurable speech characteristics.

```text
speech_metrics
├── id
├── answer_id
├── words_per_minute
├── filler_count
├── pause_count
├── repetition_count
├── duration_seconds
├── word_count
├── created_at
└── updated_at
```

Additional metrics can be added later without changing the interview model.

## 8. Answer Evaluations

Stores AI-generated evaluation results.

```text
answer_evaluations
├── id
├── answer_id
├── relevance_score
├── clarity_score
├── structure_score
├── specificity_score
├── technical_accuracy_score
├── conciseness_score
├── communication_score
├── overall_score
├── strengths
├── weaknesses
├── suggestions
├── improved_answer
├── created_at
└── updated_at
```

Scores should use a consistent scale across the application.

Recommended scale:

```text
0–100
```

## 9. Interview Summaries

Stores final interview-level results.

```text
interview_summaries
├── id
├── session_id
├── overall_score
├── total_questions
├── total_duration
├── average_wpm
├── total_filler_words
├── total_pauses
├── strengths
├── weaknesses
├── recommendations
├── created_at
└── updated_at
```

## 10. Relationships

```text
users
  │
  └──< interview_sessions
          │
          ├──< questions
          │       │
          │       └──< answers
          │               │
          │               ├── speech_metrics
          │               └── answer_evaluations
          │
          └── interview_summaries
```

## 11. Retry Model

Each retry should create a new answer record.

Example:

```text
Question
 │
 ├── Answer attempt 1
 │      └── Evaluation
 │
 ├── Answer attempt 2
 │      └── Evaluation
 │
 └── Answer attempt 3
        └── Evaluation
```

This preserves the complete history and allows improvement comparisons.

## 12. Data Integrity

The database should enforce:

* Foreign key relationships
* Required fields
* Unique identifiers
* Valid status values
* Valid score ranges
* User ownership

Application-level validation should complement database constraints.

## 13. User Data Isolation

Users must only be able to access their own:

* Interview sessions
* Questions
* Answers
* Transcripts
* Evaluations
* Performance data

Supabase Row Level Security should be used where applicable.

## 14. Indexing

Indexes should be added for frequently queried fields.

Recommended indexes:

```text
interview_sessions.user_id
interview_sessions.created_at
questions.session_id
answers.session_id
answers.question_id
answer_evaluations.answer_id
speech_metrics.answer_id
```

Avoid adding indexes without a query requirement.

## 15. Data Retention

The application should define retention rules for:

* Interview transcripts
* Audio recordings, if stored
* Resume files
* Job descriptions
* Evaluation data

Audio should not be permanently stored unless required by the product.

## 16. Database Principles

* Use PostgreSQL as the source of truth for persistent data.
* Use UUIDs for primary identifiers.
* Store timestamps consistently.
* Keep database models normalized.
* Avoid storing duplicated derived data unless useful for performance.
* Keep temporary WebSocket state outside the database.
* Use migrations for schema changes.
* Never modify production schema manually without a migration.
