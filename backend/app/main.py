from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes
from app.services.interview_service import InterviewService

app = FastAPI(title="The Interview Coach API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = InterviewService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/interviews")
def get_interviews() -> dict[str, object]:
    return service.list()


@app.post("/api/v1/interviews")
def create_interview(payload: dict[str, object]) -> dict[str, object]:
    try:
        return service.create(type("Payload", (), payload)())
    except Exception as exc:  # pragma: no cover - defensive fallback for MVP
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/v1/interviews/{session_id}")
def get_interview(session_id: str) -> dict[str, object]:
    try:
        return service.get_interview(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
