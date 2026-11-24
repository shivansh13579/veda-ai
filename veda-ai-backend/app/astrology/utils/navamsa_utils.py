from typing import NamedTuple

from app.astrology.constants import (
    NAVAMSA_SPAN_MINUTES,
    SIGN_LORDS,
    SIGN_MODALITIES,
    ZODIAC_SIGNS,
    ZodiacModality,
)
from app.astrology.utils.coordinate_utils import (
    format_dms,
    get_degree_in_sign,
    get_zodiac_sign,
    normalize_degrees,
    split_dms,
)


class NavamsaCalculationResult(NamedTuple):
    # D1 source metrics
    d1_longitude: float
    d1_sign_number: int
    d1_sign_name: str
    d1_sign_sanskrit: str
    d1_degree_in_sign: float
    d1_formatted_dms: str

    # Navamsa division metrics
    navamsa_index: int  # 0 to 8
    navamsa_number: int  # 1 to 9
    sign_modality: str  # "movable", "fixed", "dual"
    navamsa_start_sign: int  # 1 to 12

    # Resulting D9 metrics
    d9_sign_number: int  # 1 to 12
    d9_sign_name: str
    d9_sign_sanskrit: str
    d9_degree_in_sign: float  # 0.0 to 30.0 within D9 sign
    d9_degree: int
    d9_minutes: int
    d9_seconds: float
    d9_formatted_dms: str
    d9_longitude: float  # Normalized D9 ecliptic longitude [0.0, 360.0)
    d9_lord_id: str
    d9_lord_name: str


def get_sign_modality(sign_number: int) -> ZodiacModality:
    """Return the quadruplicity / modality (Movable, Fixed, Dual) of a zodiac sign."""
    if sign_number not in SIGN_MODALITIES:
        raise ValueError(f"Invalid zodiac sign number: {sign_number}. Must be 1 to 12.")
    return SIGN_MODALITIES[sign_number]


def get_navamsa_start_sign(sign_number: int) -> int:
    """
    Determine the starting zodiac sign (1 to 12) for the 9-Navamsa sequence
    according to classical Vedic Parashara rules:
    - Movable signs (Aries 1, Cancer 4, Libra 7, Capricorn 10): sequence starts from the sign itself.
    - Fixed signs (Taurus 2, Leo 5, Scorpio 8, Aquarius 11): sequence starts from the 9th sign from itself.
    - Dual signs (Gemini 3, Virgo 6, Sagittarius 9, Pisces 12): sequence starts from the 5th sign from itself.
    """
    modality = get_sign_modality(sign_number)
    if modality == ZodiacModality.MOVABLE:
        return sign_number
    elif modality == ZodiacModality.FIXED:
        return ((sign_number - 1 + 8) % 12) + 1
    else:  # DUAL
        return ((sign_number - 1 + 4) % 12) + 1


def calculate_navamsa(longitude: float) -> NavamsaCalculationResult:
    """
    Calculate the D9 Navamsa division and resulting zodiac placement for any sidereal longitude.
    Preserves exact unrounded precision during division step.
    """
    norm_lon = normalize_degrees(longitude)

    # 1. Determine D1 sign and degree within sign
    d1_sign_info = get_zodiac_sign(norm_lon)
    d1_sign = d1_sign_info.number
    deg_in_sign = get_degree_in_sign(norm_lon)
    d1_dms = format_dms(deg_in_sign)

    # 2. Exact arcminutes in sign without pre-rounding
    arcmin_in_sign = deg_in_sign * 60.0

    # 3. Determine Navamsa division index (0 to 8)
    navamsa_idx = int(arcmin_in_sign // NAVAMSA_SPAN_MINUTES)
    if navamsa_idx > 8:
        navamsa_idx = 8
    navamsa_num = navamsa_idx + 1

    # 4. Apply standard sign-start rule
    modality = get_sign_modality(d1_sign)
    start_sign = get_navamsa_start_sign(d1_sign)

    # 5. Calculate resulting D9 zodiac sign (1 to 12)
    d9_sign = ((start_sign - 1 + navamsa_idx) % 12) + 1
    d9_sign_info = ZODIAC_SIGNS[d9_sign]
    d9_lord = SIGN_LORDS[d9_sign]

    # 6. Calculate position within the D9 sign [0.0, 30.0)
    # The 3°20' (200 arcmin) slice scales up to 30° of the D9 sign
    arcmin_in_navamsa = arcmin_in_sign - (navamsa_idx * NAVAMSA_SPAN_MINUTES)
    deg_in_d9 = (arcmin_in_navamsa / NAVAMSA_SPAN_MINUTES) * 30.0
    if deg_in_d9 >= 30.0:
        deg_in_d9 = 29.999999

    d9_d, d9_m, d9_s = split_dms(deg_in_d9)
    d9_dms = format_dms(deg_in_d9)
    d9_lon = normalize_degrees((d9_sign - 1) * 30.0 + deg_in_d9)

    return NavamsaCalculationResult(
        d1_longitude=round(norm_lon, 6),
        d1_sign_number=d1_sign,
        d1_sign_name=d1_sign_info.english_name,
        d1_sign_sanskrit=d1_sign_info.sanskrit_name,
        d1_degree_in_sign=round(deg_in_sign, 6),
        d1_formatted_dms=d1_dms,
        navamsa_index=navamsa_idx,
        navamsa_number=navamsa_num,
        sign_modality=modality.value,
        navamsa_start_sign=start_sign,
        d9_sign_number=d9_sign,
        d9_sign_name=d9_sign_info.english_name,
        d9_sign_sanskrit=d9_sign_info.sanskrit_name,
        d9_degree_in_sign=round(deg_in_d9, 6),
        d9_degree=d9_d,
        d9_minutes=d9_m,
        d9_seconds=d9_s,
        d9_formatted_dms=d9_dms,
        d9_longitude=round(d9_lon, 6),
        d9_lord_id=d9_lord.lord_id,
        d9_lord_name=d9_lord.english_name,
    )

