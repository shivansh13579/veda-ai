from datetime import date, datetime, time, timezone
import pytest
from httpx import AsyncClient

from app.astrology.config import get_astrology_config
from app.astrology.constants import (
    NAVAGRAHA_BODIES,
    AyanamshaSystem,
    NodeType,
    PlanetId,
    ZODIAC_SIGNS,
)
from app.astrology.ephemeris.swiss_ephemeris import SwissEphemerisWrapper
from app.astrology.exceptions import (
    EphemerisUnavailableError,
    InvalidBirthDateTimeError,
    InvalidTimezoneError,
    UnknownBirthTimeError,
    UnsupportedAyanamshaError,
)
from app.astrology.services.planetary_service import PlanetaryService
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


async def create_auth_headers(async_client: AsyncClient, email: str = "astro_test@veda.ai"):
    """Helper to register and login, returning auth headers."""
    reg = {
        "full_name": "Jyotish Tester",
        "email": email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
    }
    await async_client.post("/api/v1/auth/register", json=reg)
    login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePassword123!"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ==============================================================================
# 1. Configuration & Standards Tests
# ==============================================================================
def test_astrology_default_configuration():
    """Verify default astrology settings adhere to classical Vedic Jyotish standards."""
    cfg = get_astrology_config()
    assert cfg.astrology_system == "vedic"
    assert cfg.zodiac_type == "sidereal"
    assert cfg.default_ayanamsha == "lahiri"
    assert cfg.default_house_system == "whole_sign"
    assert cfg.node_type == "true"
    assert cfg.allow_approximate_time is True


def test_ayanamsha_mapping_supported():
    """Verify supported ayanamsha modes (Lahiri, Raman, KP) exist in constants."""
    assert AyanamshaSystem.LAHIRI.value == "lahiri"
    assert AyanamshaSystem.RAMAN.value == "raman"
    assert AyanamshaSystem.KP.value == "kp"


def test_unsupported_ayanamsha_rejected():
    """Verify attempting to calculate with an unsupported ayanamsha raises an error."""
    with pytest.raises(UnsupportedAyanamshaError):
        PlanetaryService.calculate_planetary_positions(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str="Asia/Kolkata",
            ayanamsha="western_tropical_invalid",
        )


# ==============================================================================
# 2. Date, Time and Timezone Handling Tests
# ==============================================================================
def test_asia_kolkata_timezone_conversion():
    """
    Verify India Standard Time (IST, UTC+05:30) conversion.
    1994-10-14 06:45:00 IST -> 1994-10-14 01:15:00 UTC.
    """
    local_dt, utc_dt = local_to_utc_datetime(
        dob=date(1994, 10, 14),
        tob=time(6, 45, 0),
        tz_str="Asia/Kolkata",
    )
    assert local_dt.year == 1994
    assert local_dt.month == 10
    assert local_dt.day == 14
    assert local_dt.hour == 6
    assert local_dt.minute == 45

    assert utc_dt.year == 1994
    assert utc_dt.month == 10
    assert utc_dt.day == 14
    assert utc_dt.hour == 1
    assert utc_dt.minute == 15
    assert utc_dt.tzinfo == timezone.utc


def test_daylight_saving_transition():
    """
    Verify Daylight Saving Time (DST) conversion for America/New_York:
    - Summer (EDT, UTC-4): 2024-07-01 12:00:00 -> 16:00:00 UTC
    - Winter (EST, UTC-5): 2024-01-01 12:00:00 -> 17:00:00 UTC
    """
    # Summer EDT
    _, utc_summer = local_to_utc_datetime(
        dob=date(2024, 7, 1),
        tob=time(12, 0, 0),
        tz_str="America/New_York",
    )
    assert utc_summer.hour == 16

    # Winter EST
    _, utc_winter = local_to_utc_datetime(
        dob=date(2024, 1, 1),
        tob=time(12, 0, 0),
        tz_str="America/New_York",
    )
    assert utc_winter.hour == 17


def test_invalid_timezone_raises():
    """Verify invalid or non-existent IANA timezones raise InvalidTimezoneError."""
    with pytest.raises(InvalidTimezoneError):
        local_to_utc_datetime(
            dob=date(1994, 10, 14),
            tob=time(6, 45, 0),
            tz_str="Jupiter/Europa",
        )


def test_unknown_birth_time_raises_error():
    """Verify unknown birth time rejects exact planetary chart generation."""
    with pytest.raises(UnknownBirthTimeError):
        PlanetaryService.calculate_planetary_positions(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=None,
            timezone_str="Asia/Kolkata",
            birth_time_accuracy="unknown",
        )


def test_approximate_birth_time_includes_warning():
    """Verify approximate birth time generates chart with explicit metadata warning."""
    res = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        birth_time_accuracy="approximate",
    )
    assert res.metadata.birth_time_accuracy == "approximate"
    assert len(res.metadata.warnings) > 0
    assert any("approximate" in w.lower() for w in res.metadata.warnings)


# ==============================================================================
# 3. Coordinate & Zodiac Math Tests
# ==============================================================================
def test_normalize_degrees():
    """Verify longitude normalization between 0 and 360."""
    assert normalize_degrees(0.0) == 0.0
    assert normalize_degrees(360.0) == 0.0
    assert normalize_degrees(375.5) == 15.5
    assert normalize_degrees(-10.0) == 350.0
    assert normalize_degrees(-370.0) == 350.0


def test_zodiac_sign_and_degree_in_sign():
    """Verify sign assignment (1..12) and degree within sign (0..30)."""
    # 0° -> Aries 0°
    sign1 = get_zodiac_sign(0.0)
    assert sign1.number == 1
    assert sign1.english_name == "Aries"
    assert sign1.sanskrit_name == "Mesha"
    assert get_degree_in_sign(0.0) == 0.0

    # 176.6834° -> Virgo (Sign 6: 150°-180°) at 26.6834°
    sign6 = get_zodiac_sign(176.6834)
    assert sign6.number == 6
    assert sign6.english_name == "Virgo"
    assert sign6.sanskrit_name == "Kanya"
    assert get_degree_in_sign(176.6834) == pytest.approx(26.6834, abs=1e-4)

    # 359.9° -> Pisces (Sign 12: 330°-360°)
    sign12 = get_zodiac_sign(359.9)
    assert sign12.number == 12
    assert sign12.english_name == "Pisces"
    assert sign12.sanskrit_name == "Meena"


def test_split_dms_and_formatting():
    """Verify DMS (degrees, minutes, seconds) formatting."""
    d, m, s = split_dms(26.683368)
    assert d == 26
    assert m == 41
    assert pytest.approx(s, abs=0.1) == 0.12
    formatted = format_dms(26.683368)
    assert "26° 41'" in formatted


# ==============================================================================
# 4. Astronomical Reference Chart & Planetary Calculations
# ==============================================================================
def test_astronomical_reference_case():
    """
    Astronomical Reference Benchmark:
    Timestamp: 1994-10-14 01:15:00 UTC (06:45:00 IST)
    Location: Varanasi, India
    Ayanamsha: Lahiri (~23.784220°)
    Node Convention: True Node

    Expected Sidereal Placements (Lahiri):
    - Sun: Virgo ~26° 41' 00" (176.683°)
    - Moon: Capricorn ~24° 23' 19" (294.389°)
    - Mars: Cancer ~11° 24' 36" (101.410°)
    - Mercury: Libra ~11° 12' 32" (191.209°, Retrograde)
    - Jupiter: Libra ~23° 54' 53" (203.915°)
    - Venus: Libra ~24° 12' 35" (204.210°, Retrograde)
    - Saturn: Aquarius ~12° 28' 37" (312.477°, Retrograde)
    - Rahu (True): Libra ~21° 16' 56" (201.282°, Retrograde)
    - Ketu (True): Aries ~21° 16' 56" (21.282°, Retrograde)
    """
    res = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        ayanamsha="lahiri",
        node_type="true",
    )

    # 1. Verify all 9 Navagraha celestial bodies are present
    assert len(res.planets) == 9
    planet_map = {p.planet_id: p for p in res.planets}
    expected_bodies = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"]
    for b in expected_bodies:
        assert b in planet_map

    # 2. Verify Ayanamsha
    assert res.metadata.ayanamsha == "lahiri"
    assert res.metadata.ayanamsha_value == pytest.approx(23.784220, abs=0.01)

    # 3. Sun Placements
    sun = planet_map["sun"]
    assert sun.sign_name == "Virgo"
    assert sun.sign_sanskrit == "Kanya"
    assert sun.sign_number == 6
    assert sun.longitude == pytest.approx(176.683, abs=0.05)
    assert sun.is_retrograde is False

    # 4. Moon Placements
    moon = planet_map["moon"]
    assert moon.sign_name == "Capricorn"
    assert moon.sign_sanskrit == "Makara"
    assert moon.sign_number == 10
    assert moon.longitude == pytest.approx(294.389, abs=0.05)
    assert moon.is_retrograde is False

    # 5. Mars Placements
    mars = planet_map["mars"]
    assert mars.sign_name == "Cancer"
    assert mars.sign_number == 4
    assert mars.longitude == pytest.approx(101.410, abs=0.05)
    assert mars.is_retrograde is False

    # 6. Mercury Placements (Retrograde)
    mercury = planet_map["mercury"]
    assert mercury.sign_name == "Libra"
    assert mercury.sign_number == 7
    assert mercury.longitude == pytest.approx(191.209, abs=0.05)
    assert mercury.is_retrograde is True
    assert mercury.speed_longitude < 0.0

    # 7. Jupiter Placements
    jupiter = planet_map["jupiter"]
    assert jupiter.sign_name == "Libra"
    assert jupiter.longitude == pytest.approx(203.915, abs=0.05)
    assert jupiter.is_retrograde is False

    # 8. Venus Placements (Retrograde)
    venus = planet_map["venus"]
    assert venus.sign_name == "Libra"
    assert venus.longitude == pytest.approx(204.210, abs=0.05)
    assert venus.is_retrograde is True
    assert venus.speed_longitude < 0.0

    # 9. Saturn Placements (Retrograde)
    saturn = planet_map["saturn"]
    assert saturn.sign_name == "Aquarius"
    assert saturn.sign_number == 11
    assert saturn.longitude == pytest.approx(312.477, abs=0.05)
    assert saturn.is_retrograde is True
    assert saturn.speed_longitude < 0.0

    # 10. Rahu and Ketu Opposition
    rahu = planet_map["rahu"]
    ketu = planet_map["ketu"]
    assert rahu.sign_name == "Libra"
    assert rahu.longitude == pytest.approx(201.282, abs=0.05)
    assert rahu.is_retrograde is True

    assert ketu.sign_name == "Aries"
    assert ketu.sign_number == 1
    assert ketu.longitude == pytest.approx(21.282, abs=0.05)
    assert ketu.is_retrograde is True

    # Exact 180° opposition invariant
    diff = normalize_degrees(rahu.longitude - ketu.longitude)
    assert diff == pytest.approx(180.0, abs=1e-4)


def test_mean_node_versus_true_node():
    """
    Verify that Mean Node and True Node conventions produce distinct, documented positions.
    For 1994-10-14 01:15:00 UTC:
    - True Node Rahu is ~201.282°
    - Mean Node Rahu is ~202.161° (difference of ~0.879°)
    """
    res_true = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        node_type="true",
    )
    res_mean = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        node_type="mean",
    )

    rahu_true = next(p for p in res_true.planets if p.planet_id == "rahu")
    rahu_mean = next(p for p in res_mean.planets if p.planet_id == "rahu")

    assert rahu_true.longitude == pytest.approx(201.282, abs=0.05)
    assert rahu_mean.longitude == pytest.approx(202.161, abs=0.05)
    assert abs(rahu_true.longitude - rahu_mean.longitude) > 0.5


# ==============================================================================
# 5. Diagnostic Engine Status Endpoint Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_diagnostic_engine_status_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/astrology/engine/status returns healthy engine metadata."""
    headers = await create_auth_headers(async_client, "astro_diag@veda.ai")

    res = await async_client.get("/api/v1/astrology/engine/status", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["engine_name"] == "Swiss Ephemeris"
    assert data["engine_available"] is True
    assert data["astrology_system"] == "vedic"
    assert data["zodiac_type"] == "sidereal"
    assert data["default_ayanamsha"] == "lahiri"
    assert data["default_house_system"] == "whole_sign"
    assert data["node_type"] == "true"
    assert len(data["supported_celestial_bodies"]) == 9
    assert "sun" in data["supported_celestial_bodies"]
    assert "ketu" in data["supported_celestial_bodies"]
    assert "lahiri" in data["supported_ayanamshas"]
    assert "raman" in data["supported_ayanamshas"]
    assert "kp" in data["supported_ayanamshas"]


@pytest.mark.asyncio
async def test_diagnostic_engine_status_unauthenticated(async_client: AsyncClient):
    """Verify diagnostic endpoint requires authentication."""
    res = await async_client.get("/api/v1/astrology/engine/status")
    assert res.status_code == 401
    assert res.json()["error_code"] == "INVALID_TOKEN"


# ==============================================================================
# 6. Additional Ayanamshas and Ephemeris File Strictness Tests
# ==============================================================================
def test_raman_and_kp_ayanamshas():
    """
    Verify calculation with Raman and KP ayanamshas produces expected astronomical offsets:
    - Raman Ayanamsha (~22.33°) is ~1.45° lower than Lahiri (~23.78°).
    - KP Ayanamsha (~23.79°) is very close to Lahiri (within a few arcminutes).
    """
    res_lahiri = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        ayanamsha="lahiri",
    )
    res_raman = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        ayanamsha="raman",
    )
    res_kp = PlanetaryService.calculate_planetary_positions(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        ayanamsha="kp",
    )

    # Check ayanamsha values
    assert res_lahiri.metadata.ayanamsha_value == pytest.approx(23.784, abs=0.01)
    assert res_raman.metadata.ayanamsha_value == pytest.approx(22.333, abs=0.05)
    assert res_kp.metadata.ayanamsha_value == pytest.approx(23.687, abs=0.01)

    # In Raman ayanamsha, sidereal longitude is higher because subtraction is smaller
    sun_lahiri = next(p for p in res_lahiri.planets if p.planet_id == "sun")
    sun_raman = next(p for p in res_raman.planets if p.planet_id == "sun")
    assert sun_raman.longitude > sun_lahiri.longitude
    assert (sun_raman.longitude - sun_lahiri.longitude) == pytest.approx(1.45, abs=0.05)


def test_convenience_calculate_for_birth_profile():
    """Verify calculating directly from a BirthProfile-like object."""
    from types import SimpleNamespace

    mock_profile = SimpleNamespace(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone="Asia/Kolkata",
        birth_time_accuracy="exact",
        ayanamsha="lahiri",
    )

    chart = PlanetaryService.calculate_for_birth_profile(mock_profile)
    assert len(chart.planets) == 9
    assert chart.metadata.ayanamsha == "lahiri"


def test_require_ephemeris_files_setting(monkeypatch):
    """
    Verify that when ASTROLOGY_REQUIRE_EPHEMERIS_FILES is set to True
    and .se1 data files are missing, EphemerisUnavailableError is raised.
    """
    monkeypatch.setattr(settings, "ASTROLOGY_REQUIRE_EPHEMERIS_FILES", True)
    monkeypatch.setattr(settings, "SWISS_EPHEMERIS_PATH", "/non/existent/ephe/dir")

    with pytest.raises(EphemerisUnavailableError):
        SwissEphemerisWrapper.calculate_planet_position(
            julian_day_ut=2449639.552,
            swe_body_id=0,
            ayanamsha="lahiri",
        )


