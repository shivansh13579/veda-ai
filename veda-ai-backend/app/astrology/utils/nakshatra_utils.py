from typing import NamedTuple

from app.astrology.constants import (
    NAKSHATRAS,
    NAKSHATRA_SPAN_MINUTES,
    PADA_SPAN_MINUTES,
    VIMSHOTTARI_LORDS,
)
from app.astrology.utils.coordinate_utils import format_dms, normalize_degrees


class NakshatraCalculationResult(NamedTuple):
    number: int  # 1 to 27
    name: str  # e.g. "Swati"
    pada: int  # 1 to 4
    degree_in_nakshatra: float  # 0.0 to 13.333333333333334
    formatted_dms: str
    lord_name: str  # e.g. "Rahu"
    lord_id: str  # e.g. "rahu"


def calculate_nakshatra(longitude: float) -> NakshatraCalculationResult:
    """
    Calculate the Vedic Nakshatra (Lunar Mansion) and Pada for a given sidereal longitude.
    27 Nakshatras each span 13° 20' (800 arcminutes).
    Each Nakshatra contains 4 Padas of 3° 20' (200 arcminutes).
    """
    norm_lon = normalize_degrees(longitude)
    total_arcmin = norm_lon * 60.0

    nak_idx = int(total_arcmin // NAKSHATRA_SPAN_MINUTES)
    if nak_idx >= 27:
        nak_idx = 26

    arcmin_in_nak = total_arcmin - (nak_idx * NAKSHATRA_SPAN_MINUTES)
    deg_in_nak = arcmin_in_nak / 60.0

    pada = int(arcmin_in_nak // PADA_SPAN_MINUTES) + 1
    if pada > 4:
        pada = 4

    nak_number = nak_idx + 1
    nak_name = NAKSHATRAS[nak_idx]
    lord_name = VIMSHOTTARI_LORDS[nak_idx % 9]
    lord_id = lord_name.lower()

    return NakshatraCalculationResult(
        number=nak_number,
        name=nak_name,
        pada=pada,
        degree_in_nakshatra=deg_in_nak,
        formatted_dms=format_dms(deg_in_nak),
        lord_name=lord_name,
        lord_id=lord_id,
    )

