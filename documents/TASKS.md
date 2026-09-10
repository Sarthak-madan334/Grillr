# Pending Tasks Required to Run the AI Interviewer

The repository already contains the AI interviewer, prompt builders, question-generation, answer-evaluation, and fallback provider abstractions. The remaining required work is to configure the repository environment and dependency setup so the real backend AI path activates instead of falling back to mocks.

## Pending Requirements

- [ ] Install the backend Python environment from the repository evidence: `python -m pip install -e ".[test]"` in the backend folder.
- [ ] Install the frontend dependency lockfile from the repository evidence with `npm ci` in the frontend folder if the UI needs to be started locally.
- [ ] Create and verify the backend environment file from `.env.example` and keep `OPENAI_API_KEY`, `GROQ_API_KEY`, and `RIME_API_KEY` blank unless the user supplies them manually.
- [ ] Keep `STT_PROVIDER=whisper` and `WHISPER_MODEL_SIZE=base` in the backend environment file so the free local Whisper route becomes the default no-key STT provider.
- [ ] Keep `GROQ_MODEL` configured for the evaluator service only if the user chooses to supply a Groq evaluator key.
- [ ] Start the backend with the documented local command from the docs: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8001`.
- [ ] Use the frontend `.env.local` file to point `GRILLR_API_URL` and `NEXT_PUBLIC_API_URL` at the running backend port.
- [ ] Smoke test the STT path through the WebSocket answer loop and confirm the `WhisperSpeechToText` provider is selected when no OpenAI key is configured.
- [ ] Verify the test command in the selected environment has the backend test dependencies installed; the current workspace terminal evidence showed `No module named pytest`, so this is still pending.

## Evidence from the Repository

The code already implements:

- `LLMAIInterviewer` in [backend/app/ai/interviewer.py](backend/app/ai/interviewer.py)
- `AICore` and provider semantics in [backend/app/ai/core.py](backend/app/ai/core.py)
- `MockAIInterviewer`, `MockAnswerEvaluator`, and `MockTextToSpeech` fallback behavior in [backend/app/services/providers.py](backend/app/services/providers.py)
- `InterviewService` startup logic that prefers the real LLM interviewer only when `OPENAI_API_KEY` is configured in the app settings in [backend/app/services/interview_service.py](backend/app/services/interview_service.py)

The docs already state the environment requirements and run commands in [docs/local-development.md](docs/local-development.md) and the implementation plan in [documents/IMPLEMENTATION-PLAN.md](documents/IMPLEMENTATION-PLAN.md).
