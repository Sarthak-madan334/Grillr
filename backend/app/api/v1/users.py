from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.common import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def current_user(identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    return db.get(User, identity.id)
