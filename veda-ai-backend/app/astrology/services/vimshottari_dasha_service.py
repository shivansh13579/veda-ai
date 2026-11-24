from datetime import datetime, timezone
from typing import Any, List, Optional
import uuid

from app.astrology.constants import (
    DEFAULT_DASHA_YEAR_DAYS,
    TOTAL_VIMSHOTTARI_YEARS,
)
from app.astrology.exceptions import (
    AstrologyCalculationError,
    InvalidBirthDateTimeError,
    UnknownBirthTimeError,
)
from app.astrology.schemas.ascendant import NakshatraInfo
from app.astrology.schemas.dasha import (
    ActiveDashaPeriod,
    AntardashaPeriodResponse,
    DashaBalanceResponse,
    DashaCalculationSettings,
    MahadashaPeriodResponse,
    PratyantardashaPeriodResponse,
    VimshottariDashaResponse,
)
from app.astrology.services.planetary_service import PlanetaryService
from app.astrology.utils.dasha_utils import (
    build_vimshottari_timeline,
    calculate_dasha_balance,
)
from app.astrology.utils.nakshatra_utils import calculate_nakshatra


class VimshottariDashaService:
    """
    High-level astrological service for calculating Vimshottari Dasha cycles,
    sub-periods (Antardashas and Pratyantardashas), birth balance, and active periods.
    """

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        as_of: Optional[datetime] = None,
        level: str = "pratyantardasha",
        include_timeline: bool = True,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
        year_length: float = DEFAULT_DASHA_YEAR_DAYS,
    ) -> VimshottariDashaResponse:
        """
        Calculate Vimshottari Dasha for a user-owned BirthProfile entity.

        Args:
            profile: BirthProfile model instance
            as_of: Datetime to determine active dasha periods (defaults to current UTC instant)
            level: Hierarchy depth ('mahadasha', 'antardasha', or 'pratyantardasha')
            include_timeline: Whether to include the full 120-year timeline in the response
            ayanamsha: Optional ayanamsha override ('lahiri', 'raman', 'kp')
            node_type: Optional node calculation type ('true' or 'mean')
            year_length: Solar days per Dasha year (default 365.25; 360.0 for Savana)

        Returns:
            VimshottariDashaResponse
        """
        # 1. Enforce birth time validity
        accuracy = (getattr(profile, "birth_time_accuracy", "exact") or "exact").lower()
        if accuracy == "unknown" or profile.time_of_birth is None:
            raise UnknownBirthTimeError(
                "Cannot calculate Vimshottari Dasha: birth time is unknown. "
                "An exact birth time is required to compute reliable Moon longitude and Dasha timeline."
            )

        if year_length <= 0:
            raise InvalidBirthDateTimeError("year_length must be a positive float (e.g. 365.25 or 360.0).")

        level_clean = (level or "pratyantardasha").lower().strip()
        if level_clean not in ("mahadasha", "antardasha", "pratyantardasha"):
            level_clean = "pratyantardasha"

        target_as_of = as_of or datetime.now(timezone.utc)
        if target_as_of.tzinfo is None:
            target_as_of = target_as_of.replace(tzinfo=timezone.utc)

        # 2. Calculate sidereal planetary positions to extract Moon longitude
        planet_resp = PlanetaryService.calculate_for_birth_profile(
            profile=profile,
            ayanamsha=ayanamsha,
            node_type=node_type,
        )

        moon_pos = next((p for p in planet_resp.planets if p.planet_id == "moon"), None)
        if not moon_pos:
            raise AstrologyCalculationError("Failed to calculate Moon sidereal position for Vimshottari Dasha.")

        moon_lon = moon_pos.longitude
        birth_utc = planet_resp.metadata.birth_datetime_utc

        # 3. Calculate Nakshatra details & Birth Mahadasha balance
        nak_calc = calculate_nakshatra(moon_lon)
        birth_nakshatra = NakshatraInfo(
            number=nak_calc.number,
            name=nak_calc.name,
            pada=nak_calc.pada,
            degree_in_nakshatra=nak_calc.degree_in_nakshatra,
            formatted_dms=nak_calc.formatted_dms,
            lord=nak_calc.lord_name,
            lord_id=nak_calc.lord_id,
        )

        balance_calc = calculate_dasha_balance(moon_lon)
        balance_resp = DashaBalanceResponse(
            planet=balance_calc.planet,
            duration_years=balance_calc.duration_years,
            elapsed_years=balance_calc.elapsed_years,
            balance_years=balance_calc.balance_years,
            elapsed_percentage=balance_calc.elapsed_percentage,
            balance_percentage=balance_calc.balance_percentage,
            balance_formatted=balance_calc.balance_formatted,
        )

        # 4. Generate 120-year timeline and active dasha periods
        raw_timeline, cur_md_data, cur_ad_data, cur_pd_data = build_vimshottari_timeline(
            birth_dt_utc=birth_utc,
            moon_longitude=moon_lon,
            as_of_utc=target_as_of,
            level=level_clean,
            days_per_year=year_length,
        )

        cur_md = ActiveDashaPeriod(**cur_md_data)
        cur_ad = ActiveDashaPeriod(**cur_ad_data)
        cur_pd = ActiveDashaPeriod(**cur_pd_data)

        # 5. Format timeline if requested
        timeline_response: List[MahadashaPeriodResponse] = []
        if include_timeline:
            for md_item in raw_timeline:
                antardasha_responses: Optional[List[AntardashaPeriodResponse]] = None
                if md_item.get("antardashas") is not None:
                    antardasha_responses = []
                    for ad_item in md_item["antardashas"]:
                        pratyantardasha_responses: Optional[List[PratyantardashaPeriodResponse]] = None
                        if ad_item.get("pratyantardashas") is not None:
                            pratyantardasha_responses = [
                                PratyantardashaPeriodResponse(**pd_item)
                                for pd_item in ad_item["pratyantardashas"]
                            ]
                        antardasha_responses.append(
                            AntardashaPeriodResponse(
                                planet=ad_item["planet"],
                                start_date=ad_item["start_date"],
                                end_date=ad_item["end_date"],
                                duration_years=ad_item["duration_years"],
                                duration_days=ad_item["duration_days"],
                                is_current=ad_item["is_current"],
                                pratyantardashas=pratyantardasha_responses,
                            )
                        )

                timeline_response.append(
                    MahadashaPeriodResponse(
                        planet=md_item["planet"],
                        start_date=md_item["start_date"],
                        end_date=md_item["end_date"],
                        duration_years=md_item["duration_years"],
                        duration_days=md_item["duration_days"],
                        is_current=md_item["is_current"],
                        antardashas=antardasha_responses,
                    )
                )

        settings_resp = DashaCalculationSettings(
            astrology_system="vedic",
            zodiac_type="sidereal",
            ayanamsha=planet_resp.metadata.ayanamsha,
            ayanamsha_value=planet_resp.metadata.ayanamsha_value,
            dasha_cycle_years=TOTAL_VIMSHOTTARI_YEARS,
            year_length_days=round(year_length, 4),
            as_of=target_as_of,
            level=level_clean,
            node_type=planet_resp.metadata.node_type,
        )

        return VimshottariDashaResponse(
            birth_profile_id=profile.id,
            calculation_settings=settings_resp,
            moon_sidereal_longitude=round(moon_lon, 6),
            birth_nakshatra=birth_nakshatra,
            nakshatra_pada=nak_calc.pada,
            birth_mahadasha=balance_calc.planet,
            birth_mahadasha_balance=balance_resp,
            current_mahadasha=cur_md,
            current_antardasha=cur_ad,
            current_pratyantardasha=cur_pd,
            timeline=timeline_response,
        )
