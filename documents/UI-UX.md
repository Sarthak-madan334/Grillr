# UI/UX Specification

## 1. Overview

The Interview Coach interface should prioritize realistic interview interaction, clear feedback, and minimal distractions.

The primary experience is voice-first.

The interface should make it immediately clear:

* What the interviewer is saying
* When the user should speak
* What the system is hearing
* What the current interview state is
* How the user is performing

## 2. Core Screens

The MVP should include:

```text
Landing
  ↓
Authentication
  ↓
Dashboard
  ↓
Interview Setup
  ↓
Interview
  ↓
Interview Results
  ↓
Interview History
```

## 3. Dashboard

The dashboard should provide:

* Start interview action
* Recent interviews
* Overall performance summary
* Recent scores
* Improvement indicators

The primary action should be starting a new interview.

## 4. Interview Setup

Users should configure:

* Interview type
* Job role
* Experience level
* Difficulty
* Interviewer personality
* Interview duration
* Optional resume
* Optional job description

The setup interface should clearly distinguish required and optional fields.

## 5. Interview Interface

The interview screen is the primary product experience.

Recommended structure:

```text
┌─────────────────────────────────────┐
│ Interview Type       Time Remaining │
├─────────────────────────────────────┤
│                                     │
│          AI Interviewer             │
│                                     │
│     "Tell me about yourself."       │
│                                     │
│          [ AI speaking ]             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│          Live Transcript            │
│          I worked on...             │
│                                     │
│          [ Microphone ]             │
│                                     │
└─────────────────────────────────────┘
```

The interface should visually distinguish:

* AI speaking
* User speaking
* Processing
* Waiting
* Error states

## 6. Microphone Control

The microphone control should provide clear feedback.

States:

```text
inactive
connecting
listening
recording
processing
error
```

The user should always know whether their microphone is active.

Microphone permission failures should provide a clear recovery action.

## 7. Live Transcript

The transcript should display the user's current speech during an answer.

Partial text should be visually distinguishable from finalized text where useful.

After the answer is finalized, the transcript should become part of the completed answer record.

## 8. AI Speech

When the AI is speaking, the interface should indicate that the user should listen.

The UI may use:

* Audio activity indicator
* Speaking animation
* State label

The animation should communicate state without becoming distracting.

## 9. Interruption

Users should be able to interrupt AI speech naturally.

If the user starts speaking:

1. AI playback should stop.
2. The interface should switch to listening.
3. The user's speech should begin appearing in the transcript.
4. The interview state should remain synchronized.

A visible interrupt control may also be provided.

## 10. Interview Progress

The interface should display useful progress information.

Possible indicators:

```text
Question 4 of 10
Time remaining: 18:42
```

The system should avoid exposing unnecessary internal AI state.

## 11. Answer Feedback

Feedback should be presented after an answer or at the end of the interview according to the selected interview mode.

A feedback view may contain:

```text
Overall Score
82 / 100

Strengths
- Clear explanation
- Good technical reasoning

Needs Improvement
- Answer lacked specific metrics

Speech
117 WPM
8 filler words

Recommendation
Use a clearer structure and provide measurable results.
```

Feedback should be concise and actionable.

## 12. Retry Experience

The retry flow should clearly compare attempts.

Example:

```text
Attempt 1
Score: 68

Attempt 2
Score: 82

Improvement
+14
```

Users should be able to review:

* Original transcript
* Retry transcript
* Scores
* Speech metrics
* Key improvements

The retry action should be easy to access without losing the original attempt.

## 13. Interview Results

The results screen should summarize:

* Overall score
* Answer quality
* Communication performance
* Speech metrics
* Strengths
* Weaknesses
* Recommendations
* Improvement across retries

The most important insights should appear first.

## 14. Interview History

Users should be able to browse previous interviews.

Each entry should show:

```text
Date
Role
Interview Type
Overall Score
Duration
```

Selecting an interview should open its detailed results.

## 15. Responsive Design

The application should work across:

* Desktop
* Tablet
* Mobile

The interview interface should prioritize the microphone, transcript, and current question on smaller screens.

Non-essential information should collapse or move below the primary interaction.

## 16. Accessibility

The interface should support:

* Keyboard navigation
* Visible focus states
* Accessible labels
* Sufficient text contrast
* Screen-reader-friendly controls
* Clear non-color state indicators

Voice interaction must not be the only way to operate important controls.

## 17. Loading States

The UI should provide clear feedback during:

* Interview creation
* AI generation
* Speech processing
* Evaluation
* Loading interview history

Long operations should display progress or status rather than appearing frozen.

## 18. Error States

Errors should be understandable and actionable.

Examples:

```text
Microphone unavailable
→ Check browser permissions

Connection lost
→ Reconnecting...

Speech recognition unavailable
→ Retry answer

AI service unavailable
→ Try again
```

Technical implementation details should not be exposed to users.

## 19. Design Principles

* Voice interaction is the primary experience.
* Keep the interview screen focused.
* Minimize unnecessary UI elements.
* Make system state obvious.
* Provide immediate feedback for user actions.
* Preserve user control.
* Make errors recoverable.
* Keep feedback actionable.
* Maintain consistent interaction patterns.
