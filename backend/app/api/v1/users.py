from __future__ import annotations

from typing import Any
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models import User
from app.schemas.common import UserResponse
from app.schemas.user import UserAuthResponse, UserLoginRequest, UserPublic, UserSignupRequest, UserSignupResponse

router = APIRouter()


async def _read_json_response(response: httpx.Response) -> dict[str, Any]:
    payload = response.json()
    if hasattr(payload, "__await__"):
        return await payload
    return payload


def _normalize_name(value: str, field_name: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail=f"{field_name} is required.")
    return trimmed


def _validate_password(password: str) -> None:
    requirements = (
        (len(password) >= 8, "Password must be at least 8 characters long."),
        (any(char.isupper() for char in password), "Password must include at least one uppercase letter."),
        (any(char.islower() for char in password), "Password must include at least one lowercase letter."),
        (any(char.isdigit() for char in password), "Password must include at least one number."),
    )
    for valid, message in requirements:
        if not valid:
            raise HTTPException(status_code=400, detail=message)


async def _create_supabase_user(payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/signup",
                headers={"apikey": settings.supabase_anon_key, "Content-Type": "application/json"},
                json=payload,
            )
    except httpx.HTTPError:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.") from None

    if response.status_code in {400, 409}:
        body = await _read_json_response(response)
        message = str(body.get("msg") or body.get("error") or "").lower()
        if response.status_code == 409 or "already" in message and "registered" in message:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        raise HTTPException(status_code=400, detail="Invalid sign up information.")
    if response.status_code >= 400:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.")
    return await _read_json_response(response)


async def _sign_in_with_supabase(email: str, password: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
                headers={"apikey": settings.supabase_anon_key, "Content-Type": "application/json"},
                json={"email": email, "password": password},
            )
    except httpx.HTTPError:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.") from None
    if response.status_code in {400, 401}:
        raise HTTPException(status_code=401, detail={"code": "invalid_credentials", "message": "Invalid email or password."})
    if response.status_code >= 400:
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable.")
    return await _read_json_response(response)


@router.get("/me", response_model=UserResponse)
def current_user(identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    return db.get(User, identity.id)


@router.post("/signup", response_model=UserSignupResponse, status_code=status.HTTP_201_CREATED)
async def signup_user(payload: UserSignupRequest, db: Session = Depends(get_db)) -> UserSignupResponse:
    first_name = _normalize_name(payload.first_name, "First name")
    last_name = _normalize_name(payload.last_name, "Last name")
    email = payload.email.strip().lower()
    _validate_password(payload.password)
    full_name = f"{first_name} {last_name}"

    auth_result = await _create_supabase_user(
        {
            "email": email,
            "password": payload.password,
            "email_confirm": False,
            "data": {"first_name": first_name, "last_name": last_name, "name": full_name},
        }
    )
    auth_user = auth_result.get("user") or {}
    try:
        user_id = UUID(str(auth_user["id"]))
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=503, detail="Authentication provider returned an invalid user.") from None

    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=email, name=full_name)
        db.add(user)
    else:
        user.email = email
        user.name = full_name
    db.commit()

    session = auth_result.get("session") or {}
    access_token = session.get("access_token")
    return UserSignupResponse(
        user=UserPublic(id=str(user.id), email=user.email, first_name=first_name, last_name=last_name, name=full_name),
        access_token=access_token,
        refresh_token=session.get("refresh_token"),
        requires_email_confirmation=not bool(access_token),
    )


@router.post("/login", response_model=UserAuthResponse)
async def login_user(payload: UserLoginRequest, db: Session = Depends(get_db)) -> UserAuthResponse:
    email = payload.email.strip().lower()
    auth_result = await _sign_in_with_supabase(email, payload.password)
    token = auth_result.get("access_token")
    if not isinstance(token, str) or not token:
        raise HTTPException(status_code=401, detail={"code": "invalid_credentials", "message": "Invalid email or password."})
    auth_user = auth_result.get("user") or {}
    try:
        user_id = UUID(str(auth_user["id"]))
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=503, detail="Authentication provider returned an invalid user.") from None
    metadata = auth_user.get("user_metadata") or {}
    name = metadata.get("name") or email.split("@", 1)[0]
    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, email=email, name=name)
        db.add(user)
    else:
        user.email = email
        user.name = name
    db.commit()
    return UserAuthResponse(user=UserPublic(id=str(user.id), email=user.email, first_name=name.split(" ", 1)[0], last_name=name.split(" ", 1)[-1], name=name), access_token=token, refresh_token=auth_result.get("refresh_token"))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def logout_user() -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)
