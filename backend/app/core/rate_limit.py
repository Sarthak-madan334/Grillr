from __future__ import annotations

from collections import defaultdict
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import Depends, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.core.auth import CurrentUser, get_current_user
from app.core.config import Settings, get_settings
from app.core.errors import RateLimitError, error_body


class RateLimiter:
    def __init__(self):
        self._windows: dict[tuple[str, str], tuple[float, int]] = {}
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int, now: float | None = None) -> int | None:
        current = monotonic() if now is None else now
        window_key = (key, str(window_seconds))
        with self._lock:
            started, count = self._windows.get(window_key, (current, 0))
            if current - started >= window_seconds:
                started, count = current, 0
            if count >= limit:
                return max(1, ceil(window_seconds - (current - started)))
            self._windows[window_key] = (started, count + 1)
        return None

    def clear(self):
        with self._lock:
            self._windows.clear()


limiter = RateLimiter()


def client_ip(request: Request) -> str:
    return request.client.host if request.client is not None else "unknown"


def enforce(key: str, limit: int, window_seconds: int):
    retry_after = limiter.check(key, limit, window_seconds)
    if retry_after is not None:
        raise RateLimitError(retry_after)


def auth_rate_limit(request: Request, settings: Settings = Depends(get_settings)):
    enforce(f"ip:{client_ip(request)}:auth", settings.auth_rate_limit, settings.auth_rate_window_seconds)


def user_rate_limit(request: Request, identity: CurrentUser = Depends(get_current_user), settings: Settings = Depends(get_settings)):
    enforce(f"user:{identity.id}", settings.user_rate_limit, settings.user_rate_window_seconds)


def interview_creation_rate_limit(request: Request, identity: CurrentUser = Depends(get_current_user), settings: Settings = Depends(get_settings)):
    enforce(f"user:{identity.id}:interview-create", settings.interview_creation_rate_limit, settings.interview_creation_rate_window_seconds)


def answer_rate_limit(request: Request, identity: CurrentUser = Depends(get_current_user), settings: Settings = Depends(get_settings)):
    enforce(f"user:{identity.id}:answer", settings.answer_rate_limit, settings.answer_rate_window_seconds)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: Settings):
        super().__init__(app)
        self.settings = settings

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method == "OPTIONS":
            return await call_next(request)
        retry_after = limiter.check(
            f"ip:{client_ip(request)}:global",
            self.settings.global_rate_limit,
            self.settings.global_rate_window_seconds,
        )
        if retry_after is not None:
            return JSONResponse(
                status_code=429,
                content=error_body("rate_limit_exceeded", "Too many requests. Please try again later", {"retry_after": retry_after}),
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)