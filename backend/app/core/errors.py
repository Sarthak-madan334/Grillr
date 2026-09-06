from typing import Any

from fastapi import Request
from fastapi.exceptions import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette import status


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int, details: Any = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource"):
        super().__init__("not_found", f"{resource} not found", status.HTTP_404_NOT_FOUND)


class ForbiddenError(AppError):
    def __init__(self, message: str = "You do not have access to this resource"):
        super().__init__("forbidden", message, status.HTTP_403_FORBIDDEN)


class InvalidStateError(AppError):
    def __init__(self, message: str):
        super().__init__("invalid_state", message, status.HTTP_409_CONFLICT)


class RateLimitError(AppError):
    def __init__(self, retry_after: int):
        super().__init__("rate_limit_exceeded", "Too many requests. Please try again later", status.HTTP_429_TOO_MANY_REQUESTS, {"retry_after": retry_after})
        self.retry_after = retry_after


def error_body(code: str, message: str, details: Any = None) -> dict[str, Any]:
    body: dict[str, Any] = {"error": {"code": code, "message": message}}
    if details is not None:
        body["error"]["details"] = details
    return body


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    headers = {"Retry-After": str(exc.retry_after)} if isinstance(exc, RateLimitError) else None
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message, exc.details), headers=headers)


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content=error_body("validation_error", "Request validation failed", exc.errors()))


async def http_error_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, dict) else {"code": "http_error", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content=error_body(detail.get("code", "http_error"), detail.get("message", "Request failed"), detail.get("details")))


async def database_error_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=503, content=error_body("database_error", "The database operation could not be completed"))


async def integrity_error_handler(_: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(status_code=409, content=error_body("conflict", "The request conflicts with existing data"))


async def unexpected_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content=error_body("internal_error", "An unexpected error occurred"))
