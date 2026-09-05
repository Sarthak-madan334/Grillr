# AI Interviewer Specification

## 1. Overview

The AI Interviewer is responsible for conducting realistic, adaptive mock interviews.

It should behave like an interviewer rather than a general-purpose chatbot.

Core loop:

```text
Question
   ↓
User Answer
   ↓
Analyze
   ↓
Decide
   ├── Follow-up
   ├── Clarification
   └── Next Question
   ↓
Continue Interview
```

## 2. Responsibilities

The AI Interviewer is responsible for:

* Generating interview questions
* Asking one question at a time
* Maintaining interview context
* Understanding user answers
* Generating relevant follow-ups
* Asking clarification questions when necessary
* Adapting difficulty
* Maintaining interviewer personality
* Avoiding unnecessary conversation
* Providing final interview feedback

## 3. Interview Context

The interviewer should receive only the context required for the current decision.

Relevant context may include:

```text
Interview type
Job role
Experience level
Difficulty
Interviewer personality
Interview objectives
Previous questions
Previous answers
Current answer
Answer evaluation
Remaining interview time
```

Large or irrelevant conversation history should be avoided when possible.

## 4. Question Generation

Questions should be:

* Relevant to the selected role
* Appropriate for the user's experience level
* Consistent with the interview type
* Appropriate for the selected difficulty
* Clear and concise
* Suitable for spoken interaction

The interviewer should ask one primary question at a time.

Questions should not contain unnecessary explanations unless clarification is required.

## 5. Follow-Up Questions

Follow-ups should be generated when the answer provides a meaningful opportunity to investigate further.

Examples:

```text
Incomplete answer
      ↓
Clarification question

Strong claim
      ↓
Evidence question

Technical decision
      ↓
Reasoning question

Vague response
      ↓
Specificity question
```

Follow-ups should be contextual rather than randomly generated.

The interviewer should avoid repeatedly asking the same question in different wording.

## 6. Follow-Up Decision

The system should determine whether to:

1. Ask a follow-up.
2. Ask a clarification.
3. Move to the next question.

The decision should consider:

* Answer completeness
* Relevance
* Specificity
* Interview objectives
* Available interview time
* Number of follow-ups already asked

The MVP should limit excessive follow-ups to prevent interviews from becoming repetitive.

## 7. Difficulty Adaptation

Difficulty may be adjusted based on performance.

Examples:

```text
Consistently strong answers
        ↓
Increase difficulty

Consistently weak answers
        ↓
Maintain or slightly reduce difficulty

Mixed performance
        ↓
Keep current difficulty
```

Difficulty changes should be gradual and should not make the interview unpredictable.

## 8. Interviewer Personalities

### Friendly

* Encouraging
* Conversational
* Supportive
* Less confrontational

### Professional

* Neutral
* Structured
* Business-like
* Focused

### Tough

* Challenging
* Probing
* Less forgiving of vague answers

### Direct

* Concise
* Blunt
* Highly focused

Personality affects communication style, not evaluation standards.

The interviewer must never become insulting, abusive, discriminatory, or personally hostile.

## 9. Interview State

The AI Interviewer should operate using explicit interview state.

Example:

```text
CREATED
   ↓
ASKING
   ↓
LISTENING
   ↓
PROCESSING
   ↓
FOLLOW_UP / NEXT_QUESTION
   ↓
LISTENING
   ↓
COMPLETED
```

The AI should not independently control persistent session state.

The Interview Engine remains the source of truth for session state.

## 10. Evaluation Integration

The AI Interviewer may receive structured evaluation results rather than raw evaluation instructions.

Example:

```json
{
  "overall_score": 72,
  "relevance": 80,
  "clarity": 65,
  "structure": 60,
  "specificity": 55,
  "technical_accuracy": 85
}
```

These results can inform follow-up decisions and difficulty adaptation.

Evaluation standards must remain consistent regardless of interviewer personality.

## 11. Prompt Design

System prompts should define:

* Interviewer role
* Interview objective
* Interview type
* Candidate context
* Personality
* Difficulty
* Behavioral rules
* Output format
* Safety constraints

Application code should provide dynamic interview context separately from the core system instructions.

## 12. Structured AI Output

AI decisions should use structured output wherever supported.

Example:

```json
{
  "action": "follow_up",
  "question": "What was your specific contribution?",
  "reason": "The candidate described the team result but did not explain their individual contribution."
}
```

Possible actions:

```text
follow_up
clarification
next_question
complete
```

The backend should validate AI output before using it.

Invalid AI output must result in a recoverable error rather than an invalid interview state.

## 13. Voice Interaction Rules

Questions intended for voice playback should:

* Be concise
* Use natural spoken language
* Avoid long lists
* Avoid complex formatting
* Avoid unnecessary disclaimers
* Contain a clear question

The AI should wait for the user's response rather than continuously speaking.

## 14. Retry Behavior

When a user retries an answer:

1. Preserve the original attempt.
2. Provide the retry context to the evaluation system.
3. Evaluate the new answer independently.
4. Compare the attempts.
5. Continue the interview using the latest valid attempt.

The interviewer should not treat a retry as a new interview question.

## 15. Resume and Job Description Context

When available, resume and job-description information may be used to:

* Generate relevant questions
* Identify experience areas to probe
* Create role-specific follow-ups
* Test claims made in the resume
* Match questions to job requirements

The AI should not invent facts about the candidate.

## 16. AI Provider Abstraction

The application should access the AI model through an internal interface.

Example:

```text
AIInterviewer
      │
      ▼
AI Service Interface
      │
      ▼
LLM Provider
```

Provider-specific implementation details must remain outside the Interview Engine.

## 17. Failure Handling

If the AI provider fails:

* Preserve the current interview state.
* Do not lose the user's answer.
* Retry transient failures where appropriate.
* Return a controlled error for unrecoverable failures.
* Allow the interview to resume where possible.

AI failures must not corrupt persistent interview data.

## 18. AI Principles

* The interviewer should feel realistic.
* Questions should be contextual.
* Follow-ups should have a clear purpose.
* One question should be asked at a time.
* Evaluation standards must remain consistent.
* AI output must be validated.
* The backend remains the source of truth.
* Provider-specific logic must remain isolated.
* The interviewer should optimize for useful practice, not maximum conversation.
