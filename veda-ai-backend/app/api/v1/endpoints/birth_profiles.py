import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.birth_profile import (
    BirthProfileCreate,
    BirthProfileDefaultUpdate,
    BirthProfileListResponse,
    BirthProfileMessageResponse,
    BirthProfileResponse,
    BirthProfileUpdate,
)
from app.services.birth_profile_service import BirthProfileService

router = APIRouter()


@router.post(
    "",
    response_model=BirthProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Birth Profile",
    description="Creates a new birth profile for the authenticated user. Automatically designates the profile as default if it is the user's first profile.",
)
async def create_profile(
    payload: BirthProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.create_profile(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    return profile


@router.get(
    "",
    response_model=BirthProfileListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Owned Birth Profiles",
    description="Retrieves all birth profiles belonging to the authenticated user, prioritized with default profile first.",
)
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profiles, total = await BirthProfileService.list_profiles(
        db=db,
        user_id=current_user.id,
    )
    return BirthProfileListResponse(profiles=profiles, total=total)


@router.get(
    "/default",
    response_model=BirthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Primary Default Birth Profile",
    description="Retrieves the authenticated user's currently designated default birth profile. Returns 404 if no default profile exists.",
)
async def get_default_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_default_profile(
        db=db,
        user_id=current_user.id,
    )
    return profile


@router.get(
    "/{profile_id}",
    response_model=BirthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Birth Profile By ID",
    description="Retrieves a specific birth profile by ID. Strictly scoped to the authenticated user; returns 404 if not found or unauthorized.",
)
async def get_profile(
    profile_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return profile


@router.patch(
    "/{profile_id}",
    response_model=BirthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Birth Profile",
    description="Updates specific fields of an owned birth profile while enforcing business and astronomical rules.",
)
async def update_profile(
    profile_id: uuid.UUID,
    payload: BirthProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.update_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
        payload=payload,
    )
    return profile


@router.delete(
    "/{profile_id}",
    response_model=BirthProfileMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Birth Profile",
    description="Deletes an owned birth profile. If the deleted profile was default, automatically designates another remaining profile as default.",
)
async def delete_profile(
    profile_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await BirthProfileService.delete_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return BirthProfileMessageResponse(
        status="success",
        message="Birth profile deleted successfully.",
    )


@router.patch(
    "/{profile_id}/default",
    response_model=BirthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Set Default Birth Profile",
    description="Atomically designates the specified owned profile as the user's primary default birth profile.",
)
async def set_default_profile(
    profile_id: uuid.UUID,
    payload: Optional[BirthProfileDefaultUpdate] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.set_default_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return profile

