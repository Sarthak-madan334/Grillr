from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.usernames import normalize_username

USERNAME_PATTERN = r"^[a-z0-9]+(?:_[a-z0-9]+)*$"


class UsernameUpdateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=USERNAME_PATTERN)

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower() if isinstance(value, str) else value



class UserSignupRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(str_strip_whitespace=True)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    name: str
    username: str | None = None
    username_complete: bool = False
    username_setup_complete: bool = False


class UsernameRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        try:
            return normalize_username(value)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc



class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(str_strip_whitespace=True)


class UserSignupResponse(BaseModel):
    user: UserPublic
    access_token: str | None = None
    refresh_token: str | None = None
    requires_email_confirmation: bool = False


class UserLoginResponse(BaseModel):
    user: UserPublic
    access_token: str | None = None
    refresh_token: str | None = None
