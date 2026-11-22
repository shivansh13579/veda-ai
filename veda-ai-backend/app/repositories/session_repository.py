import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_token
from app.db.models.refresh_session import RefreshSession


class RefreshSessionRepository:
    """Data access repository for RefreshSession entities."""

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: uuid.UUID,
        raw_token: str,
        expires_at: datetime,
    ) -> RefreshSession:
        session = RefreshSession(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=expires_at,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    @staticmethod
    async def get_by_token(
        db: AsyncSession, raw_token: str, for_update: bool = False
    ) -> Optional[RefreshSession]:
        token_digest = hash_token(raw_token)
        stmt = select(RefreshSession).where(RefreshSession.token_hash == token_digest)
        if for_update:
            stmt = stmt.with_for_update()
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke_session(
        db: AsyncSession,
        session: RefreshSession,
        replaced_by_id: Optional[uuid.UUID] = None,
    ) -> bool:
        """
        Atomically revoke a refresh session if it has not already been revoked.
        Returns True if the session was successfully revoked, False if already revoked (race condition).
        """
        now = datetime.now(timezone.utc)
        stmt = (
            update(RefreshSession)
            .where(RefreshSession.id == session.id, RefreshSession.revoked_at.is_(None))
            .values(revoked_at=now, replaced_by_session_id=replaced_by_id)
        )
        result = await db.execute(stmt)
        await db.flush()
        if result.rowcount > 0:
            session.revoked_at = now
            if replaced_by_id:
                session.replaced_by_session_id = replaced_by_id
            return True
        return False

    @staticmethod
    async def revoke_all_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> None:
        """Revoke all active sessions for a user (used upon password change or security breach)."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(RefreshSession)
            .where(RefreshSession.user_id == user_id, RefreshSession.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.execute(stmt)
        await db.flush()

