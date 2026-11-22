import zoneinfo
from datetime import date, datetime, time, timezone
from typing import Tuple

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore

from app.astrology.exceptions import InvalidBirthDateTimeError, InvalidTimezoneError


def get_zoneinfo(tz_str: str) -> zoneinfo.ZoneInfo:
    """Safely resolve an IANA timezone string or raise InvalidTimezoneError."""
    if not tz_str or not isinstance(tz_str, str):
        raise InvalidTimezoneError("A valid IANA timezone string must be provided.")
    try:
        return zoneinfo.ZoneInfo(tz_str.strip())
    except Exception as exc:
        raise InvalidTimezoneError(
            f"Invalid or unrecognized IANA timezone: '{tz_str}'.",
            details={"timezone": tz_str, "error": str(exc)},
        ) from exc


def local_to_utc_datetime(
    dob: date,
    tob: time,
    tz_str: str,
) -> Tuple[datetime, datetime]:
    """
    Combine local birth date, birth time, and IANA timezone into an offset-aware local datetime,
    and convert to deterministic UTC datetime.

    Returns:
        (local_datetime, utc_datetime)
    """
    if not isinstance(dob, date):
        raise InvalidBirthDateTimeError("date_of_birth must be a valid date object.")
    if not isinstance(tob, time):
        raise InvalidBirthDateTimeError("time_of_birth must be a valid time object.")

    tz = get_zoneinfo(tz_str)

    try:
        # Construct localized naive datetime and attach timezone
        local_dt = datetime(
            year=dob.year,
            month=dob.month,
            day=dob.day,
            hour=tob.hour,
            minute=tob.minute,
            second=tob.second,
            microsecond=tob.microsecond,
            tzinfo=tz,
        )
        utc_dt = local_dt.astimezone(timezone.utc)
        return local_dt, utc_dt
    except Exception as exc:
        raise InvalidBirthDateTimeError(
            f"Failed to localize birth datetime: {exc}",
            details={"date": str(dob), "time": str(tob), "timezone": tz_str},
        ) from exc


def datetime_to_julian_day(dt_utc: datetime) -> float:
    """
    Calculate the Universal Time Julian Day (UT) from an offset-aware UTC datetime.
    Uses Swiss Ephemeris swe.julday with Gregorian calendar convention.
    """
    if dt_utc.tzinfo is None:
        raise InvalidBirthDateTimeError("UTC datetime must be timezone-aware (tzinfo=timezone.utc).")

    # Decimal UTC hour
    hour_decimal = (
        dt_utc.hour
        + dt_utc.minute / 60.0
        + dt_utc.second / 3600.0
        + dt_utc.microsecond / 3.6e9
    )

    if swe is not None:
        return swe.julday(
            dt_utc.year,
            dt_utc.month,
            dt_utc.day,
            hour_decimal,
            swe.GREG_CAL,
        )

    # Pure Python astronomical fallback for Julian Day if Swiss Ephemeris library is unavailable
    # Meeus Astronomical Algorithms formula 7.1
    y = dt_utc.year
    m = dt_utc.month
    d = dt_utc.day + hour_decimal / 24.0
    if m <= 2:
        y -= 1
        m += 12
    a = int(y / 100)
    b = 2 - a + int(a / 4)
    jd = int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + b - 1524.5
    return jd

