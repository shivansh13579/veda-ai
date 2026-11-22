import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestError,
    DuplicateEmailError,
    InvalidCredentialsError,
    InvalidTokenError,
    TokenExpiredError,
    UserInactiveError,
)
from app.core.security import (
    create_access_token,
    generate_secure_random_token,
    get_password_hash,
    verify_password,
)
from app.db.models.user import User, UserRole
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.session_repository import RefreshSessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserLogin, UserRegister
from app.services.email_service import EmailService

logger = logging.getLogger("veda_ai.auth")


class AuthService:
    """Core authentication business logic service."""

    @staticmethod
    async def register_user(db: AsyncSession, payload: UserRegister) -> User:
        """
        Register a new user account.
        Enforces unique email and defaults strictly to the 'client' role.
        """
        existing_user = await UserRepository.get_by_email(db, payload.email)
        if existing_user:
            raise DuplicateEmailError()

        hashed_password = get_password_hash(payload.password)
        new_user = User(
            id=uuid.uuid4(),
            full_name=payload.full_name.strip(),
            email=payload.email,
            password_hash=hashed_password,
            role=UserRole.CLIENT.value,  # Strict client default; prevents role escalation
            is_active=True,
            is_verified=False,
        )
        return await UserRepository.create(db, new_user)

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, payload: UserLogin
    ) -> Tuple[User, str, str]:
        """
        Verify credentials, create a new refresh session, and issue access/refresh tokens.
        """
        user = await UserRepository.get_by_email(db, payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise InvalidCredentialsError()

        if not user.is_active:
            raise UserInactiveError()

        # Issue access token
        access_token = create_access_token(user.id, user.role, user.email)

        # Issue opaque refresh token
        raw_refresh_token = generate_secure_random_token(48)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await RefreshSessionRepository.create_session(
            db=db,
            user_id=user.id,
            raw_token=raw_refresh_token,
            expires_at=expires_at,
        )

        return user, access_token, raw_refresh_token

    @staticmethod
    async def refresh_tokens(
        db: AsyncSession, raw_refresh_token: str
    ) -> Tuple[User, str, str]:
        """
        Rotate refresh token and issue a fresh access token.
        Detects reuse of revoked tokens and invalidates user sessions upon breach.
        """
        session = await RefreshSessionRepository.get_by_token(
            db, raw_refresh_token, for_update=True
        )
        if not session:
            raise InvalidTokenError("Invalid or unrecognized refresh token.")

        # Token Reuse Detection
        if session.revoked_at is not None:
            logger.critical(
                "SECURITY BREACH DETECTED: Revoked refresh token reused for user %s! Invalidating all sessions.",
                session.user_id,
            )
            await RefreshSessionRepository.revoke_all_user_sessions(db, session.user_id)
            await db.commit()
            raise InvalidTokenError("Refresh token has been revoked. Security alert: sessions invalidated.")

        now = datetime.now(timezone.utc)
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now:
            raise TokenExpiredError("Refresh token has expired. Please sign in again.")

        user = await UserRepository.get_by_id(db, session.user_id)
        if not user or not user.is_active:
            raise UserInactiveError()

        # Rotate: generate new refresh token
        new_raw_refresh_token = generate_secure_random_token(48)
        new_expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        new_session = await RefreshSessionRepository.create_session(
            db=db,
            user_id=user.id,
            raw_token=new_raw_refresh_token,
            expires_at=new_expires_at,
        )

        # Mark previous session as revoked and record lineage (atomic CAS)
        was_revoked = await RefreshSessionRepository.revoke_session(
            db=db,
            session=session,
            replaced_by_id=new_session.id,
        )
        if not was_revoked:
            logger.warning(
                "Concurrent refresh detected for session %s. Rejecting concurrent rotation.",
                session.id,
            )
            raise InvalidTokenError("Refresh token has already been rotated.")

        # Issue fresh access token
        new_access_token = create_access_token(user.id, user.role, user.email)

        return user, new_access_token, new_raw_refresh_token

    @staticmethod
    async def logout_session(db: AsyncSession, raw_refresh_token: str) -> None:
        """Revoke the active refresh session."""
        session = await RefreshSessionRepository.get_by_token(
            db, raw_refresh_token, for_update=True
        )
        if session and session.revoked_at is None:
            await RefreshSessionRepository.revoke_session(db, session)

    @staticmethod
    async def request_password_reset(db: AsyncSession, email: str) -> None:
        """
        Initiate password recovery. Generates token and dispatches email.
        Always returns silently to prevent email enumeration.
        """
        user = await UserRepository.get_by_email(db, email)
        if user and user.is_active:
            raw_token = generate_secure_random_token(32)
            expires_at = datetime.now(timezone.utc) + timedelta(
                hours=settings.RESET_TOKEN_EXPIRE_HOURS
            )
            await PasswordResetRepository.create_token(
                db=db,
                user_id=user.id,
                raw_token=raw_token,
                expires_at=expires_at,
            )
            await EmailService.send_password_reset_email(user.email, raw_token)

    @staticmethod
    async def reset_password(
        db: AsyncSession, raw_token: str, new_password: str
    ) -> None:
        """
        Complete password recovery with token single-use enforcement.
        Revokes all existing refresh sessions upon successful reset.
        """
        token_record = await PasswordResetRepository.get_valid_token(
            db, raw_token, for_update=True
        )
        if not token_record:
            raise BadRequestError("Invalid or expired password reset token.")

        user = await UserRepository.get_by_id(db, token_record.user_id)
        if not user or not user.is_active:
            raise UserInactiveError()

        # Update password
        user.password_hash = get_password_hash(new_password)
        await UserRepository.update(db, user)

        # Mark token used (single-use enforcement)
        await PasswordResetRepository.mark_used(db, token_record)

        # Invalidate all prior refresh sessions for security
        await RefreshSessionRepository.revoke_all_user_sessions(db, user.id)
