from typing import Any, Dict, List

from app.astrology.constants import SIGN_LORDS, ZODIAC_SIGNS, SignLordInfo
from app.astrology.utils.coordinate_utils import normalize_degrees


def get_sign_lord(sign_number: int) -> SignLordInfo:
    """Return classical Vedic lord info for a given zodiac sign (1 to 12)."""
    if sign_number not in SIGN_LORDS:
        raise ValueError(f"Invalid zodiac sign number: {sign_number}. Must be 1 to 12.")
    return SIGN_LORDS[sign_number]


def get_whole_sign_houses(asc_longitude: float) -> List[Dict[str, Any]]:
    """
    Generate all 12 Bhavas under the classical Vedic Whole Sign house system.
    The zodiac sign containing the Ascendant (Lagna) forms the entire 1st house (Bhava 1),
    the subsequent sign forms the 2nd house, and so on up to the 12th house.
    """
    norm_asc = normalize_degrees(asc_longitude)
    asc_sign = int(norm_asc // 30.0) + 1

    houses: List[Dict[str, Any]] = []
    for h in range(1, 13):
        sign_num = ((asc_sign - 1 + (h - 1)) % 12) + 1
        sign_info = ZODIAC_SIGNS[sign_num]
        lord_info = SIGN_LORDS[sign_num]

        houses.append(
            {
                "house_number": h,
                "sign_number": sign_num,
                "sign_name": sign_info.english_name,
                "sign_sanskrit": sign_info.sanskrit_name,
                "house_lord": lord_info.english_name,
                "house_lord_id": lord_info.lord_id,
                "is_ascendant_house": (h == 1),
                "start_degree": sign_info.start_degree,
                "end_degree": sign_info.end_degree,
            }
        )

    return houses


def get_planet_house(planet_longitude: float, asc_longitude: float) -> int:
    """
    Determine which house (1 to 12) a planet occupies under the Whole Sign house system
    relative to the sidereal Ascendant.
    """
    norm_p = normalize_degrees(planet_longitude)
    norm_asc = normalize_degrees(asc_longitude)

    p_sign = int(norm_p // 30.0) + 1
    asc_sign = int(norm_asc // 30.0) + 1

    return ((p_sign - asc_sign) % 12) + 1

