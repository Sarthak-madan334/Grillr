from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None

    model_config = {"from_attributes": True}


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int


class ErrorResponse(BaseModel):
    error: dict


class RetryRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=50000)
    duration: float = Field(gt=0, le=3600)
