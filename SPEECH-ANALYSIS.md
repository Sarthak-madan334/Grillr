# Speech Analysis Specification

## 1. Overview

Speech Analysis evaluates how the user communicates during an interview.

It operates alongside speech-to-text and answer evaluation to identify communication patterns that may affect interview performance.

Core pipeline:

```text
User Speech
    ↓
Audio Stream
    ↓
Speech-to-Text
    ↓
Transcript + Timing Data
    ↓
Speech Analysis
    ↓
Speech Metrics
    ↓
Feedback
```

## 2. Responsibilities

The Speech Analysis system should measure:

* Speaking duration
* Word count
* Words per minute
* Filler words
* Pauses
* Repetition
* Excessive rambling
* Speech consistency

The system should focus on actionable communication feedback rather than judging accents or speaking styles.

## 3. Input

Speech analysis may use:

* Audio stream
* Final transcript
* Partial transcript
* Word timestamps
* Speech start/end timestamps
* Voice activity information

The exact inputs depend on the selected STT provider.

## 4. Speaking Duration

Speaking duration is the total time between the beginning and end of an answer.

```text
duration = speech_end - speech_start
```

Duration should be stored in seconds.

The system should distinguish between:

* Active speaking time
* Significant silence
* Total answer duration

## 5. Word Count

Word count should be calculated from the final transcript.

The implementation should normalize:

* Punctuation
* Whitespace
* Transcript artifacts
* Repeated partial words where appropriate

The same normalization rules should be used consistently.

## 6. Words Per Minute

Speaking speed should be calculated as:

```text
WPM = word_count / speaking_minutes
```

The metric should use active speaking time where reliable timing information is available.

If accurate timing data is unavailable, total answer duration may be used as a fallback.

## 7. Filler Words

The system should detect common filler words and phrases.

Examples:

```text
um
uh
like
you know
basically
actually
so
```

The filler-word dictionary should be configurable.

The system should store:

* Total filler count
* Filler frequency
* Detected filler terms

Filler detection should not automatically classify natural conversational usage as a problem.

## 8. Pauses

The system should identify significant pauses during an answer.

Possible pause categories:

```text
short
medium
long
```

Thresholds should be configurable.

The system should track:

* Pause count
* Total pause duration
* Longest pause
* Average pause duration

Short natural pauses should not be treated as negative by default.

## 9. Repetition

The system should detect unnecessary repetition of:

* Words
* Phrases
* Sentences
* Ideas

Repeated technical terms or intentionally emphasized concepts should not automatically be considered problematic.

Repetition analysis should provide evidence that can be used by the evaluation system.

## 10. Rambling Detection

Rambling should identify answers that contain excessive or poorly structured content.

Signals may include:

* Excessive answer duration
* High repetition
* Low relevance
* Frequent topic changes
* Excessive filler usage
* Lack of clear structure

Rambling should not be determined using duration alone.

The final assessment should combine speech metrics with answer relevance and structure.

## 11. Speech Quality

The system should avoid evaluating characteristics that are not directly relevant to interview performance.

Do not penalize users based on:

* Accent
* Native language
* Voice pitch
* Gender
* Speaking style differences that do not affect clarity

The focus should remain on clarity, pacing, structure, and effective communication.

## 12. Metric Output

Example:

```json
{
  "duration_seconds": 94,
  "word_count": 183,
  "words_per_minute": 117,
  "filler_count": 8,
  "pause_count": 5,
  "long_pause_count": 1,
  "repetition_count": 3,
  "rambling_score": 24
}
```

Metrics should use consistent definitions across the application.

## 13. Analysis Pipeline

```text
Audio
  ↓
STT
  ↓
Transcript
  ↓
Timestamp Processing
  ↓
┌───────────────────────┐
│ Speech Metrics        │
│                       │
│ Duration              │
│ Word Count            │
│ WPM                   │
│ Fillers               │
│ Pauses                │
│ Repetition            │
│ Rambling              │
└───────────┬───────────┘
            ↓
      Answer Evaluation
            ↓
         Feedback
```

## 14. Real-Time Analysis

Where supported, the system may calculate partial metrics during an answer.

Real-time metrics may include:

* Current speaking duration
* Partial word count
* Approximate WPM
* Detected filler words
* Current pause state

Final metrics must be recalculated from the completed answer before persistence.

## 15. Feedback Integration

Speech metrics should be converted into actionable feedback.

Example:

```text
Metric:
High filler-word frequency

Feedback:
You used several filler words while explaining your approach.
Try pausing briefly instead of using "um" or "like".
```

Feedback should prioritize the most important communication issues rather than listing every detected metric.

## 16. Provider Abstraction

Speech analysis must remain independent from the specific STT provider.

Example:

```text
STT Provider
     ↓
Normalized Transcript
     ↓
Speech Analyzer
     ↓
Standard Metrics
```

Provider-specific timestamp or transcript formats should be normalized before analysis.

## 17. Failure Handling

If speech analysis fails:

* Preserve the transcript.
* Preserve the answer.
* Continue answer evaluation where possible.
* Mark unavailable metrics appropriately.
* Log the processing failure.

Speech analysis failure must not invalidate the interview session.

## 18. Storage

Final speech metrics should be stored with the corresponding answer.

Temporary real-time metrics should remain in session state unless persistence is required.

The database model is defined in `05-DATABASE.md`.

## 19. Testing

Tests should cover:

* Word counting
* WPM calculation
* Filler detection
* Pause detection
* Repetition detection
* Missing timestamp handling
* Empty transcripts
* Very short answers
* Long answers
* Provider-specific transcript normalization

## 20. Principles

* Prefer deterministic calculations where possible.
* Keep metric definitions consistent.
* Separate raw speech data from derived metrics.
* Avoid biased speech judgments.
* Use AI only where deterministic analysis is insufficient.
* Preserve raw transcript data for reproducibility.
* Make thresholds configurable.
* Keep speech analysis independent from external providers.
