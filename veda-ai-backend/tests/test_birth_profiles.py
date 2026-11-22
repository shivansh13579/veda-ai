import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.birth_profile import Ayanamsha, BirthProfile, BirthTimeAccuracy
from app.db.models.user import User


async def create_user_and_auth_headers(
    async_client: AsyncClient,
    email: str = "astronative@veda.ai",
    password: str = "SecurePass123!",
    full_name: str = "Aarav Sharma",
):
    """Helper to register and login a user, returning (auth_headers, user_data)."""
    reg_payload = {
        "full_name": full_name,
        "email": email,
        "password": password,
        "confirm_password": password,
    }
    await async_client.post("/api/v1/auth/register", json=reg_payload)
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    data = login_res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, data["user"]


SAMPLE_PROFILE_PAYLOAD = {
    "profile_name": "My Natal Kundli",
    "full_name": "Aarav Sharma",
    "date_of_birth": "1994-10-14",
    "time_of_birth": "06:45:00",
    "birth_time_accuracy": "exact",
    "birth_place": "Varanasi, Uttar Pradesh, India",
    "latitude": 25.3176,
    "longitude": 82.9739,
    "timezone": "Asia/Kolkata",
    "ayanamsha": "lahiri",
    "is_default": False,
}


# ==============================================================================
# 1. CRUD Operations
# ==============================================================================
@pytest.mark.asyncio
async def test_create_birth_profile_success(async_client: AsyncClient):
    """Verify creating a valid birth profile succeeds and returns correct attributes."""
    headers, user = await create_user_and_auth_headers(async_client, "crud_create@veda.ai")

    res = await async_client.post(
        "/api/v1/birth-profiles",
        json=SAMPLE_PROFILE_PAYLOAD,
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["profile_name"] == "My Natal Kundli"
    assert data["full_name"] == "Aarav Sharma"
    assert data["date_of_birth"] == "1994-10-14"
    assert data["time_of_birth"] == "06:45:00"
    assert data["birth_time_accuracy"] == "exact"
    assert data["birth_place"] == "Varanasi, Uttar Pradesh, India"
    assert float(data["latitude"]) == pytest.approx(25.3176, abs=1e-4)
    assert float(data["longitude"]) == pytest.approx(82.9739, abs=1e-4)
    assert data["timezone"] == "Asia/Kolkata"
    assert data["ayanamsha"] == "lahiri"
    # First profile is automatically promoted to default
    assert data["is_default"] is True
    assert data["user_id"] == user["id"]


@pytest.mark.asyncio
async def test_list_birth_profiles(async_client: AsyncClient):
    """Verify listing birth profiles returns all owned profiles."""
    headers, _ = await create_user_and_auth_headers(async_client, "crud_list@veda.ai")

    # Initially empty
    list_res = await async_client.get("/api/v1/birth-profiles", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 0
    assert list_res.json()["profiles"] == []

    # Create 2 profiles
    p1 = {**SAMPLE_PROFILE_PAYLOAD, "profile_name": "Profile 1"}
    p2 = {**SAMPLE_PROFILE_PAYLOAD, "profile_name": "Profile 2"}
    await async_client.post("/api/v1/birth-profiles", json=p1, headers=headers)
    await async_client.post("/api/v1/birth-profiles", json=p2, headers=headers)

    list_res2 = await async_client.get("/api/v1/birth-profiles", headers=headers)
    assert list_res2.status_code == 200
    assert list_res2.json()["total"] == 2
    profile_names = [p["profile_name"] for p in list_res2.json()["profiles"]]
    assert "Profile 1" in profile_names
    assert "Profile 2" in profile_names


@pytest.mark.asyncio
async def test_get_birth_profile_by_id(async_client: AsyncClient):
    """Verify retrieving a specific owned profile by ID."""
    headers, _ = await create_user_and_auth_headers(async_client, "crud_get@veda.ai")

    create_res = await async_client.post(
        "/api/v1/birth-profiles",
        json=SAMPLE_PROFILE_PAYLOAD,
        headers=headers,
    )
    profile_id = create_res.json()["id"]

    get_res = await async_client.get(
        f"/api/v1/birth-profiles/{profile_id}",
        headers=headers,
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == profile_id
    assert get_res.json()["profile_name"] == "My Natal Kundli"


@pytest.mark.asyncio
async def test_update_birth_profile(async_client: AsyncClient):
    """Verify updating fields of an owned birth profile."""
    headers, _ = await create_user_and_auth_headers(async_client, "crud_update@veda.ai")

    create_res = await async_client.post(
        "/api/v1/birth-profiles",
        json=SAMPLE_PROFILE_PAYLOAD,
        headers=headers,
    )
    profile_id = create_res.json()["id"]

    update_payload = {
        "profile_name": "Updated Kundli Label",
        "birth_place": "Haridwar, Uttarakhand, India",
        "ayanamsha": "raman",
    }
    patch_res = await async_client.patch(
        f"/api/v1/birth-profiles/{profile_id}",
        json=update_payload,
        headers=headers,
    )
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["profile_name"] == "Updated Kundli Label"
    assert updated_data["birth_place"] == "Haridwar, Uttarakhand, India"
    assert updated_data["ayanamsha"] == "raman"
    # Unchanged fields persist
    assert updated_data["date_of_birth"] == "1994-10-14"


@pytest.mark.asyncio
async def test_delete_birth_profile(async_client: AsyncClient):
    """Verify deleting an owned profile."""
    headers, _ = await create_user_and_auth_headers(async_client, "crud_del@veda.ai")

    create_res = await async_client.post(
        "/api/v1/birth-profiles",
        json=SAMPLE_PROFILE_PAYLOAD,
        headers=headers,
    )
    profile_id = create_res.json()["id"]

    del_res = await async_client.delete(
        f"/api/v1/birth-profiles/{profile_id}",
        headers=headers,
    )
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # Confirm profile no longer exists
    get_res = await async_client.get(
        f"/api/v1/birth-profiles/{profile_id}",
        headers=headers,
    )
    assert get_res.status_code == 404
    assert get_res.json()["error_code"] == "RESOURCE_NOT_FOUND"


# ==============================================================================
# 2. Ownership & Authorization Protection
# ==============================================================================
@pytest.mark.asyncio
async def test_user_cannot_access_or_modify_other_user_profile(
    async_client: AsyncClient,
):
    """
    Verify complete tenant isolation:
    User A cannot read, update, or delete User B's profile.
    All attempts must return 404 (avoiding ownership leak).
    """
    headers_a, _ = await create_user_and_auth_headers(async_client, "user_a@veda.ai")
    headers_b, _ = await create_user_and_auth_headers(async_client, "user_b@veda.ai")

    # User B creates a profile
    res_b = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "profile_name": "User B Secret Chart"},
        headers=headers_b,
    )
    profile_b_id = res_b.json()["id"]

    # User A tries to GET User B's profile -> 404
    get_cross = await async_client.get(
        f"/api/v1/birth-profiles/{profile_b_id}",
        headers=headers_a,
    )
    assert get_cross.status_code == 404
    assert get_cross.json()["error_code"] == "RESOURCE_NOT_FOUND"

    # User A tries to PATCH User B's profile -> 404
    patch_cross = await async_client.patch(
        f"/api/v1/birth-profiles/{profile_b_id}",
        json={"profile_name": "Hacked Profile"},
        headers=headers_a,
    )
    assert patch_cross.status_code == 404

    # User A tries to DELETE User B's profile -> 404
    del_cross = await async_client.delete(
        f"/api/v1/birth-profiles/{profile_b_id}",
        headers=headers_a,
    )
    assert del_cross.status_code == 404

    # User A tries to SET DEFAULT User B's profile -> 404
    default_cross = await async_client.patch(
        f"/api/v1/birth-profiles/{profile_b_id}/default",
        headers=headers_a,
    )
    assert default_cross.status_code == 404

    # Verify User B's profile remains untouched
    verify_b = await async_client.get(
        f"/api/v1/birth-profiles/{profile_b_id}",
        headers=headers_b,
    )
    assert verify_b.status_code == 200
    assert verify_b.json()["profile_name"] == "User B Secret Chart"


@pytest.mark.asyncio
async def test_unauthenticated_requests_rejected(async_client: AsyncClient):
    """Verify all birth profile endpoints reject unauthenticated calls with 401."""
    random_id = uuid.uuid4()

    endpoints = [
        ("GET", "/api/v1/birth-profiles"),
        ("POST", "/api/v1/birth-profiles"),
        ("GET", "/api/v1/birth-profiles/default"),
        ("GET", f"/api/v1/birth-profiles/{random_id}"),
        ("PATCH", f"/api/v1/birth-profiles/{random_id}"),
        ("DELETE", f"/api/v1/birth-profiles/{random_id}"),
        ("PATCH", f"/api/v1/birth-profiles/{random_id}/default"),
    ]

    for method, path in endpoints:
        if method == "GET":
            res = await async_client.get(path)
        elif method == "POST":
            res = await async_client.post(path, json=SAMPLE_PROFILE_PAYLOAD)
        elif method == "PATCH":
            res = await async_client.patch(path, json={"profile_name": "Test"})
        elif method == "DELETE":
            res = await async_client.delete(path)
        assert res.status_code == 401, f"Failed on {method} {path}"
        assert res.json()["error_code"] == "INVALID_TOKEN"


# ==============================================================================
# 3. Validation Rules
# ==============================================================================
@pytest.mark.asyncio
async def test_future_dob_rejected(async_client: AsyncClient):
    """Verify that birth dates in the future are rejected."""
    headers, _ = await create_user_and_auth_headers(async_client, "val_future_dob@veda.ai")
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    payload = {**SAMPLE_PROFILE_PAYLOAD, "date_of_birth": tomorrow}
    res = await async_client.post(
        "/api/v1/birth-profiles",
        json=payload,
        headers=headers,
    )
    assert res.status_code == 422
    assert "future" in str(res.json()).lower()


@pytest.mark.asyncio
async def test_invalid_coordinates_rejected(async_client: AsyncClient):
    """Verify invalid latitudes and longitudes are rejected."""
    headers, _ = await create_user_and_auth_headers(async_client, "val_coords@veda.ai")

    # Latitude > 90
    res_lat = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "latitude": 95.1234},
        headers=headers,
    )
    assert res_lat.status_code == 422

    # Latitude < -90
    res_lat2 = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "latitude": -91.0},
        headers=headers,
    )
    assert res_lat2.status_code == 422

    # Longitude > 180
    res_lon = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "longitude": 185.0},
        headers=headers,
    )
    assert res_lon.status_code == 422

    # Longitude < -180
    res_lon2 = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "longitude": -180.5},
        headers=headers,
    )
    assert res_lon2.status_code == 422


@pytest.mark.asyncio
async def test_invalid_timezone_rejected(async_client: AsyncClient):
    """Verify invalid or non-IANA timezones are rejected."""
    headers, _ = await create_user_and_auth_headers(async_client, "val_tz@veda.ai")

    res = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "timezone": "Mars/Olympus_Mons"},
        headers=headers,
    )
    assert res.status_code == 422
    assert "iana timezone" in str(res.json()).lower()


@pytest.mark.asyncio
async def test_unsupported_ayanamsha_rejected(async_client: AsyncClient):
    """Verify unsupported ayanamsha systems are rejected."""
    headers, _ = await create_user_and_auth_headers(async_client, "val_ayanamsha@veda.ai")

    res = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "ayanamsha": "tropical_fagan_allen"},
        headers=headers,
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_birth_time_accuracy_rules(async_client: AsyncClient):
    """
    Verify birth time rules:
    - exact: time_of_birth is required
    - approximate: time_of_birth is optional
    - unknown: time_of_birth must be null
    """
    headers, _ = await create_user_and_auth_headers(async_client, "val_time_rules@veda.ai")

    # 1. Exact accuracy without time_of_birth -> 422
    res_exact_fail = await async_client.post(
        "/api/v1/birth-profiles",
        json={
            **SAMPLE_PROFILE_PAYLOAD,
            "birth_time_accuracy": "exact",
            "time_of_birth": None,
        },
        headers=headers,
    )
    assert res_exact_fail.status_code == 422

    # 2. Unknown accuracy with time_of_birth -> 422
    res_unknown_fail = await async_client.post(
        "/api/v1/birth-profiles",
        json={
            **SAMPLE_PROFILE_PAYLOAD,
            "birth_time_accuracy": "unknown",
            "time_of_birth": "14:30:00",
        },
        headers=headers,
    )
    assert res_unknown_fail.status_code == 422

    # 3. Unknown accuracy with null time_of_birth -> 201 Success
    res_unknown_ok = await async_client.post(
        "/api/v1/birth-profiles",
        json={
            **SAMPLE_PROFILE_PAYLOAD,
            "profile_name": "Unknown Time Profile",
            "birth_time_accuracy": "unknown",
            "time_of_birth": None,
        },
        headers=headers,
    )
    assert res_unknown_ok.status_code == 201
    assert res_unknown_ok.json()["birth_time_accuracy"] == "unknown"
    assert res_unknown_ok.json()["time_of_birth"] is None

    # 4. Approximate accuracy with time_of_birth -> 201 Success
    res_approx_ok = await async_client.post(
        "/api/v1/birth-profiles",
        json={
            **SAMPLE_PROFILE_PAYLOAD,
            "profile_name": "Approx Time Profile",
            "birth_time_accuracy": "approximate",
            "time_of_birth": "07:15:00",
        },
        headers=headers,
    )
    assert res_approx_ok.status_code == 201
    assert res_approx_ok.json()["birth_time_accuracy"] == "approximate"
    assert res_approx_ok.json()["time_of_birth"] == "07:15:00"

    # 5. Approximate accuracy with null time_of_birth -> 201 Success
    res_approx_null = await async_client.post(
        "/api/v1/birth-profiles",
        json={
            **SAMPLE_PROFILE_PAYLOAD,
            "profile_name": "Approx Time Null Profile",
            "birth_time_accuracy": "approximate",
            "time_of_birth": None,
        },
        headers=headers,
    )
    assert res_approx_null.status_code == 201


@pytest.mark.asyncio
async def test_forbids_injection_of_user_id(async_client: AsyncClient):
    """Verify that clients cannot supply or override user_id in payloads."""
    headers, user = await create_user_and_auth_headers(async_client, "val_userid_inject@veda.ai")
    fake_user_id = str(uuid.uuid4())

    res = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "user_id": fake_user_id},
        headers=headers,
    )
    # Extra field forbidden -> 422
    assert res.status_code == 422


# ==============================================================================
# 4. Default Profile Mechanics
# ==============================================================================
@pytest.mark.asyncio
async def test_default_profile_lifecycle(async_client: AsyncClient):
    """
    Verify complete default profile lifecycle:
    1. First profile automatically becomes default.
    2. Second profile defaults to False.
    3. Switching default works atomically (old default cleared).
    4. GET /default retrieves the active default profile.
    5. Deleting current default promotes another existing profile to default.
    6. Deleting the only profile leaves no default profile (GET /default -> 404).
    """
    headers, _ = await create_user_and_auth_headers(async_client, "def_lifecycle@veda.ai")

    # Initially, GET /default returns 404
    no_def_res = await async_client.get("/api/v1/birth-profiles/default", headers=headers)
    assert no_def_res.status_code == 404

    # 1. Create first profile -> automatically default
    p1_res = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "profile_name": "Chart 1"},
        headers=headers,
    )
    p1 = p1_res.json()
    assert p1["is_default"] is True

    # Check GET /default
    def1_res = await async_client.get("/api/v1/birth-profiles/default", headers=headers)
    assert def1_res.status_code == 200
    assert def1_res.json()["id"] == p1["id"]

    # 2. Create second profile -> is_default is False
    p2_res = await async_client.post(
        "/api/v1/birth-profiles",
        json={**SAMPLE_PROFILE_PAYLOAD, "profile_name": "Chart 2", "is_default": False},
        headers=headers,
    )
    p2 = p2_res.json()
    assert p2["is_default"] is False

    # 3. Switch default to Chart 2 via PATCH /{id}/default
    switch_res = await async_client.patch(
        f"/api/v1/birth-profiles/{p2['id']}/default",
        headers=headers,
    )
    assert switch_res.status_code == 200
    assert switch_res.json()["is_default"] is True

    # Verify Chart 1 is no longer default
    p1_check = await async_client.get(
        f"/api/v1/birth-profiles/{p1['id']}",
        headers=headers,
    )
    assert p1_check.json()["is_default"] is False

    # Verify GET /default now returns Chart 2
    def2_res = await async_client.get("/api/v1/birth-profiles/default", headers=headers)
    assert def2_res.status_code == 200
    assert def2_res.json()["id"] == p2["id"]

    # 5. Delete Chart 2 (which is currently default) -> Chart 1 automatically promoted to default
    del_res = await async_client.delete(
        f"/api/v1/birth-profiles/{p2['id']}",
        headers=headers,
    )
    assert del_res.status_code == 200

    def3_res = await async_client.get("/api/v1/birth-profiles/default", headers=headers)
    assert def3_res.status_code == 200
    assert def3_res.json()["id"] == p1["id"]
    assert def3_res.json()["is_default"] is True

    # 6. Delete Chart 1 (only remaining profile) -> No profiles left
    del_p1 = await async_client.delete(
        f"/api/v1/birth-profiles/{p1['id']}",
        headers=headers,
    )
    assert del_p1.status_code == 200

    no_def_again = await async_client.get(
        "/api/v1/birth-profiles/default",
        headers=headers,
    )
    assert no_def_again.status_code == 404


# ==============================================================================
# 5. Database Constraints & Cascade Behavior
# ==============================================================================
@pytest.mark.asyncio
async def test_birth_profile_user_cascade_delete(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Verify deleting a User cascades and deletes all associated BirthProfile rows."""
    headers, user_data = await create_user_and_auth_headers(async_client, "cascade_bp@veda.ai")
    user_id = uuid.UUID(user_data["id"])

    # Create profile
    res = await async_client.post(
        "/api/v1/birth-profiles",
        json=SAMPLE_PROFILE_PAYLOAD,
        headers=headers,
    )
    profile_id = uuid.UUID(res.json()["id"])

    # Verify profile exists in DB
    query = await db_session.execute(
        select(BirthProfile).where(BirthProfile.id == profile_id)
    )
    assert query.scalar_one_or_none() is not None

    # Delete User from database
    user_record = await db_session.get(User, user_id)
    assert user_record is not None
    await db_session.delete(user_record)
    await db_session.commit()

    # Verify BirthProfile was cascade deleted
    db_session.expire_all()
    query_after = await db_session.execute(
        select(BirthProfile).where(BirthProfile.id == profile_id)
    )
    assert query_after.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_nullable_coordinates_and_timezone_allowed(async_client: AsyncClient):
    """
    Verify that if coordinates or timezone are unknown, profile can be saved with null values
    without crashing or falsifying coordinates.
    """
    headers, _ = await create_user_and_auth_headers(async_client, "null_coords@veda.ai")

    payload = {
        "profile_name": "Rural Birth (No GPS)",
        "full_name": "Devi Prasad",
        "date_of_birth": "1980-05-20",
        "time_of_birth": None,
        "birth_time_accuracy": "unknown",
        "birth_place": "Remote Village, Bihar, India",
        "latitude": None,
        "longitude": None,
        "timezone": None,
        "ayanamsha": "lahiri",
    }

    res = await async_client.post(
        "/api/v1/birth-profiles",
        json=payload,
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["latitude"] is None
    assert data["longitude"] is None
    assert data["timezone"] is None
    assert data["time_of_birth"] is None
    assert data["birth_place"] == "Remote Village, Bihar, India"

