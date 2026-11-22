import logging
import uuid
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.db.models.birth_profile import BirthProfile, BirthTimeAccuracy
from app.repositories.birth_profile_repository import BirthProfileRepository
from app.schemas.birth_profile import BirthProfileCreate, BirthProfileUpdate

logger = logging.getLogger("veda_ai.birth_profile")


class BirthProfileService:
    """
    Business service orchestrating birth profile management, ownership validation,
    cross-field astronomical rule checking, and atomic default profile transitions.
    """

    @staticmethod
    async def create_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: BirthProfileCreate,
    ) -> BirthProfile:
        """
        Create a new birth profile strictly bound to user_id.
        Automatically promotes the first profile created by a user to default.
        """
        profile_data = payload.model_dump()

        # Check existing profile count for this user
        existing_count = await BirthProfileRepository.count_profiles_by_user(db, user_id)

        # Rule: First profile is automatically default
        if existing_count == 0:
            profile_data["is_default"] = True
        elif profile_data.get("is_default") is True:
            # If user explicitly marked this new profile as default, clear previous default
            await BirthProfileRepository.clear_default_profile(db, user_id)

        profile = await BirthProfileRepository.create_profile(
            db=db,
            user_id=user_id,
            **profile_data,
        )
        logger.info(
            "Created birth profile %s ('%s') for user %s (is_default=%s)",
            profile.id,
            profile.profile_name,
            user_id,
            profile.is_default,
        )
        return profile

    @staticmethod
    async def get_profile(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> BirthProfile:
        """
        Retrieve a single profile by ID, strictly enforcing user ownership.
        Raises 404 NotFoundError if the profile does not exist or belongs to another user.
        """
        profile = await BirthProfileRepository.get_profile_by_id(db, profile_id, user_id)
        if not profile:
            raise NotFoundError("Birth profile not found.")
        return profile

    @staticmethod
    async def list_profiles(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> Tuple[List[BirthProfile], int]:
        """List all profiles owned by user_id and return (profiles, total_count)."""
        profiles = await BirthProfileRepository.get_profiles_by_user(db, user_id)
        return profiles, len(profiles)

    @staticmethod
    async def get_default_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> BirthProfile:
        """
        Retrieve the primary default birth profile for user_id.
        Raises 404 NotFoundError if no default profile exists.
        """
        profile = await BirthProfileRepository.get_default_profile(db, user_id)
        if not profile:
            raise NotFoundError("No default birth profile found.")
        return profile

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: BirthProfileUpdate,
    ) -> BirthProfile:
        """
        Update an owned profile after validating cross-field rules and ownership.
        Handles atomic default status changes.
        """
        profile = await BirthProfileRepository.get_profile_by_id(
            db, profile_id, user_id, for_update=True
        )
        if not profile:
            raise NotFoundError("Birth profile not found.")

        update_data = payload.model_dump(exclude_unset=True)
        if not update_data:
            return profile

        # Cross-field birth time accuracy evaluation against merged profile state
        effective_accuracy = (
            update_data["birth_time_accuracy"].value
            if hasattr(update_data.get("birth_time_accuracy"), "value")
            else update_data.get("birth_time_accuracy", profile.birth_time_accuracy)
        )

        if "time_of_birth" in update_data:
            effective_time = update_data["time_of_birth"]
        else:
            effective_time = profile.time_of_birth

        if effective_accuracy == BirthTimeAccuracy.EXACT.value:
            if effective_time is None:
                raise BadRequestError(
                    "time_of_birth is required when birth_time_accuracy is 'exact'."
                )
        elif effective_accuracy == BirthTimeAccuracy.UNKNOWN.value:
            if effective_time is not None:
                if "time_of_birth" in update_data:
                    raise BadRequestError(
                        "time_of_birth must be null when birth_time_accuracy is 'unknown'."
                    )
                else:
                    # Automatically nullify birth time if accuracy was changed to unknown
                    update_data["time_of_birth"] = None

        # Convert enum values to string if present
        if "birth_time_accuracy" in update_data and hasattr(
            update_data["birth_time_accuracy"], "value"
        ):
            update_data["birth_time_accuracy"] = update_data["birth_time_accuracy"].value

        if "ayanamsha" in update_data and hasattr(update_data["ayanamsha"], "value"):
            update_data["ayanamsha"] = update_data["ayanamsha"].value

        # Handle default profile transition
        if update_data.get("is_default") is True:
            await BirthProfileRepository.clear_default_profile(db, user_id)

        updated_profile = await BirthProfileRepository.update_profile(
            db, profile, update_data
        )
        logger.info(
            "Updated birth profile %s ('%s') for user %s",
            updated_profile.id,
            updated_profile.profile_name,
            user_id,
        )
        return updated_profile

    @staticmethod
    async def delete_profile(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> None:
        """
        Delete an owned birth profile.
        If the deleted profile was default, automatically designates another profile
        as default when available.
        """
        profile = await BirthProfileRepository.get_profile_by_id(
            db, profile_id, user_id, for_update=True
        )
        if not profile:
            raise NotFoundError("Birth profile not found.")

        was_default = profile.is_default
        await BirthProfileRepository.delete_profile(db, profile)
        logger.info("Deleted birth profile %s for user %s", profile_id, user_id)

        # If deleted profile was default, elect another existing profile as default
        if was_default:
            remaining = await BirthProfileRepository.get_profiles_by_user(db, user_id)
            if remaining:
                new_default = remaining[0]
                await BirthProfileRepository.set_default_profile(db, new_default.id, user_id)
                logger.info(
                    "Elected profile %s as new default profile for user %s after deletion",
                    new_default.id,
                    user_id,
                )

    @staticmethod
    async def set_default_profile(
        db: AsyncSession,
        profile_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> BirthProfile:
        """Atomically set a profile as the primary default birth profile for user_id."""
        profile = await BirthProfileRepository.get_profile_by_id(
            db, profile_id, user_id, for_update=True
        )
        if not profile:
            raise NotFoundError("Birth profile not found.")

        updated_profile = await BirthProfileRepository.set_default_profile(
            db, profile_id, user_id
        )
        if not updated_profile:
            raise NotFoundError("Birth profile not found.")

        logger.info(
            "Set profile %s as default birth profile for user %s", profile_id, user_id
        )
        return updated_profile

