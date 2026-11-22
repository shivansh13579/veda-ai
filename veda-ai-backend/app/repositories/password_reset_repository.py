import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_token
from app.db.models.password_reset_token import PasswordResetToken


class PasswordResetRepository:
    """Data access repository for PasswordResetToken entities."""

    @staticmethod
    async def create_token(
        db: AsyncSession,
        user_id: uuid.UUID,
        raw_token: str,
        expires_at: datetime,
    ) -> PasswordResetToken:
        token_record = PasswordResetToken(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=expires_at,
        )
        db.add(token_record)
        await db.flush()
        await db.refresh(token_record)
        return token_record

    @staticmethod
    async def get_valid_token(
        db: AsyncSession,
        raw_token: str,
        for_update: bool = False,
    ) -> Optional[PasswordResetToken]:
        token_digest = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        stmt = select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_digest,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        if for_update:
            stmt = stmt.with_for_update()
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def mark_used(db: AsyncSession, token_record: PasswordResetToken) -> None:
        token_record.used_at = datetime.now(timezone.utc)
        await db.flush()

