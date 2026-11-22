import math
from typing import Tuple

from app.astrology.constants import ZODIAC_SIGNS, ZodiacSignInfo


def normalize_degrees(deg: float) -> float:
    """
    Normalize an astronomical angle in degrees to the range [0.0, 360.0).
    Handles negative angles and values >= 360.0.
    """
    res = deg % 360.0
    if res < 0.0:
        res += 360.0
    return 0.0 if math.isclose(res, 360.0, abs_tol=1e-9) else res


def get_zodiac_sign(longitude: float) -> ZodiacSignInfo:
    """
    Determine the zodiac sign (1 to 12) corresponding to a sidereal longitude.
    Sign index is 1-based: 1=Aries (0-30°), 2=Taurus (30-60°), ..., 12=Pisces (330-360°).
    """
    norm_lon = normalize_degrees(longitude)
    sign_number = int(norm_lon // 30.0) + 1
    # Safeguard boundary edge at 360.0
    if sign_number > 12:
        sign_number = 12
    return ZODIAC_SIGNS[sign_number]


def get_degree_in_sign(longitude: float) -> float:
    """
    Calculate the degree within the zodiac sign [0.0, 30.0).
    """
    norm_lon = normalize_degrees(longitude)
    deg_in_sign = norm_lon % 30.0
    return deg_in_sign


def split_dms(degrees: float) -> Tuple[int, int, float]:
    """
    Convert a decimal degree value into a tuple of (degrees, arcminutes, arcseconds).
    Example: 24.3887 -> (24, 23, 19.32)
    """
    deg_int = int(degrees)
    remainder_minutes = (degrees - deg_int) * 60.0
    min_int = int(remainder_minutes)
    sec_float = round((remainder_minutes - min_int) * 60.0, 2)

    # Handle second overflow
    if sec_float >= 60.0:
        sec_float = 0.0
        min_int += 1
    if min_int >= 60:
        min_int = 0
        deg_int += 1

    return deg_int, min_int, sec_float


def format_dms(degrees: float) -> str:
    """Format degrees into traditional astronomical notation (e.g. 24° 23' 19.32\")."""
    d, m, s = split_dms(degrees)
    return f"{d:02d}° {m:02d}' {s:05.2f}\""

