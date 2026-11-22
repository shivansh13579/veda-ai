import logging
from datetime import date, datetime, time, timezone
from typing import Any, List, Optional

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore

from app.astrology.ephemeris.swiss_ephemeris import SwissEphemerisWrapper
from app.astrology.exceptions import (
    InvalidBirthDateTimeError,
    InvalidCoordinatesError,
    InvalidTimezoneError,
    UnknownBirthTimeError,
)
from app.astrology.schemas.ascendant import (
    AscendantDetail,
    AscendantResponse,
    NakshatraInfo,
)
from app.astrology.schemas.planetary import CalculationMetadata
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
from app.astrology.utils.nakshatra_utils import calculate_nakshatra
from app.core.config import settings

logger = logging.getLogger("veda_ai.astrology.ascendant")


class AscendantService:
    """
    Calculates the high-precision sidereal Ascendant (Lagna) according to Vedic Jyotish.
    Uses Swiss Ephemeris sidereal house calculations (swe.houses_ex with FLG_SIDEREAL).
    """

    @classmethod
    def validate_inputs(
        cls,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
    ) -> List[str]:
        """Validate input parameters and return any operational warnings."""
        accuracy = (birth_time_accuracy or "exact").lower()
        if accuracy == "unknown" or time_of_birth is None:
            raise UnknownBirthTimeError(
                "Cannot calculate Ascendant (Lagna): birth time is unknown. "
                "An exact birth time is strictly required because Lagna changes zodiac signs every two hours."
            )

        if not timezone_str:
            raise InvalidTimezoneError("A valid IANA timezone identifier is required.")

        if latitude is None or longitude is None:
            raise InvalidCoordinatesError(
                "Both latitude and longitude geographic coordinates are required to calculate the Ascendant."
            )

        if not (-90.0 <= latitude <= 90.0):
            raise InvalidCoordinatesError(
                f"Latitude {latitude}° is invalid. Must be between -90.0 and 90.0 degrees."
            )

        if not (-180.0 <= longitude <= 180.0):
            raise InvalidCoordinatesError(
                f"Longitude {longitude}° is invalid. Must be between -180.0 and 180.0 degrees."
            )

        warnings: List[str] = []
        if accuracy == "approximate":
            if not settings.ASTROLOGY_ALLOW_APPROXIMATE_TIME:
                raise InvalidBirthDateTimeError(
                    "Calculations for approximate birth times are disabled by configuration."
                )
            warnings.append(
                "Birth time is marked as approximate. The Ascendant (Lagna) changes sign approximately "
                "every two hours (~1° every 4 minutes). This calculation carries high house placement "
                "and Nakshatra boundary uncertainty."
            )

        return warnings

    @classmethod
    def calculate_ascendant(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
    ) -> AscendantResponse:
        """
        Calculate sidereal Ascendant (Lagna) with full Nakshatra, Pada, and Lord details.
        """
        warnings = cls.validate_inputs(
            time_of_birth=time_of_birth,
            timezone_str=timezone_str,
            latitude=latitude,
            longitude=longitude,
            birth_time_accuracy=birth_time_accuracy,
        )

        selected_ayanamsha = (ayanamsha or settings.ASTROLOGY_DEFAULT_AYANAMSHA).lower()
        local_dt, utc_dt = local_to_utc_datetime(date_of_birth, time_of_birth, timezone_str)  # type: ignore[arg-type]
        julian_day_ut = datetime_to_julian_day(utc_dt)

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
        sign_info = get_zodiac_sign(norm_asc)
        deg_in_sign = get_degree_in_sign(norm_asc)
        d, m, s = split_dms(deg_in_sign)

        nak_res = calculate_nakshatra(norm_asc)
        nak_info = NakshatraInfo(
            number=nak_res.number,
            name=nak_res.name,
            pada=nak_res.pada,
            lord=nak_res.lord_name,
            lord_id=nak_res.lord_id,
            degree_in_nakshatra=round(nak_res.degree_in_nakshatra, 6),
            formatted_dms=nak_res.formatted_dms,
        )

        asc_detail = AscendantDetail(
            longitude=round(norm_asc, 6),
            sign_number=sign_info.number,
            sign_name=sign_info.english_name,
            sign_sanskrit=sign_info.sanskrit_name,
            degree_in_sign=round(deg_in_sign, 6),
            degree=d,
            minutes=m,
            seconds=s,
            formatted_dms=format_dms(deg_in_sign),
            nakshatra=nak_info,
        )

        calc_flags = swe.FLG_SIDEREAL if swe else 65536
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
            node_type=settings.ASTROLOGY_NODE_TYPE,
            calculation_flags=calc_flags,
            warnings=warnings,
        )

        return AscendantResponse(ascendant=asc_detail, metadata=metadata)

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
    ) -> AscendantResponse:
        """Calculate Ascendant directly from a BirthProfile database entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_ascendant(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
        )

