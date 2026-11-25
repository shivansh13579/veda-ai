from datetime import date, datetime, time, timedelta, timezone
import math
import uuid
import pytest
from httpx import AsyncClient

from app.astrology.constants import (
    DEFAULT_DASHA_YEAR_DAYS,
    NAKSHATRA_SPAN_DEGREES,
    NAKSHATRAS,
    TOTAL_VIMSHOTTARI_YEARS,
    VIMSHOTTARI_DURATIONS,
    VIMSHOTTARI_LORDS,
)
from app.astrology.exceptions import UnknownBirthTimeError
from app.astrology.schemas.dasha import VimshottariDashaResponse
from app.astrology.services.vimshottari_dasha_service import VimshottariDashaService
from app.astrology.utils.dasha_utils import (
    build_vimshottari_timeline,
    calculate_dasha_balance,
    format_duration_ymd,
    get_antardasha_sequence,
    get_pratyantardasha_sequence,
)
from app.astrology.utils.nakshatra_utils import calculate_nakshatra


async def create_auth_user(async_client: AsyncClient, email: str = "dasha_tester@veda.ai"):
    """Helper to register, login, and obtain authorization headers."""
    reg = {
        "full_name": "Dasha Tester",
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
# 1. Mahadasha Durations & 120-Year Cycle Tests
# ==============================================================================
def test_all_nine_mahadasha_durations():
    """Verify all 9 planetary Mahadashas match classical Parashari durations."""
    expected = {
        "Ketu": 7.0,
        "Venus": 20.0,
        "Sun": 6.0,
        "Moon": 10.0,
        "Mars": 7.0,
        "Rahu": 18.0,
        "Jupiter": 16.0,
        "Saturn": 19.0,
        "Mercury": 17.0,
    }
    for planet, dur in expected.items():
        assert VIMSHOTTARI_DURATIONS[planet] == dur


def test_total_vimshottari_cycle_duration():
    """Verify sum of all 9 Mahadasha durations strictly equals 120 solar years."""
    total = sum(VIMSHOTTARI_DURATIONS.values())
    assert total == 120.0
    assert TOTAL_VIMSHOTTARI_YEARS == 120.0


# ==============================================================================
# 2. Nakshatra to Starting Mahadasha Lord Mapping Tests
# ==============================================================================
def test_all_27_nakshatras_mapping_to_lords():
    """Verify each of the 27 Nakshatras maps to the exact classical starting Mahadasha lord."""
    expected_cycle = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
    ]
    for i in range(27):
        expected_lord = expected_cycle[i % 9]
        # Midpoint of Nakshatra
        deg = (i * (40.0 / 3.0)) + 6.666667
        res = calculate_nakshatra(deg)
        assert res.lord_name == expected_lord, f"Nakshatra {NAKSHATRAS[i]} expected {expected_lord}, got {res.lord_name}"
        assert res.number == i + 1


# ==============================================================================
# 3. Birth Mahadasha Balance Boundary Tests
# ==============================================================================
def test_birth_balance_start_of_nakshatra():
    """When Moon is at the exact beginning (0 arcmin elapsed), balance equals 100% of lord's duration."""
    # Start of Ashwini (Ketu, 7 years) at 0.0°
    res = calculate_dasha_balance(0.0)
    assert res.planet == "Ketu"
    assert res.duration_years == 7.0
    assert res.elapsed_years == 0.0
    assert res.balance_years == 7.0
    assert res.elapsed_fraction == 0.0
    assert res.remaining_fraction == 1.0
    assert res.balance_percentage == 100.0


def test_birth_balance_end_of_nakshatra():
    """When Moon is near the very end of Nakshatra (799.99 arcmin), balance approaches 0."""
    # Near end of Ashwini: 13° 19' 59" = 13.3330°
    deg = 13.3330
    res = calculate_dasha_balance(deg)
    assert res.planet == "Ketu"
    assert res.balance_years < 0.01
    assert res.elapsed_percentage > 99.9


def test_birth_balance_midpoint_of_nakshatra():
    """When Moon is at exact midpoint (400 arcmin), balance equals exactly 50% of lord's duration."""
    # Midpoint of Ashwini (13° 20' / 2 = 6° 40' = 6.666666666666667°)
    deg_ashwini_mid = 40.0 / 6.0  # 6.666666666666667°
    res_ashwini = calculate_dasha_balance(deg_ashwini_mid)
    assert res_ashwini.planet == "Ketu"
    assert math.isclose(res_ashwini.balance_years, 3.5, abs_tol=1e-4)
    assert math.isclose(res_ashwini.elapsed_years, 3.5, abs_tol=1e-4)
    assert math.isclose(res_ashwini.balance_percentage, 50.0, abs_tol=1e-2)

    # Midpoint of Rohini (Nakshatra 4, Moon lord = 10 years duration)
    # Rohini starts at 3 * 13°20' = 40°00', midpoint is 46° 40' = 46.6666667°
    deg_rohini_mid = 40.0 + (40.0 / 6.0)
    res_rohini = calculate_dasha_balance(deg_rohini_mid)
    assert res_rohini.planet == "Moon"
    assert res_rohini.duration_years == 10.0
    assert math.isclose(res_rohini.balance_years, 5.0, abs_tol=1e-4)
    assert math.isclose(res_rohini.elapsed_years, 5.0, abs_tol=1e-4)


# ==============================================================================
# 4. Antardasha & Pratyantardasha Sequence and Duration Formula Tests
# ==============================================================================
def test_antardasha_sequence_and_duration_formula():
    """Verify that Antardashas follow the cyclic sequence and sum strictly to Mahadasha duration."""
    for md_lord in VIMSHOTTARI_LORDS:
        md_dur = VIMSHOTTARI_DURATIONS[md_lord]
        seq = get_antardasha_sequence(md_lord)
        assert len(seq) == 9
        # First Antardasha must be the Mahadasha lord itself
        assert seq[0][0] == md_lord

        total_ad_dur = sum(dur for _, dur in seq)
        assert math.isclose(total_ad_dur, md_dur, abs_tol=1e-9)

        # Formula check: AD duration = (MD duration * AD lord duration) / 120
        for ad_lord, ad_dur in seq:
            expected_ad_dur = (md_dur * VIMSHOTTARI_DURATIONS[ad_lord]) / 120.0
            assert math.isclose(ad_dur, expected_ad_dur, abs_tol=1e-9)


def test_pratyantardasha_sequence_and_duration_formula():
    """Verify that Pratyantardashas start with Antardasha lord and sum strictly to Antardasha duration."""
    for md_lord in ("Ketu", "Sun", "Jupiter"):
        antardashas = get_antardasha_sequence(md_lord)
        for ad_lord, ad_dur in antardashas:
            p_seq = get_pratyantardasha_sequence(md_lord, ad_lord)
            assert len(p_seq) == 9
            # First Pratyantardasha must be the Antardasha lord itself
            assert p_seq[0][0] == ad_lord

            total_pd_dur = sum(dur for _, dur in p_seq)
            assert math.isclose(total_pd_dur, ad_dur, abs_tol=1e-9)

            # Formula check: PD duration = (AD duration * PD lord duration) / 120
            for pd_lord, pd_dur in p_seq:
                expected_pd = (ad_dur * VIMSHOTTARI_DURATIONS[pd_lord]) / 120.0
                assert math.isclose(pd_dur, expected_pd, abs_tol=1e-9)


# ==============================================================================
# 5. Timeline Continuity: Zero Gaps & Zero Overlaps
# ==============================================================================
def test_timeline_consecutive_continuity():
    """Verify consecutive periods have identical end and start timestamps (zero gaps, zero overlaps)."""
    birth_dt = datetime(1995, 10, 24, 9, 0, 0, tzinfo=timezone.utc)
    moon_lon = 195.5  # Chitra/Swati (Libra)
    as_of = datetime(2025, 5, 1, 12, 0, 0, tzinfo=timezone.utc)

    timeline, cur_md, cur_ad, cur_pd = build_vimshottari_timeline(
        birth_dt_utc=birth_dt,
        moon_longitude=moon_lon,
        as_of_utc=as_of,
        level="pratyantardasha",
        days_per_year=365.25,
    )

    assert len(timeline) == 9

    # Check Mahadashas continuity
    for i in range(len(timeline) - 1):
        assert timeline[i]["end_date"] == timeline[i + 1]["start_date"], (
            f"Gap or overlap between MD {timeline[i]['planet']} and {timeline[i+1]['planet']}"
        )

    # Check Antardashas and Pratyantardashas continuity
    for md in timeline:
        ad_list = md["antardashas"]
        assert len(ad_list) == 9
        assert ad_list[0]["start_date"] == md["start_date"]
        assert ad_list[-1]["end_date"] == md["end_date"]

        for j in range(len(ad_list) - 1):
            assert ad_list[j]["end_date"] == ad_list[j + 1]["start_date"]

        for ad in ad_list:
            pd_list = ad["pratyantardashas"]
            assert len(pd_list) == 9
            assert pd_list[0]["start_date"] == ad["start_date"]
            assert pd_list[-1]["end_date"] == ad["end_date"]

            for k in range(len(pd_list) - 1):
                assert pd_list[k]["end_date"] == pd_list[k + 1]["start_date"]


# ==============================================================================
# 6. Current Dasha and Transition Boundary Tests
# ==============================================================================
def test_current_dasha_selection_and_transition_boundary():
    """Verify exact transition boundary behavior (start <= as_of < end)."""
    birth_dt = datetime(2000, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    moon_lon = 0.0  # Start of Ashwini (Ketu)
    as_of = birth_dt

    timeline, cur_md, cur_ad, cur_pd = build_vimshottari_timeline(
        birth_dt_utc=birth_dt,
        moon_longitude=moon_lon,
        as_of_utc=as_of,
        level="pratyantardasha",
    )

    # At birth (instant 0.0), active MD is Ketu, AD is Ketu, PD is Ketu
    assert cur_md["planet"] == "Ketu"
    assert cur_ad["planet"] == "Ketu"
    assert cur_pd["planet"] == "Ketu"
    assert cur_md["start_date"] == birth_dt

    # Test boundary instant: Set as_of exactly to Ketu MD end_date
    ketu_end = timeline[0]["end_date"]
    timeline2, cur_md2, cur_ad2, cur_pd2 = build_vimshottari_timeline(
        birth_dt_utc=birth_dt,
        moon_longitude=moon_lon,
        as_of_utc=ketu_end,
        level="pratyantardasha",
    )
    # At exact boundary, Venus MD should be active (start <= as_of < end)
    assert cur_md2["planet"] == "Venus"
    assert cur_md2["start_date"] == ketu_end


def test_format_duration_ymd():
    """Verify human-readable year, month, day formatter."""
    assert format_duration_ymd(0.0) == "0 years, 0 months, 0 days"
    assert format_duration_ymd(1.0) == "1 years, 0 months, 0 days"
    assert format_duration_ymd(2.5) == "2 years, 6 months, 0 days"


# ==============================================================================
# 7. Birth Profile Service and API Integration Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_api_vimshottari_dasha_complete(async_client: AsyncClient):
    """Test full GET /api/v1/astrology/birth-profiles/{id}/vimshottari-dasha endpoint."""
    headers = await create_auth_user(async_client, "dasha_api_user@veda.ai")

    # Create birth profile
    profile_data = {
        "profile_name": "Varanasi Native",
        "full_name": "Aditya Sharma",
        "date_of_birth": "1995-10-24",
        "time_of_birth": "14:30:00",
        "birth_time_accuracy": "exact",
        "birth_place": "Varanasi, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
        "ayanamsha": "lahiri",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    assert resp.status_code == 201
    profile_id = resp.json()["id"]

    # Call Vimshottari Dasha API
    dasha_resp = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha",
        headers=headers,
    )
    assert dasha_resp.status_code == 200
    data = dasha_resp.json()

    # Validate top-level keys
    assert data["birth_profile_id"] == profile_id
    assert "moon_sidereal_longitude" in data
    assert "birth_nakshatra" in data
    assert "nakshatra_pada" in data
    assert "birth_mahadasha" in data
    assert "birth_mahadasha_balance" in data
    assert "current_mahadasha" in data
    assert "current_antardasha" in data
    assert "current_pratyantardasha" in data
    assert "timeline" in data

    # Verify calculation settings
    settings = data["calculation_settings"]
    assert settings["astrology_system"] == "vedic"
    assert settings["zodiac_type"] == "sidereal"
    assert settings["ayanamsha"] == "lahiri"
    assert settings["dasha_cycle_years"] == 120.0
    assert settings["year_length_days"] == 365.25

    # Verify balance
    balance = data["birth_mahadasha_balance"]
    assert balance["planet"] == data["birth_mahadasha"]
    assert balance["balance_years"] > 0
    assert balance["elapsed_years"] >= 0
    assert balance["balance_percentage"] + balance["elapsed_percentage"] == pytest.approx(100.0, abs=0.1)

    # Verify timeline length
    assert len(data["timeline"]) == 9
    first_md = data["timeline"][0]
    assert first_md["planet"] == data["birth_mahadasha"]
    assert len(first_md["antardashas"]) == 9
    first_ad = first_md["antardashas"][0]
    assert len(first_ad["pratyantardashas"]) == 9


@pytest.mark.asyncio
async def test_api_vimshottari_dasha_hierarchy_levels(async_client: AsyncClient):
    """Test 'level' query parameter for mahadasha, antardasha, and pratyantardasha hierarchy."""
    headers = await create_auth_user(async_client, "dasha_levels_user@veda.ai")

    profile_data = {
        "profile_name": "Level Profile",
        "full_name": "Level Native",
        "date_of_birth": "1990-05-15",
        "time_of_birth": "06:00:00",
        "birth_time_accuracy": "exact",
        "birth_place": "Delhi, India",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    assert resp.status_code == 201
    profile_id = resp.json()["id"]

    # 1. Level = mahadasha (antardashas omitted)
    r1 = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?level=mahadasha",
        headers=headers,
    )
    assert r1.status_code == 200
    assert r1.json()["timeline"][0]["antardashas"] is None

    # 2. Level = antardasha (antardashas present, pratyantardashas omitted)
    r2 = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?level=antardasha",
        headers=headers,
    )
    assert r2.status_code == 200
    assert r2.json()["timeline"][0]["antardashas"] is not None
    assert r2.json()["timeline"][0]["antardashas"][0]["pratyantardashas"] is None

    # 3. include_timeline = false (empty timeline array)
    r3 = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?include_timeline=false",
        headers=headers,
    )
    assert r3.status_code == 200
    assert len(r3.json()["timeline"]) == 0
    assert r3.json()["current_mahadasha"]["planet"] is not None


@pytest.mark.asyncio
async def test_api_vimshottari_dasha_savana_year(async_client: AsyncClient):
    """Test year_length=360.0 (Classical Savana year)."""
    headers = await create_auth_user(async_client, "dasha_savana_user@veda.ai")

    profile_data = {
        "profile_name": "Savana Profile",
        "full_name": "Savana Native",
        "date_of_birth": "1998-08-10",
        "time_of_birth": "12:00:00",
        "birth_place": "Mumbai, India",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    assert resp.status_code == 201
    profile_id = resp.json()["id"]

    r = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?year_length=360.0",
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["calculation_settings"]["year_length_days"] == 360.0


# ==============================================================================
# 8. Unknown Birth Time and Multi-Tenant Isolation Tests
# ==============================================================================
@pytest.mark.asyncio
async def test_api_unknown_birth_time_rejected(async_client: AsyncClient):
    """Profiles with unknown birth time must be rejected with 422 UNKNOWN_BIRTH_TIME."""
    headers = await create_auth_user(async_client, "dasha_unknown_time_user@veda.ai")

    profile_data = {
        "profile_name": "Unknown Time Profile",
        "full_name": "Unknown Native",
        "date_of_birth": "1992-03-25",
        "time_of_birth": None,
        "birth_time_accuracy": "unknown",
        "birth_place": "Jaipur, India",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    assert resp.status_code == 201
    profile_id = resp.json()["id"]

    r = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha",
        headers=headers,
    )
    assert r.status_code == 422
    assert r.json()["error_code"] == "UNKNOWN_BIRTH_TIME"


@pytest.mark.asyncio
async def test_api_multi_tenant_isolation(async_client: AsyncClient):
    """Users cannot access another user's birth profile Vimshottari Dasha (404 Not Found)."""
    headers_a = await create_auth_user(async_client, "user_a_dasha@veda.ai")
    headers_b = await create_auth_user(async_client, "user_b_dasha@veda.ai")

    # Create profile as User A
    profile_data = {
        "profile_name": "User A Private",
        "full_name": "User A",
        "date_of_birth": "1988-11-12",
        "time_of_birth": "18:45:00",
        "birth_place": "Kolkata, India",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers_a)
    assert resp.status_code == 201
    profile_id = resp.json()["id"]

    # User B attempts to access User A's profile
    r = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha",
        headers=headers_b,
    )
    assert r.status_code == 404
    assert r.json()["error_code"] == "RESOURCE_NOT_FOUND"


@pytest.mark.asyncio
async def test_timezone_normalization_impact(async_client: AsyncClient):
    """Verify that different timezones for identical local wall clock time result in appropriate UTC offset and Moon progression."""
    headers = await create_auth_user(async_client, "tz_dasha_user@veda.ai")

    # Profile in Tokyo (UTC+9)
    p_tokyo = {
        "profile_name": "Tokyo Native",
        "full_name": "Kenji Sato",
        "date_of_birth": "2000-01-01",
        "time_of_birth": "12:00:00",
        "birth_place": "Tokyo, Japan",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "timezone": "Asia/Tokyo",
    }
    res_tokyo = await async_client.post("/api/v1/birth-profiles", json=p_tokyo, headers=headers)
    tokyo_id = res_tokyo.json()["id"]

    # Profile in New York (UTC-5 in winter = 14 hours after Tokyo)
    p_ny = {
        "profile_name": "NY Native",
        "full_name": "John Doe",
        "date_of_birth": "2000-01-01",
        "time_of_birth": "12:00:00",
        "birth_place": "New York, USA",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York",
    }
    res_ny = await async_client.post("/api/v1/birth-profiles", json=p_ny, headers=headers)
    ny_id = res_ny.json()["id"]

    d_tokyo = await async_client.get(f"/api/v1/astrology/birth-profiles/{tokyo_id}/vimshottari-dasha", headers=headers)
    d_ny = await async_client.get(f"/api/v1/astrology/birth-profiles/{ny_id}/vimshottari-dasha", headers=headers)

    assert d_tokyo.status_code == 200
    assert d_ny.status_code == 200

    # Because NY is 14 hours later in UTC, the Moon moves ~7.7 degrees forward in the zodiac
    lon_tokyo = d_tokyo.json()["moon_sidereal_longitude"]
    lon_ny = d_ny.json()["moon_sidereal_longitude"]
    diff = (lon_ny - lon_tokyo) % 360.0
    assert 6.0 <= diff <= 9.0  # Moon travels approx 0.55° per hour * 14h ≈ 7.7°


@pytest.mark.asyncio
async def test_invalid_year_length_parameter(async_client: AsyncClient):
    """Non-positive year_length values must be rejected."""
    headers = await create_auth_user(async_client, "invalid_param_user@veda.ai")
    profile_data = {
        "profile_name": "Valid Profile",
        "full_name": "Valid Native",
        "date_of_birth": "1995-05-10",
        "time_of_birth": "10:00:00",
        "birth_place": "Mumbai, India",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    profile_id = resp.json()["id"]

    r = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?year_length=-10",
        headers=headers,
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_out_of_range_dates_advisory_and_null_active_periods(async_client: AsyncClient):
    """Dates prior to timeline T0 or after T0 + 120y return null active periods with clear advisory."""
    headers = await create_auth_user(async_client, "out_of_range_dasha_user@veda.ai")
    profile_data = {
        "profile_name": "Centenarian Profile",
        "full_name": "Long Lived Native",
        "date_of_birth": "1995-10-24",
        "time_of_birth": "14:30:00",
        "birth_place": "Varanasi, India",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "timezone": "Asia/Kolkata",
    }
    resp = await async_client.post("/api/v1/birth-profiles", json=profile_data, headers=headers)
    profile_id = resp.json()["id"]

    # 1. Historical date before T0 (e.g. year 1950)
    r_past = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?as_of=1950-01-01T00:00:00Z",
        headers=headers,
    )
    assert r_past.status_code == 200
    data_past = r_past.json()
    assert data_past["current_mahadasha"] is None
    assert data_past["current_antardasha"] is None
    assert data_past["current_pratyantardasha"] is None
    assert data_past["out_of_range_advisory"] is not None
    assert "prior to the mathematical start" in data_past["out_of_range_advisory"]
    # Verify no period in timeline is marked current
    assert all(md["is_current"] is False for md in data_past["timeline"])

    # 2. Future date beyond 120-year cycle (e.g. year 2150)
    r_future = await async_client.get(
        f"/api/v1/astrology/birth-profiles/{profile_id}/vimshottari-dasha?as_of=2150-01-01T00:00:00Z",
        headers=headers,
    )
    assert r_future.status_code == 200
    data_future = r_future.json()
    assert data_future["current_mahadasha"] is None
    assert data_future["current_antardasha"] is None
    assert data_future["current_pratyantardasha"] is None
    assert data_future["out_of_range_advisory"] is not None
    assert "beyond the 120-year Vimshottari cycle" in data_future["out_of_range_advisory"]
    assert all(md["is_current"] is False for md in data_future["timeline"])
