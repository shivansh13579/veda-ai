import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError

# Initialize Argon2 Password Hasher via pwdlib
_password_hash = PasswordHash((Argon2Hasher(),))


def get_password_hash(password: str) -> str:
    """Hash plaintext password using Argon2."""
    return _password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against stored Argon2 hash."""
    return _password_hash.verify(plain_password, hashed_password)


def hash_token(raw_token: str) -> str:
    """
    Produce a deterministic cryptographic SHA-256 hash of a raw token.
    Only token hashes are stored in the database.
    """
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_secure_random_token(nbytes: int = 48) -> str:
    """Generate a high-entropy cryptographically secure URL-safe random string."""
    return secrets.token_urlsafe(nbytes)


def create_access_token(
    user_id: Union[str, Any],
    role: str,
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Encode short-lived JWT access token with identity and role claims.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "email": email,
        "exp": expire,
        "iat": now,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT access token.
    Raises TokenExpiredError if expired or InvalidTokenError if signature/type is invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "access" or not payload.get("sub"):
            raise InvalidTokenError("Invalid token structure or type.")
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except (jwt.PyJWTError, Exception):
        raise InvalidTokenError()

