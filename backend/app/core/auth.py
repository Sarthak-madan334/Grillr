from dataclasses import dataclass
from uuid import UUID, uuid5, NAMESPACE_URL

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import User

bearer = HTTPBearer(auto_error=False)
DEV_USER_ID = uuid5(NAMESPACE_URL, "grillr-development-user")


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    email: str
    name: str | None = None


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "unauthorized", "message": "Authentication is required"}, headers={"WWW-Authenticate": "Bearer"})


def authenticate_token(token: str, db: Session) -> CurrentUser:
    settings = get_settings()
    if token.startswith("dev:") and settings.environment == "development":
        parts = token.split(":", 3)
        try:
            identity = CurrentUser(UUID(parts[1]), parts[2] if len(parts) > 2 else "developer@localhost", parts[3] if len(parts) > 3 else None)
        except (ValueError, IndexError):
            raise _unauthorized()
    else:
        try:
            payload = jwt.decode(token, settings.effective_jwt_secret, algorithms=["HS256"], audience="authenticated")
            user_id = UUID(str(payload["sub"]))
            identity = CurrentUser(user_id, str(payload.get("email", f"{user_id}@supabase.local")), payload.get("user_metadata", {}).get("name"))
        except (JWTError, KeyError, ValueError, TypeError):
            raise _unauthorized()
    user = db.get(User, identity.id)
    if user is None:
        user = User(id=identity.id, email=identity.email, name=identity.name)
        db.add(user)
        db.commit()
    return identity


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> CurrentUser:
    settings = get_settings()
    if credentials is None:
        if settings.auth_required:
            raise _unauthorized()
        return authenticate_token(f"dev:{DEV_USER_ID}:developer@localhost:Development User", db)
    return authenticate_token(credentials.credentials, db)
