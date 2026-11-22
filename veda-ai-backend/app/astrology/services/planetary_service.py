import logging
from datetime import date, datetime, time, timezone
from typing import Any, List, Optional

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore

from app.astrology.constants import (
    NAVAGRAHA_BODIES,
    AyanamshaSystem,
    NodeType,
    PlanetId,
)
from app.astrology.ephemeris.swiss_ephemeris import SwissEphemerisWrapper
from app.astrology.exceptions import (
    InvalidBirthDateTimeError,
    UnknownBirthTimeError,
)
from app.astrology.schemas.planetary import (
    CalculationMetadata,
    PlanetaryPosition,
    PlanetaryPositionsResponse,
)
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
from app.core.config import settings

logger = logging.getLogger("veda_ai.astrology.service")


class PlanetaryService:
    """
    High-level astrological service calculating high-precision sidereal planetary positions
    according to Vedic Jyotish principles.
    """

    @classmethod
    def calculate_planetary_positions(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> PlanetaryPositionsResponse:
        """
        Calculate sidereal planetary positions for the classical Navagraha.

        Args:
            date_of_birth: Birth date (YYYY-MM-DD).
            time_of_birth: Birth time (HH:MM:SS), nullable.
            timezone_str: IANA timezone identifier (e.g. 'Asia/Kolkata').
            birth_time_accuracy: 'exact', 'approximate', or 'unknown'.
            ayanamsha: 'lahiri', 'raman', or 'kp' (defaults to system setting).
            node_type: 'true' (True Node) or 'mean' (Mean Node).

        Returns:
            PlanetaryPositionsResponse containing 9 planet positions and calculation metadata.
        """
        # 1. Enforce birth time rules
        accuracy = (birth_time_accuracy or "exact").lower()
        if accuracy == "unknown" or time_of_birth is None:
            raise UnknownBirthTimeError(
                "Cannot calculate planetary positions: birth time is unknown. "
                "Exact time is required to compute valid planetary degrees."
            )

        warnings: List[str] = []
        if accuracy == "approximate":
            if not settings.ASTROLOGY_ALLOW_APPROXIMATE_TIME:
                raise InvalidBirthDateTimeError(
                    "Calculations for approximate birth times are disabled by configuration."
                )
            warnings.append(
                "Birth time is marked as approximate. Planetary positions (especially Moon, "
                "which moves ~0.55° per hour) carry temporal uncertainty."
            )

        # 2. Resolve settings and defaults
        selected_ayanamsha = (ayanamsha or settings.ASTROLOGY_DEFAULT_AYANAMSHA).lower()
        selected_node_type = (node_type or settings.ASTROLOGY_NODE_TYPE).lower()
        if selected_node_type not in (NodeType.TRUE.value, NodeType.MEAN.value):
            selected_node_type = NodeType.TRUE.value

        # 3. Convert local birth instant to UTC and compute Julian Day
        if not timezone_str:
            from app.astrology.exceptions import InvalidTimezoneError
            raise InvalidTimezoneError("A valid IANA timezone identifier is required.")

        local_dt, utc_dt = local_to_utc_datetime(date_of_birth, time_of_birth, timezone_str)
        julian_day_ut = datetime_to_julian_day(utc_dt)

        # 4. Determine node Swiss Ephemeris body ID
        node_swe_id = (
            swe.TRUE_NODE if (swe and selected_node_type == NodeType.TRUE.value)
            else (swe.MEAN_NODE if swe else 11)
        )

        calc_flags = (swe.FLG_SIDEREAL | swe.FLG_SPEED) if swe else 65860
        positions: List[PlanetaryPosition] = []
        ayanamsha_val: float = 0.0
        rahu_coords: Optional[tuple] = None

        # 5. Calculate positions for each Navagraha body
        for body in NAVAGRAHA_BODIES:
            if body.id == PlanetId.KETU:
                # Ketu is computed as the exact opposite point of Rahu (180° offset)
                if rahu_coords is None:
                    continue

                ketu_lon = normalize_degrees(rahu_coords[0] + 180.0)
                ketu_lat = -rahu_coords[1]  # Opposite celestial latitude
                ketu_dist = rahu_coords[2]
                ketu_spd_lon = rahu_coords[3]  # Same longitudinal speed

                sign_info = get_zodiac_sign(ketu_lon)
                deg_in_sign = get_degree_in_sign(ketu_lon)
                d, m, s = split_dms(deg_in_sign)

                positions.append(
                    PlanetaryPosition(
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
                        latitude=round(ketu_lat, 6),
                        distance_au=round(ketu_dist, 6),
                    )
                )
                continue

            # Determine Swiss Ephemeris body ID
            target_swe_id = node_swe_id if body.id == PlanetId.RAHU else body.swe_id

            coords, ayan_v, ret_flag, warning_msg = SwissEphemerisWrapper.calculate_planet_position(
                julian_day_ut=julian_day_ut,
                swe_body_id=target_swe_id,
                ayanamsha=selected_ayanamsha,
                flags=calc_flags,
            )

            ayanamsha_val = ayan_v
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

            positions.append(
                PlanetaryPosition(
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
                    latitude=round(coords[1], 6),
                    distance_au=round(coords[2], 6),
                )
            )

        # 6. Build audit metadata
        metadata = CalculationMetadata(
            astrology_system="vedic",
            zodiac_type="sidereal",
            ayanamsha=selected_ayanamsha,
            ayanamsha_value=round(ayanamsha_val, 6),
            house_system="whole_sign",
            ephemeris_engine="swiss_ephemeris",
            ephemeris_version=SwissEphemerisWrapper.get_version(),
            calculation_timestamp=datetime.now(timezone.utc),
            birth_datetime_utc=utc_dt,
            birth_datetime_local=local_dt.strftime("%Y-%m-%d %H:%M:%S %Z"),
            input_timezone=timezone_str,
            julian_day_ut=round(julian_day_ut, 6),
            birth_time_accuracy=accuracy,
            node_type=selected_node_type,
            calculation_flags=calc_flags,
            warnings=warnings,
        )

        return PlanetaryPositionsResponse(planets=positions, metadata=metadata)

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> PlanetaryPositionsResponse:
        """
        Convenience method calculating planetary positions directly from a BirthProfile entity.
        Inherits ayanamsha preference stored on the profile unless explicitly overridden.
        """
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_planetary_positions(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

