import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class UserBase(BaseModel):
    """Base user properties."""

    email: str = Field(..., description="User unique email address")
    full_name: str = Field(..., min_length=2, max_length=255, description="Full legal or display name")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format.")
        return v


class UserRegister(UserBase):
    """Payload for public user registration. Defaults strictly to client role."""

    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 characters)")
    confirm_password: str = Field(..., description="Password confirmation")

    @model_validator(mode="after")
    def passwords_match(self) -> "UserRegister":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class UserLogin(BaseModel):
    """Credentials for authentication."""

    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    """Safe user profile response payload. Excludes password_hash and internal tokens."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    """Payload returned upon successful login or token refresh."""

    access_token: str = Field(..., description="Short-lived JWT bearer token")
    refresh_token: str = Field(..., description="Opaque cryptographically random refresh token")
    token_type: str = Field(default="bearer", description="Token authorization type")
    expires_in: int = Field(..., description="Access token expiration period in seconds")
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Payload to exchange a refresh token for new access and rotated refresh tokens."""

    refresh_token: str = Field(..., description="Active refresh token string")


class ForgotPasswordRequest(BaseModel):
    """Password recovery initiation request."""

    email: str = Field(..., description="Email address associated with the account")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    """Password reset completion request."""

    token: str = Field(..., min_length=10, description="Password reset verification token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    confirm_password: str = Field(..., description="Password confirmation")

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class AuthMessageResponse(BaseModel):
    """Standard success/notice response for authentication actions."""

    status: str = "success"
    message: str
    detail: Optional[str] = None

