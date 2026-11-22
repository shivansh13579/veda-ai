import logging
from datetime import date, datetime, time, timezone
from typing import Any, List, Optional, Tuple

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore

from app.astrology.constants import (
    NAVAGRAHA_BODIES,
    NodeType,
    PlanetId,
)
from app.astrology.ephemeris.swiss_ephemeris import SwissEphemerisWrapper
from app.astrology.schemas.ascendant import NakshatraInfo
from app.astrology.schemas.bhava import (
    PlanetHousePlacement,
    PlanetaryPlacementsResponse,
)
from app.astrology.schemas.planetary import CalculationMetadata
from app.astrology.services.ascendant_service import AscendantService
from app.astrology.utils.coordinate_utils import (
    format_dms,
    get_degree_in_sign,
    get_zodiac_sign,
    normalize_degrees,
    split_dms,
)
from app.astrology.utils.datetime_utils import (
    datetime_to_julian_day,
    local_to_utc_datetime,
)
from app.astrology.utils.house_utils import get_planet_house
from app.astrology.utils.nakshatra_utils import calculate_nakshatra
from app.core.config import settings

logger = logging.getLogger("veda_ai.astrology.house_placement")


class HousePlacementService:
    """
    Calculates planetary positions for the 9 classical Navagraha along with their
    Whole Sign house placements (Bhavas 1 to 12) and Nakshatras relative to the Ascendant.
    """

    @classmethod
    def calculate_placements_raw(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> Tuple[float, List[PlanetHousePlacement], CalculationMetadata]:
        """
        Internal calculation engine that returns:
        (ascendant_longitude, placements, metadata)
        Shared across HousePlacementService, BhavaService, and LagnaChartService.
        """
        warnings = AscendantService.validate_inputs(
            time_of_birth=time_of_birth,
            timezone_str=timezone_str,
            latitude=latitude,
            longitude=longitude,
            birth_time_accuracy=birth_time_accuracy,
        )

        selected_ayanamsha = (ayanamsha or settings.ASTROLOGY_DEFAULT_AYANAMSHA).lower()
        selected_node_type = (node_type or settings.ASTROLOGY_NODE_TYPE).lower()
        if selected_node_type not in (NodeType.TRUE.value, NodeType.MEAN.value):
            selected_node_type = NodeType.TRUE.value

        local_dt, utc_dt = local_to_utc_datetime(date_of_birth, time_of_birth, timezone_str)  # type: ignore[arg-type]
        julian_day_ut = datetime_to_julian_day(utc_dt)

        # 1. Compute Ascendant and house cusps
        asc_lon, cusps, ayan_val, swe_warn = SwissEphemerisWrapper.calculate_houses_and_ascendant(
            julian_day_ut=julian_day_ut,
            latitude=latitude,  # type: ignore[arg-type]
            longitude=longitude,  # type: ignore[arg-type]
            ayanamsha=selected_ayanamsha,
            hsys=b"W",
        )
        if swe_warn and swe_warn not in warnings:
            warnings.append(swe_warn)

        norm_asc = normalize_degrees(asc_lon)

        # 2. Setup node and flags for planets
        node_swe_id = (
            swe.TRUE_NODE if (swe and selected_node_type == NodeType.TRUE.value)
            else (swe.MEAN_NODE if swe else 11)
        )
        calc_flags = (swe.FLG_SIDEREAL | swe.FLG_SPEED) if swe else 65860

        placements: List[PlanetHousePlacement] = []
        rahu_coords: Optional[tuple] = None

        for body in NAVAGRAHA_BODIES:
            if body.id == PlanetId.KETU:
                if rahu_coords is None:
                    continue

                ketu_lon = normalize_degrees(rahu_coords[0] + 180.0)
                ketu_spd_lon = rahu_coords[3]
                sign_info = get_zodiac_sign(ketu_lon)
                deg_in_sign = get_degree_in_sign(ketu_lon)
                d, m, s = split_dms(deg_in_sign)
                house_num = get_planet_house(ketu_lon, norm_asc)

                nak_res = calculate_nakshatra(ketu_lon)
                nak_info = NakshatraInfo(
                    number=nak_res.number,
                    name=nak_res.name,
                    pada=nak_res.pada,
                    lord=nak_res.lord_name,
                    lord_id=nak_res.lord_id,
                    degree_in_nakshatra=round(nak_res.degree_in_nakshatra, 6),
                    formatted_dms=nak_res.formatted_dms,
                )

                placements.append(
                    PlanetHousePlacement(
                        planet_id=body.id.value,
                        planet_name=body.english_name,
                        sanskrit_name=body.sanskrit_name,
                        longitude=round(ketu_lon, 6),
                        sign_number=sign_info.number,
                        sign_name=sign_info.english_name,
                        sign_sanskrit=sign_info.sanskrit_name,
                        degree_in_sign=round(deg_in_sign, 6),
                        degree=d,
                        minutes=m,
                        seconds=s,
                        formatted_dms=format_dms(deg_in_sign),
                        speed_longitude=round(ketu_spd_lon, 6),
                        is_retrograde=(ketu_spd_lon < 0.0),
                        house_number=house_num,
                        nakshatra=nak_info,
                    )
                )
                continue

            target_swe_id = node_swe_id if body.id == PlanetId.RAHU else body.swe_id
            coords, ayan_v, ret_flag, warning_msg = SwissEphemerisWrapper.calculate_planet_position(
                julian_day_ut=julian_day_ut,
                swe_body_id=target_swe_id,
                ayanamsha=selected_ayanamsha,
                flags=calc_flags,
            )

            if warning_msg and warning_msg not in warnings:
                warnings.append(warning_msg)

            if body.id == PlanetId.RAHU:
                rahu_coords = coords

            norm_lon = normalize_degrees(coords[0])
            sign_info = get_zodiac_sign(norm_lon)
            deg_in_sign = get_degree_in_sign(norm_lon)
            d, m, s = split_dms(deg_in_sign)
            spd_lon = coords[3]
            is_retro = spd_lon < 0.0
            house_num = get_planet_house(norm_lon, norm_asc)

            nak_res = calculate_nakshatra(norm_lon)
            nak_info = NakshatraInfo(
                number=nak_res.number,
                name=nak_res.name,
                pada=nak_res.pada,
                lord=nak_res.lord_name,
                lord_id=nak_res.lord_id,
                degree_in_nakshatra=round(nak_res.degree_in_nakshatra, 6),
                formatted_dms=nak_res.formatted_dms,
            )

            placements.append(
                PlanetHousePlacement(
                    planet_id=body.id.value,
                    planet_name=body.english_name,
                    sanskrit_name=body.sanskrit_name,
                    longitude=round(norm_lon, 6),
                    sign_number=sign_info.number,
                    sign_name=sign_info.english_name,
                    sign_sanskrit=sign_info.sanskrit_name,
                    degree_in_sign=round(deg_in_sign, 6),
                    degree=d,
                    minutes=m,
                    seconds=s,
                    formatted_dms=format_dms(deg_in_sign),
                    speed_longitude=round(spd_lon, 6),
                    is_retrograde=is_retro,
                    house_number=house_num,
                    nakshatra=nak_info,
                )
            )

        metadata = CalculationMetadata(
            astrology_system="vedic",
            zodiac_type="sidereal",
            ayanamsha=selected_ayanamsha,
            ayanamsha_value=round(ayan_val, 6),
            house_system="whole_sign",
            ephemeris_engine="swiss_ephemeris",
            ephemeris_version=SwissEphemerisWrapper.get_version(),
            calculation_timestamp=datetime.now(timezone.utc),
            birth_datetime_utc=utc_dt,
            birth_datetime_local=local_dt.strftime("%Y-%m-%d %H:%M:%S %Z"),
            input_timezone=timezone_str,  # type: ignore[arg-type]
            julian_day_ut=round(julian_day_ut, 6),
            birth_time_accuracy=(birth_time_accuracy or "exact").lower(),
            node_type=selected_node_type,
            calculation_flags=calc_flags,
            warnings=warnings,
        )

        return norm_asc, placements, metadata

    @classmethod
    def calculate_planetary_placements(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> PlanetaryPlacementsResponse:
        """Calculate house placements for all 9 Navagrahas."""
        _, placements, metadata = cls.calculate_placements_raw(
            date_of_birth=date_of_birth,
            time_of_birth=time_of_birth,
            timezone_str=timezone_str,
            latitude=latitude,
            longitude=longitude,
            birth_time_accuracy=birth_time_accuracy,
            ayanamsha=ayanamsha,
            node_type=node_type,
        )
        return PlanetaryPlacementsResponse(placements=placements, metadata=metadata)

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> PlanetaryPlacementsResponse:
        """Calculate planetary house placements directly from a BirthProfile entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_planetary_placements(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

