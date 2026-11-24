from datetime import date, time
import pytest
import uuid
from httpx import AsyncClient

from app.astrology.constants import (
    NAVAMSA_SPAN_DEGREES,
    NAVAMSA_SPAN_MINUTES,
    SIGN_LORDS,
    ZODIAC_SIGNS,
    ZodiacModality,
)
from app.astrology.exceptions import (
    InvalidCoordinatesError,
    InvalidTimezoneError,
    UnknownBirthTimeError,
)
from app.astrology.schemas.divisional import (
    D1ChartResponse,
    D9ChartResponse,
    DivisionalChartsResponse,
)
from app.astrology.services.divisional_service import DivisionalService
from app.astrology.services.navamsa_service import NavamsaService
from app.astrology.utils.navamsa_utils import (
    calculate_navamsa,
    get_navamsa_start_sign,
    get_sign_modality,
)


async def create_auth_user(async_client: AsyncClient, email: str = "d1_d9_tester@veda.ai"):
    """Helper to register, login, and obtain authorization headers."""
    reg = {
        "full_name": "Divisional Tester",
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
# 1. Modality and Navamsa Starting Sign Rules Tests
# ==============================================================================
def test_zodiac_sign_modalities():
    """Verify all 12 signs map to their classical Parashara quadruplicity (Movable, Fixed, Dual)."""
    movable = [1, 4, 7, 10]    # Aries, Cancer, Libra, Capricorn
    fixed = [2, 5, 8, 11]      # Taurus, Leo, Scorpio, Aquarius
    dual = [3, 6, 9, 12]       # Gemini, Virgo, Sagittarius, Pisces

    for s in movable:
        assert get_sign_modality(s) == ZodiacModality.MOVABLE
    for s in fixed:
        assert get_sign_modality(s) == ZodiacModality.FIXED
    for s in dual:
        assert get_sign_modality(s) == ZodiacModality.DUAL


def test_navamsa_start_sign_rules():
    """
    Verify classical Navamsa sequence starting signs:
    - Movable: starts from the sign itself.
    - Fixed: starts from the 9th sign from itself.
    - Dual: starts from the 5th sign from itself.
    """
    # Movable
    assert get_navamsa_start_sign(1) == 1   # Aries -> Aries
    assert get_navamsa_start_sign(4) == 4   # Cancer -> Cancer
    assert get_navamsa_start_sign(7) == 7   # Libra -> Libra
    assert get_navamsa_start_sign(10) == 10 # Capricorn -> Capricorn

    # Fixed (9th from sign)
    assert get_navamsa_start_sign(2) == 10  # Taurus (2) + 8 = Capricorn (10)
    assert get_navamsa_start_sign(5) == 1   # Leo (5) + 8 = 13 -> Aries (1)
    assert get_navamsa_start_sign(8) == 4   # Scorpio (8) + 8 = 16 -> Cancer (4)
    assert get_navamsa_start_sign(11) == 7  # Aquarius (11) + 8 = 19 -> Libra (7)

    # Dual (5th from sign)
    assert get_navamsa_start_sign(3) == 7   # Gemini (3) + 4 = Libra (7)
    assert get_navamsa_start_sign(6) == 10  # Virgo (6) + 4 = Capricorn (10)
    assert get_navamsa_start_sign(9) == 1   # Sagittarius (9) + 4 = 13 -> Aries (1)
    assert get_navamsa_start_sign(12) == 4  # Pisces (12) + 4 = 16 -> Cancer (4)


# ==============================================================================
# 2. Mathematical Navamsa Division & Boundary Tests
# ==============================================================================
def test_all_nine_navamsa_divisions_in_aries():
    """
    Aries is Movable -> starts at Aries (1).
    Each division is 3°20' (200 arcminutes).
    Verify all 9 divisions cover signs 1 (Aries) through 9 (Sagittarius).
    """
    expected_d9_signs = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for idx in range(9):
        # Sample mid-point of each 3°20' slice
        deg = idx * (10.0 / 3.0) + 1.0  # +1° into the slice
        res = calculate_navamsa(deg)
        assert res.d1_sign_number == 1
        assert res.navamsa_index == idx
        assert res.navamsa_number == idx + 1
        assert res.d9_sign_number == expected_d9_signs[idx]


def test_navamsa_boundaries_around_3deg20min():
    """
    Test exact boundaries around 3° 20' (200 arcminutes):
    - Just before boundary (3° 19' 59.9"): division 0 (Aries)
    - Exactly at boundary (3° 20' 00.0"): division 1 (Taurus)
    """
    # 3° 19' 59" = 3.333055°
    res_before = calculate_navamsa(3.333)
    assert res_before.navamsa_index == 0
    assert res_before.d9_sign_number == 1  # Aries

    # 3° 20' 00" = 3.3333333333333335° = 200.0 arcmin
    res_at = calculate_navamsa(10.0 / 3.0)
    assert res_at.navamsa_index == 1
    assert res_at.d9_sign_number == 2  # Taurus


def test_sign_wrapping_from_pisces_to_aries():
    """
    Verify smooth zodiac continuity:
    Pisces (Sign 12, Dual) starts at Cancer (4).
    Last navamsa of Pisces (index 8, 26°40' to 30°00'):
    (4 - 1 + 8) % 12 + 1 = 12 (Pisces).
    Next degree is Aries 0°00' (Sign 1, Movable, starts at 1 = Aries).
    """
    # Pisces at 29° 30' (total longitude = 330 + 29.5 = 359.5°)
    res_pisces_end = calculate_navamsa(359.5)
    assert res_pisces_end.d1_sign_number == 12
    assert res_pisces_end.navamsa_index == 8
    assert res_pisces_end.d9_sign_number == 12  # Pisces

    # Aries at 0° 30' (total longitude = 0.5°)
    res_aries_start = calculate_navamsa(0.5)
    assert res_aries_start.d1_sign_number == 1
    assert res_aries_start.navamsa_index == 0
    assert res_aries_start.d9_sign_number == 1  # Aries


def test_navamsa_degree_scaling():
    """
    Verify that degrees within D9 sign correctly scale from 0° to 30°.
    Midpoint of a 3°20' slice (100 arcmin into the slice) should map to 15°00' in D9.
    """
    # 1° 40' = 100 arcminutes into Aries (slice 0)
    res = calculate_navamsa(1.6666666666666667)
    assert res.navamsa_index == 0
    assert res.d9_degree_in_sign == pytest.approx(15.0, abs=0.01)
    assert res.d9_degree == 15
    assert res.d9_minutes == 0


# ==============================================================================
# 3. Reference Fixture: Varanasi Benchmark Chart (D1 & D9)
# ==============================================================================
def test_varanasi_reference_d1_and_d9():
    """
    Independent Astronomical Reference:
    Native: 1994-10-14 06:45:00 IST (01:15:00 UTC) at Varanasi, India (25.3176° N, 82.9739° E).
    Lahiri Ayanamsha:
    D1 Ascendant: Libra ~6° 48' 14" (Sign 7)
    D9 Ascendant:
      - Libra is Movable -> sequence starts from Libra (7).
      - Deg in sign: 6° 48' = 408.24 arcmin.
      - Navamsa division: 408.24 // 200 = 2 (3rd division, spanning 6°40' to 10°00').
      - D9 Ascendant sign: (7 - 1 + 2) % 12 + 1 = 9 (Sagittarius / Dhanu).

    D9 Planetary Placements:
      - Sun (Virgo 26°41', Dual -> start Cap 10, div 8 -> Virgo): Vargottama! House 10 from D9 Lagna.
      - Moon (Capricorn 24°23', Movable -> start Cap 10, div 7 -> Leo): House 9 from D9 Lagna.
      - Mars (Cancer 11°25', Movable -> start Can 4, div 3 -> Libra): House 11 from D9 Lagna.
      - Mercury (Libra 11°13', Movable -> start Lib 7, div 3 -> Capricorn): House 2 from D9 Lagna.
      - Jupiter (Libra 23°55', Movable -> start Lib 7, div 7 -> Taurus): House 6 from D9 Lagna.
      - Venus (Libra 24°13', Movable -> start Lib 7, div 7 -> Taurus): House 6 from D9 Lagna.
      - Saturn (Aquarius 12°29', Fixed -> start Lib 7, div 3 -> Capricorn): House 2 from D9 Lagna.
      - Rahu (Libra 21°17', Movable -> start Lib 7, div 6 -> Aries): House 5 from D9 Lagna.
      - Ketu (Aries 21°17', Movable -> start Ari 1, div 6 -> Libra): House 11 from D9 Lagna.
    """
    div_charts = DivisionalService.calculate_divisional_charts(
        date_of_birth=date(1994, 10, 14),
        time_of_birth=time(6, 45, 0),
        timezone_str="Asia/Kolkata",
        latitude=25.3176,
        longitude=82.9739,
        birth_time_accuracy="exact",
        ayanamsha="lahiri",
    )

    d1 = div_charts.d1
    d9 = div_charts.d9

    # --- D1 Verification ---
    assert d1.chart_type == "D1"
    assert d1.chart_name == "Rashi"
    assert d1.ascendant.sign_name == "Libra"
    assert len(d1.houses) == 12
    assert len(d1.planetary_placements) == 9

    # --- D9 Ascendant Verification ---
    assert d9.chart_type == "D9"
    assert d9.chart_name == "Navamsa"
    assert d9.ascendant.sign_name == "Sagittarius"
    assert d9.ascendant.sign_sanskrit == "Dhanu"
    assert d9.ascendant.sign_number == 9
    assert d9.ascendant.navamsa_number == 3
    assert d9.ascendant.d1_sign_name == "Libra"

    # --- D9 Houses Verification ---
    assert len(d9.houses) == 12
    # House 1 of D9 is Sagittarius (lord: Jupiter)
    assert d9.houses[0].house_number == 1
    assert d9.houses[0].sign_name == "Sagittarius"
    assert d9.houses[0].house_lord == "Jupiter"
    assert d9.houses[0].is_ascendant_house is True

    # House 2 of D9 is Capricorn (lord: Saturn)
    assert d9.houses[1].house_number == 2
    assert d9.houses[1].sign_name == "Capricorn"
    assert d9.houses[1].house_lord == "Saturn"

    # --- D9 Planetary Placements Verification ---
    d9_planets = {p.planet_id: p for p in d9.planetary_placements}

    # Sun in Virgo (Sign 6), D9 House 10
    assert d9_planets["sun"].sign_name == "Virgo"
    assert d9_planets["sun"].house_number == 10
    assert d9_planets["sun"].d1_sign_name == "Virgo"  # Vargottama

    # Moon in Leo (Sign 5), D9 House 9
    assert d9_planets["moon"].sign_name == "Leo"
    assert d9_planets["moon"].house_number == 9

    # Mars in Libra (Sign 7), D9 House 11
    assert d9_planets["mars"].sign_name == "Libra"
    assert d9_planets["mars"].house_number == 11

    # Mercury in Capricorn (Sign 10), D9 House 2
    assert d9_planets["mercury"].sign_name == "Capricorn"
    assert d9_planets["mercury"].house_number == 2

    # Jupiter in Taurus (Sign 2), D9 House 6
    assert d9_planets["jupiter"].sign_name == "Taurus"
    assert d9_planets["jupiter"].house_number == 6

    # Venus in Taurus (Sign 2), D9 House 6
    assert d9_planets["venus"].sign_name == "Taurus"
    assert d9_planets["venus"].house_number == 6

    # Saturn in Capricorn (Sign 10), D9 House 2
    assert d9_planets["saturn"].sign_name == "Capricorn"
    assert d9_planets["saturn"].house_number == 2

    # Rahu in Aries (Sign 1), D9 House 5
    assert d9_planets["rahu"].sign_name == "Aries"
    assert d9_planets["rahu"].house_number == 5

    # Ketu in Libra (Sign 7), D9 House 11
    assert d9_planets["ketu"].sign_name == "Libra"
    assert d9_planets["ketu"].house_number == 11

    # --- Mathematical Symmetry: Rahu & Ketu exactly 180° opposite in D9 ---
    assert (d9_planets["ketu"].sign_number - d9_planets["rahu"].sign_number) % 12 == 6

    # --- Verify House Occupants in D9 Houses ---
    d9_houses_by_num = {h.house_number: h for h in d9.houses}
    h2_planets = [p.planet_id for p in d9_houses_by_num[2].planets]
    assert "mercury" in h2_planets
    assert "saturn" in h2_planets

    h6_planets = [p.planet_id for p in d9_houses_by_num[6].planets]
    assert "jupiter" in h6_planets
    assert "venus" in h6_planets


# ==============================================================================
# 4. REST API Integration Endpoints Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_d1_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/astrology/birth-profiles/{profile_id}/d1."""
    headers = await create_auth_user(async_client, "api_d1_tester@veda.ai")

    profile_payload = {
        "profile_name": "Natal D1 Profile",
        "full_name": "Natal Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_time_accuracy": "exact",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
        "ayanamsha": "lahiri",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    assert create_res.status_code == 201
    profile_id = create_res.json()["id"]

    res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/d1", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["chart_type"] == "D1"
    assert data["chart_name"] == "Rashi"
    assert data["ascendant"]["sign_name"] == "Libra"
    assert len(data["houses"]) == 12
    assert len(data["planetary_placements"]) == 9


@pytest.mark.asyncio
async def test_d9_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/astrology/birth-profiles/{profile_id}/d9."""
    headers = await create_auth_user(async_client, "api_d9_tester@veda.ai")

    profile_payload = {
        "profile_name": "Navamsa D9 Profile",
        "full_name": "Navamsa Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_time_accuracy": "exact",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
        "ayanamsha": "lahiri",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    profile_id = create_res.json()["id"]

    res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/d9", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["chart_type"] == "D9"
    assert data["chart_name"] == "Navamsa"
    assert data["ascendant"]["sign_name"] == "Sagittarius"
    assert data["houses"][0]["sign_name"] == "Sagittarius"
    assert len(data["houses"]) == 12
    assert len(data["planetary_placements"]) == 9

    # Query param overrides
    res_raman = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/d9?ayanamsha=raman&node_type=mean",
        headers=headers,
    )
    assert res_raman.status_code == 200
    assert res_raman.json()["metadata"]["ayanamsha"] == "raman"
    assert res_raman.json()["metadata"]["node_type"] == "mean"


@pytest.mark.asyncio
async def test_divisional_charts_combined_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/astrology/birth-profiles/{profile_id}/divisional-charts returns both D1 and D9."""
    headers = await create_auth_user(async_client, "api_div_tester@veda.ai")

    profile_payload = {
        "profile_name": "Divisional Profile",
        "full_name": "Divisional Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    profile_id = create_res.json()["id"]

    res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/divisional-charts",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "d1" in data
    assert "d9" in data
    assert data["d1"]["chart_type"] == "D1"
    assert data["d9"]["chart_type"] == "D9"
    assert data["d1"]["ascendant"]["sign_name"] == "Libra"
    assert data["d9"]["ascendant"]["sign_name"] == "Sagittarius"


@pytest.mark.asyncio
async def test_ownership_isolation_on_divisional_endpoints(async_client: AsyncClient):
    """Verify unauthorized users receive 404 when querying another user's D1/D9 charts."""
    headers_a = await create_auth_user(async_client, "user_a_div@veda.ai")
    headers_b = await create_auth_user(async_client, "user_b_div@veda.ai")

    profile_payload = {
        "profile_name": "Private User A Chart",
        "full_name": "Private User A",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_place": "Varanasi, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers_a)
    profile_id = create_res.json()["id"]

    # User B attempts to access User A's D1 -> 404
    res_d1 = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/d1", headers=headers_b)
    assert res_d1.status_code == 404
    assert res_d1.json()["error_code"] == "RESOURCE_NOT_FOUND"

    # User B attempts to access User A's D9 -> 404
    res_d9 = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/d9", headers=headers_b)
    assert res_d9.status_code == 404
    assert res_d9.json()["error_code"] == "RESOURCE_NOT_FOUND"

    # User B attempts to access User A's divisional-charts -> 404
    res_div = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/divisional-charts",
        headers=headers_b,
    )
    assert res_div.status_code == 404
    assert res_div.json()["error_code"] == "RESOURCE_NOT_FOUND"


@pytest.mark.asyncio
async def test_unknown_birth_time_rejected_by_divisional_endpoints(async_client: AsyncClient):
    """Verify profiles with unknown birth time are rejected with 422."""
    headers = await create_auth_user(async_client, "unknown_div@veda.ai")

    profile_payload = {
        "profile_name": "Unknown TOB Div",
        "full_name": "Unknown TOB Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": None,
        "birth_time_accuracy": "unknown",
        "birth_place": "Varanasi, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    profile_id = create_res.json()["id"]

    res = await async_client.get(f"/api/v1/astrology/birth-profiles/{profile_id}/d9", headers=headers)
    assert res.status_code == 422
    assert res.json()["error_code"] == "UNKNOWN_BIRTH_TIME"


@pytest.mark.asyncio
async def test_unauthenticated_requests_blocked(async_client: AsyncClient):
    """Verify unauthenticated requests return 401."""
    random_id = uuid.uuid4()
    for endpoint in ("d1", "d9", "divisional-charts"):
        res = await async_client.get(f"/api/v1/astrology/birth-profiles/{random_id}/{endpoint}")
        assert res.status_code == 401

