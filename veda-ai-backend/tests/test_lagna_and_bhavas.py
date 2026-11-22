from datetime import date, time
import pytest
import uuid
from httpx import AsyncClient

from app.astrology.constants import (
    NAKSHATRAS,
    VIMSHOTTARI_LORDS,
    AyanamshaSystem,
    SIGN_LORDS,
)
from app.astrology.exceptions import (
    InvalidCoordinatesError,
    InvalidTimezoneError,
    UnknownBirthTimeError,
)
from app.astrology.services.ascendant_service import AscendantService
from app.astrology.services.bhava_service import BhavaService
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.services.lagna_chart_service import LagnaChartService
from app.astrology.utils.house_utils import (
    get_planet_house,
    get_sign_lord,
    get_whole_sign_houses,
)
from app.astrology.utils.nakshatra_utils import calculate_nakshatra


async def create_auth_user(async_client: AsyncClient, email: str = "lagna_tester@veda.ai"):
    """Helper to register, login, and obtain authorization headers."""
    reg = {
        "full_name": "Lagna Tester",
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
# 1. Nakshatra & Pada Boundary Tests
# ==============================================================================
def test_nakshatra_sequence_and_lords():
    """Verify all 27 classical Nakshatras map to the correct 9-lord Vimshottari sequence."""
    assert len(NAKSHATRAS) == 27
    assert len(VIMSHOTTARI_LORDS) == 9

    for i in range(27):
        lon = i * (40.0 / 3.0) + 1.0  # inside the nakshatra
        res = calculate_nakshatra(lon)
        assert res.number == i + 1
        assert res.name == NAKSHATRAS[i]
        assert res.lord_name == VIMSHOTTARI_LORDS[i % 9]
        assert res.lord_id == VIMSHOTTARI_LORDS[i % 9].lower()


def test_pada_spans_in_ashwini():
    """Verify 4 padas of Ashwini (each spanning 3° 20')."""
    # Pada 1: 0° to 3° 20' (0.0 to 3.3333°)
    p1 = calculate_nakshatra(1.5)
    assert p1.number == 1
    assert p1.name == "Ashwini"
    assert p1.pada == 1
    assert p1.lord_name == "Ketu"

    # Pada 2: 3° 20' to 6° 40' (3.3333° to 6.6667°)
    p2 = calculate_nakshatra(4.0)
    assert p2.number == 1
    assert p2.name == "Ashwini"
    assert p2.pada == 2

    # Pada 3: 6° 40' to 10° 00' (6.6667° to 10.0°)
    p3 = calculate_nakshatra(8.5)
    assert p3.number == 1
    assert p3.name == "Ashwini"
    assert p3.pada == 3

    # Pada 4: 10° 00' to 13° 20' (10.0° to 13.3333°)
    p4 = calculate_nakshatra(12.0)
    assert p4.number == 1
    assert p4.name == "Ashwini"
    assert p4.pada == 4

    # Next Nakshatra: Bharani Pada 1 at 14°
    p_bharani = calculate_nakshatra(14.0)
    assert p_bharani.number == 2
    assert p_bharani.name == "Bharani"
    assert p_bharani.pada == 1
    assert p_bharani.lord_name == "Venus"


def test_nakshatra_at_ecliptic_boundary():
    """Verify end of zodiac (Revati Pada 4 at 359.99°)."""
    res = calculate_nakshatra(359.99)
    assert res.number == 27
    assert res.name == "Revati"
    assert res.pada == 4
    assert res.lord_name == "Mercury"


# ==============================================================================
# 2. Whole Sign House System & Lord Mapping Tests
# ==============================================================================
def test_sign_lords_classical_vedic():
    """Verify classical planetary rulership for all 12 Rashis (no modern outer planets)."""
    expected_lords = {
        1: ("mars", "Mars"),
        2: ("venus", "Venus"),
        3: ("mercury", "Mercury"),
        4: ("moon", "Moon"),
        5: ("sun", "Sun"),
        6: ("mercury", "Mercury"),
        7: ("venus", "Venus"),
        8: ("mars", "Mars"),
        9: ("jupiter", "Jupiter"),
        10: ("saturn", "Saturn"),
        11: ("saturn", "Saturn"),
        12: ("jupiter", "Jupiter"),
    }
    for sign_num, (lord_id, lord_name) in expected_lords.items():
        lord_info = get_sign_lord(sign_num)
        assert lord_info.lord_id == lord_id
        assert lord_info.english_name == lord_name


def test_whole_sign_houses_libra_ascendant():
    """Verify 12 Whole Sign houses when Ascendant is in Libra (Sign 7)."""
    houses = get_whole_sign_houses(186.8)  # Libra ~6° 48'
    assert len(houses) == 12

    # House 1: Libra
    assert houses[0]["house_number"] == 1
    assert houses[0]["sign_number"] == 7
    assert houses[0]["sign_name"] == "Libra"
    assert houses[0]["house_lord"] == "Venus"
    assert houses[0]["is_ascendant_house"] is True

    # House 2: Scorpio
    assert houses[1]["house_number"] == 2
    assert houses[1]["sign_number"] == 8
    assert houses[1]["sign_name"] == "Scorpio"
    assert houses[1]["house_lord"] == "Mars"
    assert houses[1]["is_ascendant_house"] is False

    # House 12: Virgo
    assert houses[11]["house_number"] == 12
    assert houses[11]["sign_number"] == 6
    assert houses[11]["sign_name"] == "Virgo"
    assert houses[11]["house_lord"] == "Mercury"


def test_whole_sign_houses_aries_and_pisces():
    """Verify Whole Sign house rotation for Aries and Pisces Ascendants."""
    # Aries Ascendant (Sign 1)
    aries_houses = get_whole_sign_houses(15.0)
    assert aries_houses[0]["sign_number"] == 1
    assert aries_houses[0]["sign_name"] == "Aries"
    assert aries_houses[11]["sign_number"] == 12
    assert aries_houses[11]["sign_name"] == "Pisces"

    # Pisces Ascendant (Sign 12)
    pisces_houses = get_whole_sign_houses(345.0)
    assert pisces_houses[0]["sign_number"] == 12
    assert pisces_houses[0]["sign_name"] == "Pisces"
    assert pisces_houses[1]["sign_number"] == 1
    assert pisces_houses[1]["sign_name"] == "Aries"
    assert pisces_houses[11]["sign_number"] == 11
    assert pisces_houses[11]["sign_name"] == "Aquarius"


def test_get_planet_house_calculation():
    """Verify planet-to-house calculation under Whole Sign system."""
    asc_lon = 186.8  # Libra (Sign 7)

    # Planet in Libra (Sign 7) -> House 1
    assert get_planet_house(190.0, asc_lon) == 1
    # Planet in Scorpio (Sign 8) -> House 2
    assert get_planet_house(220.0, asc_lon) == 2
    # Planet in Aries (Sign 1) -> House 7
    assert get_planet_house(10.0, asc_lon) == 7
    # Planet in Virgo (Sign 6) -> House 12
    assert get_planet_house(175.0, asc_lon) == 12


# ==============================================================================
# 3. Astronomical Benchmark Calculation Tests (Varanasi Reference)
# ==============================================================================
def test_varanasi_ascendant_benchmark():
    """
    Astronomical Benchmark:
    Birth: 1994-10-14 06:45:00 IST (01:15:00 UTC) at Varanasi (25.3176° N, 82.9739° E).
    Sidereal Lahiri Ascendant: Libra (Tula) at ~6° 48' 14" (approx 186.80°).
    Nakshatra: Swati (number 15), Pada 1, Lord Rahu.
    """
    resp = AscendantService.calculate_ascendant(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        latitude=25.3176,
        longitude=82.9739,
        birth_time_accuracy="exact",
        ayanamsha="lahiri",
    )

    asc = resp.ascendant
    assert asc.sign_number == 7
    assert asc.sign_name == "Libra"
    assert asc.sign_sanskrit == "Tula"
    assert asc.longitude == pytest.approx(186.804, abs=0.05)
    assert asc.degree_in_sign == pytest.approx(6.804, abs=0.05)
    assert asc.degree == 6
    assert asc.minutes == 48

    # Nakshatra verification
    assert asc.nakshatra.number == 15
    assert asc.nakshatra.name == "Swati"
    assert asc.nakshatra.pada == 1
    assert asc.nakshatra.lord == "Rahu"
    assert asc.nakshatra.lord_id == "rahu"


def test_varanasi_planetary_placements_and_houses():
    """
    Verify complete 12 Bhavas and planetary placements for the Varanasi reference chart.
    """
    resp = LagnaChartService.calculate_lagna_chart(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        latitude=25.3176,
        longitude=82.9739,
        birth_time_accuracy="exact",
        ayanamsha="lahiri",
    )

    assert resp.ascendant.sign_name == "Libra"
    assert len(resp.houses) == 12
    assert len(resp.planetary_placements) == 9

    # Verify key planetary house placements
    placements_by_id = {p.planet_id: p for p in resp.planetary_placements}

    # Sun in Virgo -> House 12
    assert placements_by_id["sun"].sign_name == "Virgo"
    assert placements_by_id["sun"].house_number == 12

    # Moon in Capricorn -> House 4
    assert placements_by_id["moon"].sign_name == "Capricorn"
    assert placements_by_id["moon"].house_number == 4

    # Mars in Cancer -> House 10
    assert placements_by_id["mars"].sign_name == "Cancer"
    assert placements_by_id["mars"].house_number == 10

    # Mercury in Libra -> House 1
    assert placements_by_id["mercury"].sign_name == "Libra"
    assert placements_by_id["mercury"].house_number == 1

    # Jupiter in Libra -> House 1
    assert placements_by_id["jupiter"].sign_name == "Libra"
    assert placements_by_id["jupiter"].house_number == 1

    # Saturn in Aquarius -> House 5
    assert placements_by_id["saturn"].sign_name == "Aquarius"
    assert placements_by_id["saturn"].house_number == 5

    # Rahu in Libra -> House 1
    assert placements_by_id["rahu"].sign_name == "Libra"
    assert placements_by_id["rahu"].house_number == 1

    # Ketu in Aries -> House 7
    assert placements_by_id["ketu"].sign_name == "Aries"
    assert placements_by_id["ketu"].house_number == 7

    # Verify occupying planets in houses
    houses_by_num = {h.house_number: h for h in resp.houses}
    h1_planets = [p.planet_id for p in houses_by_num[1].planets]
    assert "mercury" in h1_planets
    assert "jupiter" in h1_planets
    assert "rahu" in h1_planets

    h12_planets = [p.planet_id for p in houses_by_num[12].planets]
    assert "sun" in h12_planets


# ==============================================================================
# 4. Input Validation & Error Handling Tests
# ==============================================================================
def test_unknown_birth_time_rejected():
    """Verify unknown birth time raises UnknownBirthTimeError."""
    with pytest.raises(UnknownBirthTimeError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=None,
            timezone_str="Asia/Kolkata",
            latitude=25.3176,
            longitude=82.9739,
            birth_time_accuracy="unknown",
        )


def test_missing_coordinates_rejected():
    """Verify missing latitude or longitude raises InvalidCoordinatesError."""
    with pytest.raises(InvalidCoordinatesError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str="Asia/Kolkata",
            latitude=None,
            longitude=82.9739,
        )

    with pytest.raises(InvalidCoordinatesError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str="Asia/Kolkata",
            latitude=25.3176,
            longitude=None,
        )


def test_invalid_coordinates_range_rejected():
    """Verify coordinates out of range raise InvalidCoordinatesError."""
    with pytest.raises(InvalidCoordinatesError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str="Asia/Kolkata",
            latitude=95.0,  # invalid > 90
            longitude=82.9739,
        )

    with pytest.raises(InvalidCoordinatesError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str="Asia/Kolkata",
            latitude=25.3176,
            longitude=-185.0,  # invalid < -180
        )


def test_missing_timezone_rejected():
    """Verify missing timezone raises InvalidTimezoneError."""
    with pytest.raises(InvalidTimezoneError):
        AscendantService.calculate_ascendant(
            date_of_birth=date(1994, 10, 14),
            time_of_birth=time(6, 45, 0),
            timezone_str=None,
            latitude=25.3176,
            longitude=82.9739,
        )


def test_approximate_birth_time_warning():
    """Verify approximate birth time proceeds with an operational warning."""
    resp = AscendantService.calculate_ascendant(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        latitude=25.3176,
        longitude=82.9739,
        birth_time_accuracy="approximate",
    )
    assert resp.metadata.birth_time_accuracy == "approximate"
    assert any("approximate" in w.lower() for w in resp.metadata.warnings)


# ==============================================================================
# 5. REST API Integration Endpoints Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_birth_profile_astrology_endpoints(async_client: AsyncClient):
    """
    Verify all 4 new astrology endpoints via HTTP:
    - GET /api/v1/astrology/birth-profiles/{profile_id}/lagna
    - GET /api/v1/astrology/birth-profiles/{profile_id}/houses
    - GET /api/v1/astrology/birth-profiles/{profile_id}/planetary-placements
    - GET /api/v1/astrology/birth-profiles/{profile_id}/lagna-chart
    """
    headers = await create_auth_user(async_client, "lagna_api_test@veda.ai")

    # 1. Create a birth profile
    create_payload = {
        "profile_name": "Varanasi Native",
        "full_name": "Varanasi Native User",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_time_accuracy": "exact",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
        "ayanamsha": "lahiri",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    profile_id = create_res.json()["id"]

    # 2. Test Lagna endpoint
    lagna_res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/lagna", headers=headers)
    assert lagna_res.status_code == 200
    lagna_data = lagna_res.json()
    assert lagna_data["ascendant"]["sign_name"] == "Libra"
    assert lagna_data["ascendant"]["nakshatra"]["name"] == "Swati"
    assert lagna_data["ascendant"]["nakshatra"]["pada"] == 1
    assert lagna_data["metadata"]["ayanamsha"] == "lahiri"

    # 3. Test Houses endpoint
    houses_res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/houses", headers=headers)
    assert houses_res.status_code == 200
    houses_data = houses_res.json()
    assert len(houses_data["houses"]) == 12
    assert houses_data["houses"][0]["sign_name"] == "Libra"
    assert houses_data["houses"][0]["is_ascendant_house"] is True

    # 4. Test Planetary Placements endpoint
    placements_res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/planetary-placements",
        headers=headers,
    )
    assert placements_res.status_code == 200
    placements_data = placements_res.json()
    assert len(placements_data["placements"]) == 9
    sun_placement = next(p for p in placements_data["placements"] if p["planet_id"] == "sun")
    assert sun_placement["sign_name"] == "Virgo"
    assert sun_placement["house_number"] == 12

    # 5. Test Unified Lagna Chart endpoint
    chart_res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/lagna-chart",
        headers=headers,
    )
    assert chart_res.status_code == 200
    chart_data = chart_res.json()
    assert chart_data["ascendant"]["sign_name"] == "Libra"
    assert len(chart_data["houses"]) == 12
    assert len(chart_data["planetary_placements"]) == 9

    # 6. Test Query Param Overrides (?ayanamsha=raman&node_type=mean)
    raman_res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/lagna-chart?ayanamsha=raman&node_type=mean",
        headers=headers,
    )
    assert raman_res.status_code == 200
    raman_data = raman_res.json()
    assert raman_data["metadata"]["ayanamsha"] == "raman"
    assert raman_data["metadata"]["node_type"] == "mean"


@pytest.mark.asyncio
async def test_ownership_isolation_and_not_found(async_client: AsyncClient):
    """Verify cross-user ownership isolation and missing profile handling."""
    headers_a = await create_auth_user(async_client, "owner_a@veda.ai")
    headers_b = await create_auth_user(async_client, "owner_b@veda.ai")

    # User A creates a profile
    create_payload = {
        "profile_name": "User A Chart",
        "full_name": "User A",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=create_payload, headers=headers_a)
    profile_id = create_res.json()["id"]

    # User B attempts to access User A's Lagna -> 404
    cross_res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/lagna", headers=headers_b)
    assert cross_res.status_code == 404
    assert cross_res.json()["error_code"] == "RESOURCE_NOT_FOUND"

    # Random non-existent UUID -> 404
    random_id = uuid.uuid4()
    not_found_res = await async_client.get(f"/api/v1/astrology/birth-profiles/{random_id}/lagna", headers=headers_a)
    assert not_found_res.status_code == 404
    assert not_found_res.json()["error_code"] == "RESOURCE_NOT_FOUND"



@pytest.mark.asyncio
async def test_birth_profile_with_unknown_birth_time_rejected_by_api(async_client: AsyncClient):
    """Verify that a birth profile with unknown birth time returns 422 upon Lagna request."""
    headers = await create_auth_user(async_client, "unknown_tob_api@veda.ai")

    create_payload = {
        "profile_name": "Unknown TOB Person",
        "full_name": "Unknown Person",
        "date_of_birth": "1994-10-14",
        "time_of_birth": None,
        "birth_time_accuracy": "unknown",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=create_payload, headers=headers)
    profile_id = create_res.json()["id"]

    res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/lagna", headers=headers)
    assert res.status_code == 422
    assert res.json()["error_code"] == "UNKNOWN_BIRTH_TIME"

