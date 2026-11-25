from datetime import date, time
import pytest
import uuid
from httpx import AsyncClient

from app.astrology.constants import (
    PlanetaryDignity,
    COMBUSTION_THRESHOLDS,
    EXALTATION_DATA,
    MOOLATRIKONA_RANGES,
    NATURAL_RELATIONSHIPS,
    OWN_SIGNS,
)
from app.astrology.exceptions import (
    UnknownBirthTimeError,
)
from app.astrology.schemas.dignity import (
    PlanetaryDignitiesResponse,
)
from app.astrology.utils.dignity_utils import (
    calculate_angular_separation,
    calculate_dignity,
    check_combustion,
)


async def create_auth_user(async_client: AsyncClient, email: str = "dignity_tester@veda.ai"):
    """Helper to register, login, and obtain authorization headers."""
    reg = {
        "full_name": "Dignity Tester",
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
# 1. Angular Separation and Circle Wrap-Around Tests
# ==============================================================================
def test_angular_separation_basic():
    """Verify standard acute angular distance calculation."""
    assert calculate_angular_separation(10.0, 20.0) == 10.0
    assert calculate_angular_separation(20.0, 10.0) == 10.0
    assert calculate_angular_separation(0.0, 180.0) == 180.0
    assert calculate_angular_separation(50.0, 50.0) == 0.0


def test_angular_separation_wrap_around_0_deg():
    """Verify geodesic distance across the 0° Aries boundary."""
    # 358° Pisces to 2° Aries -> 4° separation
    assert calculate_angular_separation(358.0, 2.0) == 4.0
    assert calculate_angular_separation(2.0, 358.0) == 4.0
    # 350° to 15° -> 25°
    assert calculate_angular_separation(350.0, 15.0) == 25.0
    # 1° to 359° -> 2°
    assert calculate_angular_separation(1.0, 359.0) == 2.0


# ==============================================================================
# 2. Planetary Combustion (Asta) Tests
# ==============================================================================
def test_combustion_non_applicable_bodies():
    """Verify Sun, Rahu, and Ketu are never marked combust."""
    # Sun relative to Sun
    sun_comb = check_combustion("sun", 10.0, 10.0, False)
    assert not sun_comb.is_applicable
    assert not sun_comb.is_combust

    # Rahu
    rahu_comb = check_combustion("rahu", 10.5, 10.0, True)
    assert not rahu_comb.is_applicable
    assert not rahu_comb.is_combust

    # Ketu
    ketu_comb = check_combustion("ketu", 190.0, 10.0, True)
    assert not ketu_comb.is_applicable
    assert not ketu_comb.is_combust


def test_combustion_moon_threshold():
    """Moon threshold is 12°."""
    sun_lon = 100.0
    # Combust at 11.5° separation
    comb = check_combustion("moon", 111.5, sun_lon, False)
    assert comb.is_applicable
    assert comb.is_combust
    assert comb.combustion_threshold == 12.0
    assert comb.angular_separation == pytest.approx(11.5, abs=1e-4)

    # Not combust at 12.5° separation
    not_comb = check_combustion("moon", 112.5, sun_lon, False)
    assert not_comb.is_applicable
    assert not not_comb.is_combust


def test_combustion_mars_threshold():
    """Mars threshold is 17°."""
    sun_lon = 50.0
    # Combust at 16.5° separation
    assert check_combustion("mars", 66.5, sun_lon, False).is_combust
    # Not combust at 17.5° separation
    assert not check_combustion("mars", 67.5, sun_lon, False).is_combust


def test_combustion_jupiter_threshold():
    """Jupiter threshold is 11°."""
    sun_lon = 200.0
    # Combust at 10.5°
    assert check_combustion("jupiter", 210.5, sun_lon, False).is_combust
    # Not combust at 11.5°
    assert not check_combustion("jupiter", 211.5, sun_lon, False).is_combust


def test_combustion_saturn_threshold():
    """Saturn threshold is 15°."""
    sun_lon = 300.0
    # Combust at 14.0°
    assert check_combustion("saturn", 314.0, sun_lon, False).is_combust
    # Not combust at 15.5°
    assert not check_combustion("saturn", 315.5, sun_lon, False).is_combust


def test_combustion_mercury_direct_vs_retrograde():
    """Mercury threshold is 14° when direct, 12° when retrograde."""
    sun_lon = 40.0
    # At 13° separation:
    # Direct (13° < 14°) -> combust
    assert check_combustion("mercury", 53.0, sun_lon, is_retrograde=False).is_combust
    # Retrograde (13° >= 12°) -> NOT combust
    assert not check_combustion("mercury", 53.0, sun_lon, is_retrograde=True).is_combust

    # At 11° separation:
    # Retrograde (11° < 12°) -> combust
    assert check_combustion("mercury", 51.0, sun_lon, is_retrograde=True).is_combust


def test_combustion_venus_direct_vs_retrograde():
    """Venus threshold is 10° when direct, 8° when retrograde."""
    sun_lon = 150.0
    # At 9° separation:
    # Direct (9° < 10°) -> combust
    assert check_combustion("venus", 159.0, sun_lon, is_retrograde=False).is_combust
    # Retrograde (9° >= 8°) -> NOT combust
    assert not check_combustion("venus", 159.0, sun_lon, is_retrograde=True).is_combust

    # At 7° separation:
    # Retrograde (7° < 8°) -> combust
    assert check_combustion("venus", 157.0, sun_lon, is_retrograde=True).is_combust


# ==============================================================================
# 3. Planetary Dignity (Exaltation, Moolatrikona, Own Sign, Debilitation) Tests
# ==============================================================================
def test_all_planets_exaltation_and_param_uccha():
    """Verify deep exaltation (Param Uccha) degrees and sign placement for all Navagrahas."""
    expected_exaltations = {
        "sun": (1, 10.0),       # Aries 10°
        "moon": (2, 3.0),       # Taurus 3°
        "mars": (10, 28.0),     # Capricorn 28°
        "mercury": (6, 15.0),   # Virgo 15°
        "jupiter": (4, 5.0),    # Cancer 5°
        "venus": (12, 27.0),    # Pisces 27°
        "saturn": (7, 20.0),    # Libra 20°
        "rahu": (2, 20.0),      # Taurus 20°
        "ketu": (8, 20.0),      # Scorpio 20°
    }

    for pid, (sign, param_deg) in expected_exaltations.items():
        res = calculate_dignity(pid, sign, param_deg)
        assert res.dignity == PlanetaryDignity.EXALTED
        assert res.sanskrit_dignity == "Uccha"
        assert res.param_degree == param_deg
        assert res.distance_from_param_degree == pytest.approx(0.0, abs=1e-4)


def test_exaltation_distance_from_param_degree():
    """Verify angular distance from Param Uccha when planet is in exaltation sign but not at exact degree."""
    # Sun in Aries at 16.5° -> Param Uccha is 10° -> distance = 6.5°
    res_sun = calculate_dignity("sun", 1, 16.5)
    assert res_sun.dignity == PlanetaryDignity.EXALTED
    assert res_sun.param_degree == 10.0
    assert res_sun.distance_from_param_degree == pytest.approx(6.5, abs=1e-4)

    # Jupiter in Cancer at 2.0° -> Param Uccha is 5° -> distance = 3.0°
    res_jup = calculate_dignity("jupiter", 4, 2.0)
    assert res_jup.dignity == PlanetaryDignity.EXALTED
    assert res_jup.param_degree == 5.0
    assert res_jup.distance_from_param_degree == pytest.approx(3.0, abs=1e-4)


def test_all_planets_debilitation_and_param_neecha():
    """Verify deep debilitation (Param Neecha) degrees (exact 180° opposite)."""
    expected_debilitations = {
        "sun": (7, 10.0),       # Libra 10°
        "moon": (8, 3.0),       # Scorpio 3°
        "mars": (4, 28.0),      # Cancer 28°
        "mercury": (12, 15.0),  # Pisces 15°
        "jupiter": (10, 5.0),   # Capricorn 5°
        "venus": (6, 27.0),     # Virgo 27°
        "saturn": (1, 20.0),    # Aries 20°
        "rahu": (8, 20.0),      # Scorpio 20°
        "ketu": (2, 20.0),      # Taurus 20°
    }

    for pid, (sign, param_deg) in expected_debilitations.items():
        res = calculate_dignity(pid, sign, param_deg)
        assert res.dignity == PlanetaryDignity.DEBILITATED
        assert res.sanskrit_dignity == "Neecha"
        assert res.param_degree == param_deg
        assert res.distance_from_param_degree == pytest.approx(0.0, abs=1e-4)


def test_sun_moolatrikona_vs_own_sign():
    """
    Sun in Leo (Sign 5):
    - 0° to 20° is Moolatrikona
    - 20° to 30° is Own Sign (Swakshetra)
    """
    # 15° Leo -> Moolatrikona
    res_mt = calculate_dignity("sun", 5, 15.0)
    assert res_mt.dignity == PlanetaryDignity.MOOLATRIKONA
    assert res_mt.sanskrit_dignity == "Moolatrikona"

    # 25° Leo -> Own Sign
    res_own = calculate_dignity("sun", 5, 25.0)
    assert res_own.dignity == PlanetaryDignity.OWN_SIGN
    assert res_own.sanskrit_dignity == "Swakshetra"


def test_moon_exaltation_moolatrikona_and_own_sign():
    """
    Moon:
    - Taurus 0° to 3° is Exalted (Param Uccha 3°)
    - Taurus 3° to 30° is Moolatrikona
    - Cancer 0° to 30° is Own Sign
    """
    # Taurus 2° -> Exalted
    res_ex = calculate_dignity("moon", 2, 2.0)
    assert res_ex.dignity == PlanetaryDignity.EXALTED

    # Taurus 10° -> Moolatrikona
    res_mt = calculate_dignity("moon", 2, 10.0)
    assert res_mt.dignity == PlanetaryDignity.MOOLATRIKONA

    # Cancer 15° -> Own Sign
    res_own = calculate_dignity("moon", 4, 15.0)
    assert res_own.dignity == PlanetaryDignity.OWN_SIGN


def test_mars_moolatrikona_vs_own_sign():
    """
    Mars:
    - Aries 0° to 12° is Moolatrikona
    - Aries 12° to 30° is Own Sign
    - Scorpio 0° to 30° is Own Sign
    """
    # Aries 8° -> Moolatrikona
    assert calculate_dignity("mars", 1, 8.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Aries 18° -> Own Sign
    assert calculate_dignity("mars", 1, 18.0).dignity == PlanetaryDignity.OWN_SIGN
    # Scorpio 10° -> Own Sign
    assert calculate_dignity("mars", 8, 10.0).dignity == PlanetaryDignity.OWN_SIGN


def test_mercury_exaltation_moolatrikona_own_sign():
    """
    Mercury in Virgo (Sign 6):
    - 0° to 15° is Exalted (Param Uccha at 15°)
    - 15° to 20° is Moolatrikona
    - 20° to 30° is Own Sign
    Gemini (Sign 3) is Own Sign across all degrees.
    """
    # Virgo 10° -> Exalted
    assert calculate_dignity("mercury", 6, 10.0).dignity == PlanetaryDignity.EXALTED
    # Virgo 17° -> Moolatrikona
    assert calculate_dignity("mercury", 6, 17.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Virgo 25° -> Own Sign
    assert calculate_dignity("mercury", 6, 25.0).dignity == PlanetaryDignity.OWN_SIGN
    # Gemini 12° -> Own Sign
    assert calculate_dignity("mercury", 3, 12.0).dignity == PlanetaryDignity.OWN_SIGN


def test_jupiter_moolatrikona_vs_own_sign():
    """
    Jupiter:
    - Sagittarius 0° to 10° is Moolatrikona
    - Sagittarius 10° to 30° is Own Sign
    - Pisces 0° to 30° is Own Sign
    """
    # Sagittarius 5° -> Moolatrikona
    assert calculate_dignity("jupiter", 9, 5.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Sagittarius 15° -> Own Sign
    assert calculate_dignity("jupiter", 9, 15.0).dignity == PlanetaryDignity.OWN_SIGN
    # Pisces 20° -> Own Sign
    assert calculate_dignity("jupiter", 12, 20.0).dignity == PlanetaryDignity.OWN_SIGN


def test_venus_moolatrikona_vs_own_sign():
    """
    Venus:
    - Libra 0° to 15° is Moolatrikona
    - Libra 15° to 30° is Own Sign
    - Taurus 0° to 30° is Own Sign
    """
    # Libra 10° -> Moolatrikona
    assert calculate_dignity("venus", 7, 10.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Libra 20° -> Own Sign
    assert calculate_dignity("venus", 7, 20.0).dignity == PlanetaryDignity.OWN_SIGN
    # Taurus 14° -> Own Sign
    assert calculate_dignity("venus", 2, 14.0).dignity == PlanetaryDignity.OWN_SIGN


def test_saturn_moolatrikona_vs_own_sign():
    """
    Saturn:
    - Aquarius 0° to 20° is Moolatrikona
    - Aquarius 20° to 30° is Own Sign
    - Capricorn 0° to 30° is Own Sign
    """
    # Aquarius 12° -> Moolatrikona
    assert calculate_dignity("saturn", 11, 12.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Aquarius 24° -> Own Sign
    assert calculate_dignity("saturn", 11, 24.0).dignity == PlanetaryDignity.OWN_SIGN
    # Capricorn 8° -> Own Sign
    assert calculate_dignity("saturn", 10, 8.0).dignity == PlanetaryDignity.OWN_SIGN


def test_rahu_ketu_moolatrikona_and_own_signs():
    """
    Rahu:
    - Gemini is MT
    - Aquarius is Own Sign
    Ketu:
    - Sagittarius is MT
    - Scorpio is Exalted (precedence over own sign)
    """
    # Rahu in Gemini -> MT
    assert calculate_dignity("rahu", 3, 10.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Rahu in Aquarius -> Own sign
    assert calculate_dignity("rahu", 11, 10.0).dignity == PlanetaryDignity.OWN_SIGN

    # Ketu in Sagittarius -> MT
    assert calculate_dignity("ketu", 9, 10.0).dignity == PlanetaryDignity.MOOLATRIKONA
    # Ketu in Scorpio -> Exalted
    assert calculate_dignity("ketu", 8, 10.0).dignity == PlanetaryDignity.EXALTED


# ==============================================================================
# 4. Natural Relationships (BPHS Naisargika Sambandha) Tests
# ==============================================================================
def test_natural_relationships_friendly_neutral_enemy():
    """Verify BPHS classical relationship classifications when not in exaltation/MT/own/debilitation."""
    # Sun in Sagittarius (Sign 9, Lord Jupiter -> Friend) -> friendly_sign
    res_friend = calculate_dignity("sun", 9, 15.0)
    assert res_friend.dignity == PlanetaryDignity.FRIENDLY_SIGN
    assert res_friend.sanskrit_dignity == "Mitra Kshetra"

    # Sun in Gemini (Sign 3, Lord Mercury -> Neutral) -> neutral_sign
    res_neutral = calculate_dignity("sun", 3, 15.0)
    assert res_neutral.dignity == PlanetaryDignity.NEUTRAL_SIGN
    assert res_neutral.sanskrit_dignity == "Sama Kshetra"

    # Sun in Capricorn (Sign 10, Lord Saturn -> Enemy) -> enemy_sign
    res_enemy = calculate_dignity("sun", 10, 15.0)
    assert res_enemy.dignity == PlanetaryDignity.ENEMY_SIGN
    assert res_enemy.sanskrit_dignity == "Shatru Kshetra"


# ==============================================================================
# 5. API Endpoint Integration Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_get_planetary_dignities_success(async_client: AsyncClient):
    """Verify GET /api/v1/astrology/birth-profiles/{id}/planetary-dignities returns full dignity response."""
    headers = await create_auth_user(async_client, "dignity_api_tester@veda.ai")

    profile_payload = {
        "profile_name": "Dignity Test Native",
        "full_name": "Dignity Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": "06:45:00",
        "birth_place": "Varanasi, Uttar Pradesh, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    assert create_res.status_code == 201
    profile_id = create_res.json()["id"]

    res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()

    assert data["birth_profile_id"] == profile_id
    assert len(data["planets"]) == 9
    assert "metadata" in data
    assert data["metadata"]["ayanamsha"] == "lahiri"
    assert data["metadata"]["node_type"] == "true"

    planet_ids = [p["planet_id"] for p in data["planets"]]
    assert "sun" in planet_ids
    assert "moon" in planet_ids
    assert "mars" in planet_ids
    assert "mercury" in planet_ids
    assert "jupiter" in planet_ids
    assert "venus" in planet_ids
    assert "saturn" in planet_ids
    assert "rahu" in planet_ids
    assert "ketu" in planet_ids

    # Check Sun attributes
    sun = next(p for p in data["planets"] if p["planet_id"] == "sun")
    assert not sun["combustion"]["is_applicable"]
    assert not sun["combustion"]["is_combust"]
    assert sun["sanskrit_name"] == "Surya"
    assert 1 <= sun["sign_number"] <= 12
    assert 0.0 <= sun["degree_in_sign"] < 30.0
    assert sun["dignity"] in [
        "exalted", "moolatrikona", "own_sign", "friendly_sign", "neutral_sign", "enemy_sign", "debilitated"
    ]


@pytest.mark.asyncio
async def test_get_planetary_dignities_with_ayanamsha_override(async_client: AsyncClient):
    """Verify ayanamsha and node_type query overrides are applied."""
    headers = await create_auth_user(async_client, "dignity_override_tester@veda.ai")

    profile_payload = {
        "profile_name": "Override Profile",
        "full_name": "Override Native",
        "date_of_birth": "1990-05-15",
        "time_of_birth": "12:00:00",
        "birth_place": "Delhi, India",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    profile_id = create_res.json()["id"]

    res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities?ayanamsha=raman&node_type=mean",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["metadata"]["ayanamsha"] == "raman"
    assert data["metadata"]["node_type"] == "mean"


@pytest.mark.asyncio
async def test_planetary_dignities_unknown_birth_time_error(async_client: AsyncClient):
    """Verify birth profile with unknown birth time returns 422 with UNKNOWN_BIRTH_TIME."""
    headers = await create_auth_user(async_client, "dignity_unknown_time@veda.ai")

    profile_payload = {
        "profile_name": "Unknown Time Profile",
        "full_name": "Unknown Time Native",
        "date_of_birth": "1994-10-14",
        "time_of_birth": None,
        "birth_time_accuracy": "unknown",
        "birth_place": "Varanasi, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers)
    assert create_res.status_code == 201
    profile_id = create_res.json()["id"]

    res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities",
        headers=headers,
    )
    assert res.status_code == 422
    assert res.json()["error_code"] == "UNKNOWN_BIRTH_TIME"


@pytest.mark.asyncio
async def test_planetary_dignities_tenant_isolation(async_client: AsyncClient):
    """Verify cross-tenant access to another user's birth profile returns 404 RESOURCE_NOT_FOUND."""
    headers_user1 = await create_auth_user(async_client, "user1_dignity@veda.ai")
    headers_user2 = await create_auth_user(async_client, "user2_dignity@veda.ai")

    profile_payload = {
        "profile_name": "User 1 Dignity Profile",
        "full_name": "User 1 Native",
        "date_of_birth": "1995-01-01",
        "time_of_birth": "10:00:00",
        "birth_place": "Mumbai, India",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "timezone": "Asia/Kolkata",
    }
    create_res = await async_client.post("/api/v1/birth-profiles", json=profile_payload, headers=headers_user1)
    profile_id = create_res.json()["id"]

    # User 2 tries to access User 1's profile
    res = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities",
        headers=headers_user2,
    )
    assert res.status_code == 404
    assert res.json()["error_code"] == "RESOURCE_NOT_FOUND"
