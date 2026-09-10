# Rime Voice Integration

## Overview

Grillr uses Rime as a server-side text-to-speech provider for interview questions. The backend converts a generated question into audio bytes and sends those bytes to the authenticated interview client. Rime credentials are kept on the backend and are never exposed to the browser.

## Purpose

Question audio lets a candidate hear the interviewer speak the prompt while keeping the written question available as the primary fallback. Answer recording, transcription, speech analysis, and evaluation remain separate parts of the interview flow.

## Integration

The backend creates the configured text-to-speech provider through `create_text_to_speech()` in `backend/app/services/providers.py`. When the realtime interview server prepares a question, `backend/app/api/v1/websocket.py` synthesizes the question text and sends an `audio.ai` WebSocket event containing:

- `question_id`
- `question_number`
- `media_type`
- Base64-encoded `audio_base64`

The frontend receives this event in `frontend/components/VoiceAnswerPanel.tsx`, converts the bytes into a browser object URL, and plays them with an `HTMLAudioElement`. The browser owns playback controls and events; the frontend does not call Rime directly.

There is also an HTTP question-audio route at `GET /api/v1/questions/{question_id}/audio`, proxied by the frontend questions API route. `frontend/components/QuestionAudioPlayer.tsx` can consume that route, but the active realtime interview flow receives question audio through the WebSocket event.

## Frontend Flow

1. The interview backend generates a question.
2. The realtime server requests speech audio from the configured provider.
3. The server sends the resulting audio bytes in `audio.ai`.
4. The frontend creates an object URL and loads it into an audio element.
5. Native browser audio events drive the visible loading, ready, playing, paused, completed, and error states.
6. The written question remains available regardless of audio success.

The active voice interview does not claim that audio is ready until the browser has accepted the audio for playback. Autoplay failures are presented as a user-facing fallback.

## Configuration

The backend reads settings from its environment using Pydantic settings. The relevant variables are:

```env
RIME_API_KEY=...
NEXT_PUBLIC_API_URL=https://your-api-host.example
GRILLR_API_URL=https://your-api-host.example
```

`RIME_API_KEY` is a backend secret and must not be committed or exposed through `NEXT_PUBLIC_*` variables. `NEXT_PUBLIC_API_URL` is used by the browser for the realtime WebSocket connection. `GRILLR_API_URL` is used by frontend server routes when configured.

In production, the backend configuration requires `RIME_API_KEY`. Development configuration may use the repository's configured provider behavior, but real provider output still requires a valid provider setup.

## Playback States

The realtime question-audio control represents states from actual browser audio events:

- **Loading:** audio bytes were received and the browser is preparing them.
- **Ready:** metadata is available and the question can be played.
- **Playing:** the audio element is actively playing.
- **Paused:** playback was paused and can be resumed.
- **Completed:** playback reached the end and can be replayed.
- **Error:** audio could not be loaded or played; the text question remains usable.

The control also displays real playback time and duration when the browser provides duration metadata. The seek control changes the current time of the same audio element.

## Error Handling

Provider configuration and provider failures are converted by the backend into a user-safe WebSocket error. The frontend keeps the interview available and shows a concise error state rather than provider names, raw responses, or stack traces.

Browser playback failures, unsupported audio, network failures, and autoplay restrictions are handled through the audio element's error or rejected `play()` promise. The user can continue using the written question and proceed with voice recording.

## Fallback

Audio is an enhancement to the interview prompt, not a prerequisite. If generation or playback fails, Grillr leaves the question text and voice-answer controls available. No successful audio result is fabricated when the provider or browser cannot produce one.

## Testing

Frontend checks are run from the `frontend` directory:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npx vitest run src/__tests__/voice-answer-panel.test.tsx src/__tests__/question-audio-player.test.tsx
```

The voice-panel tests exercise the WebSocket audio event and browser playback state transitions with test doubles. They do not prove that a live Rime request succeeds.

A live provider verification requires the backend environment to contain a valid `RIME_API_KEY`, a running backend, an authenticated interview session, and an actual question-audio request or realtime interview.

## Verification

The frontend audio state behavior and existing automated tests have been checked in this repository. Live Rime playback was not verified in this environment because external provider credentials and a running authenticated backend were not available.

## Limitations

- Audio generation depends on backend availability and the configured Rime service.
- Browser autoplay policies may reject automatic playback; explicit play interaction remains available.
- Network and provider latency can delay audio readiness.
- Browser audio format support affects playback.
- The realtime WebSocket connection is required for the active interview voice flow.
