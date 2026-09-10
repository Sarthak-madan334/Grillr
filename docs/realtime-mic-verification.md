# Realtime microphone verification

## Production route

The production interview route is `frontend/app/interview/[id]/page.tsx`. It mounts `frontend/components/VoiceAnswerPanel.tsx` with the active interview session ID. The legacy `frontend/src/components/live-interview/VoiceInterviewPanel.tsx` is not mounted by the production route.

## Authentication and WebSocket URL

The panel requests `/api/auth/realtime-token` with `credentials: include` and `cache: no-store`. The Next route returns the authenticated `grillr_access_token` cookie value and returns `401` when it is absent. The panel builds the WebSocket URL from `NEXT_PUBLIC_API_URL` and converts `http`/`https` to `ws`/`wss`; the deployed preview therefore uses a secure `wss://` connection when its API URL is HTTPS. The backend authenticates the first WebSocket frame and loads the interview with the authenticated user ID, so a token cannot access another user's session.

## Automated evidence

Backend integration test: `backend/tests/test_websocket.py::test_browser_microphone_bridge_reaches_backend_transcript_event`

It exercises the real FastAPI WebSocket route with the browser-equivalent sequence:

1. `auth`
2. `speech.start`
3. two binary audio frames
4. `speech.stop`
5. `transcript.final`

The test asserts that the backend receives the concatenated binary payload and emits the real transcript event. Production-panel tests also cover denied microphone permission, missing device, token failure, WebSocket failure, clean disconnect, and the absence of mock transcript fallback.

## Manual browser verification

1. Start the backend and frontend locally, or open the deployed preview interview route.
2. Open an authenticated interview at `/interview/<session-id>`.
3. Confirm the browser microphone permission prompt appears.
4. Allow permission, click **Start recording**, speak briefly, then click **Stop recording**.
5. In browser DevTools Network, open the WebSocket connection and confirm the text frames `auth`, `session.start`, `speech.start`, and `speech.stop`, plus binary audio frames between start and stop.
6. Confirm the backend WebSocket handler logs or test capture show the binary payload, then confirm the UI receives `transcript.final`.
7. Deny permission, remove the microphone, expire the realtime token, or close the socket. Each case should show a user-facing error and must not emit demo questions or mock transcripts.
