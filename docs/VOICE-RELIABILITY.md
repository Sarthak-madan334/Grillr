# Voice interview reliability

## Fixes

- A recoverable transcription or turn error no longer removes authentication from a healthy WebSocket. Recording can be retried on the same connection.
- Recording waits for authentication in progress. After a connection closes, the next recording attempt opens and authenticates a new socket. Attempts have a 15-second timeout; late responses from obsolete attempts are ignored.
- Parent callback changes no longer close the socket or stop an active recording.
- Microphone cleanup is separate from question playback. Starting an answer pauses the interviewer, and question audio arriving during recording waits for playback.
- Blocked autoplay leaves an explicit Play button. Audio decoding failures and TTS failures offer device speech when supported.
- Development mock TTS is announced as `audio.unavailable` with the actual question text instead of sending a silent WAV as interviewer speech. Select Play to use the device voice; pause, resume, and replay are supported.
- Voice detection allocates its sample array after setting the analyser size. Silence no longer registers as speech because of unused zero-filled bytes.
- Recorder callbacks belong to their recorder instance, so delayed final chunks or stop events cannot overwrite another recording.
- Recording stays blocked while the server prepares the next turn. The saved transcript remains visible until a new recording starts. Copy explains that transcription happens after recording stops.
- Backend transcription errors restore the listening state, including reconnect/resync. Question progression refreshes the active session.
- Existing dropdown options and suggestions use flat rows without individual glass boxes.

## Validation

Regression coverage includes repeat recordings, transcription failure and retry, disconnect and reauthentication, callback replacement, autoplay rejection and manual playback, device speech, silence/speech detection, late recorder events, transcript retention, provider speech failure, and backend resync after an error.

Verification on 2026-10-20: all 47 frontend tests and 158 backend tests passed. Frontend lint and the production build passed.

## Configuration and limits

Local settings had no Rime, OpenAI, or Groq API keys. Real provider speech and real microphone transcription were not tested against paid external services. Mocked tests exercise the service contracts and browser lifecycle; they do not establish audible quality on a user's device.

`RIME_API_KEY` enables provider speech. Device speech is a browser capability and may require a click; if unavailable, the text question remains usable. Server production configuration still requires its existing Rime setting.

`OPENAI_API_KEY` configures the AI interviewer; `GROQ_API_KEY` configures evaluated feedback. Without these, the pre-existing development interview/evaluation fixtures remain active. This patch does not represent fixture-generated feedback as a verified live AI result.

Modern Web Guidance was searched/listed for audio playback, microphone activity, speech synthesis, and WebSocket recovery. No matching guide applied; browser playback and device speech were checked against MDN documentation.
