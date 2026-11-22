import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.birth_profile import BirthProfile


class BirthProfileRepository:
    """
    Data access repository for BirthProfile entities.
    Enforces strict user scoping on all queries to prevent cross-tenant data access.
    """

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
        **kwargs: Any,
    ) -> BirthProfile:
        """Create and persist a new birth profile strictly bound to user_id."""
        profile = BirthProfile(user_id=user_id, **kwargs)
        db.add(profile)
        await db.flush()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def get_profile_by_id(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
        for_update: bool = False,
    ) -> Optional[BirthProfile]:
        """
        Retrieve a specific birth profile by ID, strictly constrained to the owning user_id.
        Returns None if the profile does not exist or belongs to another user.
        """
        stmt = select(BirthProfile).where(
            BirthProfile.id == profile_id,
            BirthProfile.user_id == user_id,
        )
        if for_update:
            stmt = stmt.with_for_update()
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_profiles_by_user(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[BirthProfile]:
        """List all birth profiles owned by user_id, default first, then chronological."""
        stmt = (
            select(BirthProfile)
            .where(BirthProfile.user_id == user_id)
            .order_by(BirthProfile.is_default.desc(), BirthProfile.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_default_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
        for_update: bool = False,
    ) -> Optional[BirthProfile]:
        """Retrieve the primary default birth profile for user_id."""
        stmt = select(BirthProfile).where(
            BirthProfile.user_id == user_id,
            BirthProfile.is_default.is_(True),
        )
        if for_update:
            stmt = stmt.with_for_update()
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def count_profiles_by_user(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        """Return the count of birth profiles owned by user_id."""
        stmt = select(func.count(BirthProfile.id)).where(BirthProfile.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one() or 0

    @staticmethod
    async def clear_default_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> None:
        """Clear any existing default flag for profiles owned by user_id."""
        stmt = (
            update(BirthProfile)
            .where(BirthProfile.user_id == user_id, BirthProfile.is_default.is_(True))
            .values(is_default=False)
        )
        await db.execute(stmt)
        await db.flush()

    @staticmethod
    async def set_default_profile(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[BirthProfile]:
        """
        Atomically set a profile as the sole default profile for user_id.
        Clears existing default and marks the target profile as default within the transaction.
        """
        # 1. Clear existing default
        await BirthProfileRepository.clear_default_profile(db, user_id)

        # 2. Set new default for the specified owned profile
        stmt = (
            update(BirthProfile)
            .where(BirthProfile.id == profile_id, BirthProfile.user_id == user_id)
            .values(is_default=True)
        )
        result = await db.execute(stmt)
        await db.flush()

        if result.rowcount == 0:
            return None

        # 3. Reload and return updated profile
        return await BirthProfileRepository.get_profile_by_id(db, profile_id, user_id)

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        profile: BirthProfile,
        update_data: Dict[str, Any],
    ) -> BirthProfile:
        """Apply updates to an existing owned birth profile."""
        for field, value in update_data.items():
            setattr(profile, field, value)
        await db.flush()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def delete_profile(
        db: AsyncSession,
        profile: BirthProfile,
    ) -> None:
        """Delete an owned birth profile."""
        await db.delete(profile)
        await db.flush()

