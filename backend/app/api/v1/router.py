from fastapi import APIRouter

from app.api.v1 import users, interviews, answers, questions, websocket

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(answers.router, tags=["answers"])
api_router.include_router(questions.router, tags=["questions"])
api_router.include_router(websocket.router, tags=["realtime"])
