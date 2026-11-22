import uuid
from typing import Callable, List
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, InvalidTokenError, UserInactiveError
from app.core.security import decode_access_token
from app.db.models.user import User, UserRole
from app.db.session import get_db
from app.repositories.user_repository import UserRepository

# HTTP Bearer scheme with automatic 403/401 handling
security_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate JWT access token from Authorization header.
    Resolves the active user entity from database.
    """
    if not credentials or not credentials.credentials:
        raise InvalidTokenError("Missing or malformed Authorization header.")

    payload = decode_access_token(credentials.credentials)
    raw_user_id = payload.get("sub")
    if not raw_user_id:
        raise InvalidTokenError("Token payload missing user identifier.")

    try:
        user_uuid = uuid.UUID(raw_user_id)
    except (ValueError, TypeError):
        raise InvalidTokenError("Malformed user identifier in token.")

    user = await UserRepository.get_by_id(db, user_uuid)
    if not user:
        raise InvalidTokenError("User associated with token no longer exists.")

    if not user.is_active:
        raise UserInactiveError()

    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """
    Factory creating a FastApi dependency that restricts endpoint access to specified roles.
    Raises ForbiddenError (403) if role requirements are not met.
    """

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenError(
                f"Role '{current_user.role}' lacks permission for this operation. Required: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker


# Reusable Role Dependencies
get_current_client = require_roles(UserRole.CLIENT.value, UserRole.ADMIN.value)
get_current_astrologer = require_roles(UserRole.ASTROLOGER.value, UserRole.ADMIN.value)
get_current_admin = require_roles(UserRole.ADMIN.value)

