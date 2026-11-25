import uuid
from datetime import datetime
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
from app.astrology.schemas.dasha import VimshottariDashaResponse
from app.astrology.schemas.dignity import PlanetaryDignitiesResponse
from app.astrology.schemas.divisional import (
    D1ChartResponse,
    D9ChartResponse,
    DivisionalChartsResponse,
)
from app.astrology.schemas.planetary import AstrologyEngineStatusResponse
from app.astrology.services.ascendant_service import AscendantService
from app.astrology.services.bhava_service import BhavaService
from app.astrology.services.divisional_service import DivisionalService
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.services.lagna_chart_service import LagnaChartService
from app.astrology.services.navamsa_service import NavamsaService
from app.astrology.services.planetary_dignity_service import PlanetaryDignityService
from app.astrology.services.vimshottari_dasha_service import VimshottariDashaService

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


@router.get(
    "/birth-profiles/{profile_id}/d1",
    response_model=D1ChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate D1 Rashi (Natal) Chart",
    description="Calculates the structured D1 Rashi Chart containing Ascendant, twelve Whole Sign houses, house lords, and planetary placements.",
)
async def get_birth_profile_d1_chart(
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
    return DivisionalService.calculate_d1_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


@router.get(
    "/birth-profiles/{profile_id}/d9",
    response_model=D9ChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate D9 Navamsa Chart",
    description="Calculates the standard Vedic D9 Navamsa Chart with Navamsa Lagna, 12 D9 Whole Sign houses, and D9 planetary house placements.",
)
async def get_birth_profile_d9_chart(
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
    return DivisionalService.calculate_d9_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


@router.get(
    "/birth-profiles/{profile_id}/divisional-charts",
    response_model=DivisionalChartsResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Combined D1 and D9 Divisional Charts",
    description="Calculates both the D1 Rashi and D9 Navamsa charts simultaneously from a single ephemeris evaluation without duplicate computation.",
)
async def get_birth_profile_divisional_charts(
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
    return DivisionalService.calculate_divisional_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


@router.get(
    "/birth-profiles/{profile_id}/vimshottari-dasha",
    response_model=VimshottariDashaResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Vimshottari Dasha Periods & Timeline",
    description="Calculates birth Mahadasha balance, full 120-year cyclic Dasha timeline, nested Antardashas and Pratyantardashas, and current active period.",
)
async def get_birth_profile_vimshottari_dasha(
    profile_id: uuid.UUID,
    as_of: Optional[datetime] = Query(None, description="Target datetime for determining active dasha (defaults to current UTC instant)"),
    level: str = Query("pratyantardasha", description="Dasha timeline hierarchy depth: 'mahadasha', 'antardasha', or 'pratyantardasha'"),
    include_timeline: bool = Query(True, description="Whether to include the full 120-year timeline in the response"),
    ayanamsha: Optional[str] = Query(None, description="Optional ayanamsha override ('lahiri', 'raman', 'kp')"),
    node_type: Optional[str] = Query(None, description="Optional lunar node convention ('true' or 'mean')"),
    year_length: float = Query(365.25, description="Number of solar days per Dasha year (365.25 for standard solar, 360.0 for Savana)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await BirthProfileService.get_profile(
        db=db,
        profile_id=profile_id,
        user_id=current_user.id,
    )
    return VimshottariDashaService.calculate_for_birth_profile(
        profile=profile,
        as_of=as_of,
        level=level,
        include_timeline=include_timeline,
        ayanamsha=ayanamsha,
        node_type=node_type,
        year_length=year_length,
    )


@router.get(
    "/birth-profiles/{profile_id}/planetary-dignities",
    response_model=PlanetaryDignitiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Planetary Dignities and Combustion",
    description="Evaluates classical Vedic planetary dignities (Uccha, Neecha, Moolatrikona, Swakshetra, Sambandhas) and combustion (Asta) for all 9 Navagrahas.",
)
async def get_birth_profile_planetary_dignities(
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
    return PlanetaryDignityService.calculate_for_birth_profile(
        profile=profile,
        ayanamsha=ayanamsha,
        node_type=node_type,
    )


