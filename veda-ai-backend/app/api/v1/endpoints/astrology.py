import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.astrology.constants import (
    NAVAGRAHA_BODIES,
    AyanamshaSystem,
)
from app.astrology.ephemeris.swiss_ephemeris import SwissEphemerisWrapper
from app.astrology.schemas.ascendant import AscendantResponse
from app.astrology.schemas.bhava import (
    HouseChartResponse,
    LagnaChartResponse,
    PlanetaryPlacementsResponse,
)
from app.astrology.schemas.planetary import AstrologyEngineStatusResponse
from app.astrology.services.ascendant_service import AscendantService
from app.astrology.services.bhava_service import BhavaService
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.services.lagna_chart_service import LagnaChartService
from app.core.config import settings
from app.db.models.user import User
from app.db.session import get_db
from app.services.birth_profile_service import BirthProfileService

router = APIRouter()


@router.get(
    "/engine/status",
    response_model=AstrologyEngineStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Astrology Calculation Engine Diagnostics",
    description="Returns diagnostic status and capabilities of the Swiss Ephemeris astronomical calculation engine without exposing filesystem paths.",
)
async def get_engine_status(
    current_user: User = Depends(get_current_user),
):
    is_avail = SwissEphemerisWrapper.is_available()
    has_files = SwissEphemerisWrapper.check_ephemeris_files_available()
    ephe_mode = "high_precision_se1" if has_files else "moshier_analytical"

    return AstrologyEngineStatusResponse(
        engine_name="Swiss Ephemeris",
        engine_available=is_avail,
        engine_version=SwissEphemerisWrapper.get_version(),
        astrology_system=settings.ASTROLOGY_SYSTEM,
        zodiac_type=settings.ASTROLOGY_ZODIAC_TYPE,
        default_ayanamsha=settings.ASTROLOGY_DEFAULT_AYANAMSHA,
        default_house_system=settings.ASTROLOGY_DEFAULT_HOUSE_SYSTEM,
        node_type=settings.ASTROLOGY_NODE_TYPE,
        ephemeris_path_configured=bool(settings.SWISS_EPHEMERIS_PATH),
        ephemeris_files_available=has_files,
        ephemeris_mode=ephe_mode,
        supported_celestial_bodies=[b.id.value for b in NAVAGRAHA_BODIES],
        supported_ayanamshas=[a.value for a in AyanamshaSystem],
    )


@router.get(
    "/birth-profiles/{profile_id}/lagna",
    response_model=AscendantResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Sidereal Ascendant (Lagna)",
    description="Calculates the sidereal Ascendant (Lagna) sign, exact degrees, minutes, seconds, Nakshatra, Pada, and Nakshatra Lord for an owned birth profile.",
)
async def get_birth_profile_lagna(
    profile_id: uuid.UUID,
    ayanamsha: Optional[str] = Query(None, description="Optional ayanamsha override ('lahiri', 'raman', 'kp')"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return AscendantService.calculate_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
    )


@router.get(
    "/birth-profiles/{profile_id}/houses",
    response_model=HouseChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate 12 Whole Sign Bhavas",
    description="Calculates all twelve Whole Sign Bhavas (houses), their governing signs, house lords, and the planets occupying each house.",
)
async def get_birth_profile_houses(
    profile_id: uuid.UUID,
    ayanamsha: Optional[str] = Query(None, description="Optional ayanamsha override ('lahiri', 'raman', 'kp')"),
    node_type: Optional[str] = Query(None, description="Optional lunar node convention ('true' or 'mean')"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return BhavaService.calculate_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


@router.get(
    "/birth-profiles/{profile_id}/planetary-placements",
    response_model=PlanetaryPlacementsResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Planetary House Placements",
    description="Calculates sidereal positions, Whole Sign house numbers (1 to 12), and Nakshatras for all nine classical Navagraha celestial bodies.",
)
async def get_birth_profile_planetary_placements(
    profile_id: uuid.UUID,
    ayanamsha: Optional[str] = Query(None, description="Optional ayanamsha override ('lahiri', 'raman', 'kp')"),
    node_type: Optional[str] = Query(None, description="Optional lunar node convention ('true' or 'mean')"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return HousePlacementService.calculate_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


@router.get(
    "/birth-profiles/{profile_id}/lagna-chart",
    response_model=LagnaChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Complete D1 Lagna Chart",
    description="Calculates the unified D1 Lagna Chart uniting the sidereal Ascendant, 12 Bhavas, and all Navagraha planetary house placements.",
)
async def get_birth_profile_lagna_chart(
    profile_id: uuid.UUID,
    ayanamsha: Optional[str] = Query(None, description="Optional ayanamsha override ('lahiri', 'raman', 'kp')"),
    node_type: Optional[str] = Query(None, description="Optional lunar node convention ('true' or 'mean')"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return LagnaChartService.calculate_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )
