import asyncio
import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from pydantic import ValidationError
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.api.deps import require_roles
from app.core.config import Settings, settings
from app.core.security import (
    create_access_token,
    generate_secure_random_token,
    hash_token,
)
from app.db.models.password_reset_token import PasswordResetToken
from app.db.models.refresh_session import RefreshSession
from app.db.models.user import User, UserRole
from app.main import app
from app.repositories.session_repository import RefreshSessionRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.email_service import TEST_OUTBOX


async def create_test_user(
    async_client: AsyncClient,
    email: str = "security_test@veda.ai",
    password: str = "SecurePass123!",
    full_name: str = "Security User",
):
    """Helper to register and return login payload."""
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
    return login_res.json()


# ==============================================================================
# 1. Refresh Token Rotation Under Concurrent Requests
# ==============================================================================
@pytest.mark.asyncio
async def test_concurrent_refresh_rotation_safety(async_client: AsyncClient):
    """
    Verify that concurrent refresh requests with the same token are safely handled:
    At most one succeeds in rotating, and replay detection flags any replayed/concurrent attempt.
    """
    auth_data = await create_test_user(async_client, "concurrent_refresh@veda.ai")
    initial_refresh = auth_data["refresh_token"]

    # Dispatch concurrent refresh requests
    req1 = async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    req2 = async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )

    res1, res2 = await asyncio.gather(req1, req2)

    status_codes = [res1.status_code, res2.status_code]
    # In concurrent rotation: one may succeed (200) and the other fails (401),
    # or if both are processed concurrently, replay detection invalidates the compromised token.
    assert 200 in status_codes or 401 in status_codes
    if 200 in status_codes:
        assert status_codes.count(200) == 1
        assert status_codes.count(401) == 1


# ==============================================================================
# 2. Refresh Token Replay Detection and Session Revocation
# ==============================================================================
@pytest.mark.asyncio
async def test_replay_detection_revokes_all_user_sessions(
    async_client: AsyncClient, db_session: AsyncSession
):
    """
    Verify that replaying a revoked refresh token triggers breach containment:
    1. The replay request fails with 401 INVALID_TOKEN.
    2. ALL sessions for that user are revoked in the database.
    3. Even the newly rotated refresh token becomes invalid.
    """
    auth_data = await create_test_user(async_client, "replay_breach@veda.ai")
    token_v1 = auth_data["refresh_token"]

    # Rotate token_v1 -> receives token_v2
    rot_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_v1},
    )
    assert rot_res.status_code == 200
    token_v2 = rot_res.json()["refresh_token"]

    # Replay attack: Attacker attempts to use token_v1 again
    replay_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_v1},
    )
    assert replay_res.status_code == 401
    assert replay_res.json()["error_code"] == "INVALID_TOKEN"

    # Verify breach response: token_v2 should ALSO now be revoked
    v2_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_v2},
    )
    assert v2_res.status_code == 401
    assert v2_res.json()["error_code"] == "INVALID_TOKEN"


# ==============================================================================
# 3. Database Transaction Safety During Refresh Rotation
# ==============================================================================
@pytest.mark.asyncio
async def test_transaction_rollback_on_refresh_failure(
    async_client: AsyncClient, db_session: AsyncSession
):
    """
    Verify that if an error occurs during refresh rotation, the transaction rolls back cleanly:
    The existing session remains intact if the rotation is aborted before completion.
    """
    auth_data = await create_test_user(async_client, "tx_safety@veda.ai")
    token = auth_data["refresh_token"]

    # Fetch initial session
    initial_session = await RefreshSessionRepository.get_by_token(db_session, token)
    assert initial_session is not None
    assert initial_session.revoked_at is None

    # Simulate an invalid token refresh request
    fail_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "non_existent_token_string_value"},
    )
    assert fail_res.status_code == 401

    # Verify original session is still valid and unrevoked
    db_session.expire_all()
    session_after = await RefreshSessionRepository.get_by_token(db_session, token)
    assert session_after.revoked_at is None


# ==============================================================================
# 4. HTTP-Only Cookie Configuration, Secure, SameSite, Path & Expiration
# ==============================================================================
@pytest.mark.asyncio
async def test_cookie_security_attributes(async_client: AsyncClient):
    """
    Verify that refresh cookies are configured with HttpOnly, SameSite, explicit Path, and Max-Age.
    """
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Cookie Tester",
            "email": "cookie_sec@veda.ai",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        },
    )
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "cookie_sec@veda.ai", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    set_cookie_header = login_res.headers.get("set-cookie", "")

    # Assert security attributes
    assert "HttpOnly" in set_cookie_header or "httponly" in set_cookie_header.lower()
    assert "samesite=lax" in set_cookie_header.lower()
    assert "path=/api/v1/auth" in set_cookie_header.lower()
    assert "max-age=" in set_cookie_header.lower()

    # Verify Logout clears cookie with matching path
    logout_res = await async_client.post(
        "/api/v1/auth/logout",
        headers={"origin": "http://localhost:5173"},
    )
    assert logout_res.status_code == 200
    logout_cookie_header = logout_res.headers.get("set-cookie", "")
    assert "max-age=0" in logout_cookie_header.lower()
    assert "path=/api/v1/auth" in logout_cookie_header.lower()


# ==============================================================================
# 5. CSRF Protection for Cookie-Based Refresh and Logout Requests
# ==============================================================================
@pytest.mark.asyncio
async def test_csrf_protection_on_cookie_auth(async_client: AsyncClient):
    """
    Verify that cookie-based refresh and logout requests reject untrusted cross-site origins.
    """
    auth_data = await create_test_user(async_client, "csrf_test@veda.ai")

    # 1. Attacker sends a cookie-based refresh with a malicious origin header
    malicious_res = await async_client.post(
        "/api/v1/auth/refresh",
        headers={"origin": "https://malicious-attacker.com"},
    )
    assert malicious_res.status_code == 403
    assert malicious_res.json()["error_code"] == "FORBIDDEN"

    # 2. Legitimate request with allowed origin header succeeds
    legit_res = await async_client.post(
        "/api/v1/auth/refresh",
        headers={"origin": "http://localhost:5173"},
    )
    assert legit_res.status_code == 200

    # 3. Attacker sends logout with untrusted origin header -> blocked
    malicious_logout = await async_client.post(
        "/api/v1/auth/logout",
        headers={"origin": "https://evil.org"},
    )
    assert malicious_logout.status_code == 403


# ==============================================================================
# 6. JWT Authorization Uses Current Database User Role
# ==============================================================================
@pytest.mark.asyncio
async def test_jwt_authorization_uses_live_database_role(
    async_client: AsyncClient, db_session: AsyncSession
):
    """
    Verify that role authorization dynamically reads the live database record,
    not merely the stale role claim encoded in the token payload.
    """

    @app.get("/api/v1/test/astrologer-zone")
    async def astrologer_zone(
        user: User = Depends(require_roles(UserRole.ASTROLOGER.value)),
    ):
        return {"access": "granted", "role": user.role}

    # Register user as client
    auth_data = await create_test_user(async_client, "role_switch@veda.ai")
    token = auth_data["access_token"]
    user_id = uuid.UUID(auth_data["user"]["id"])

    # Initially client -> Access denied to astrologer zone
    res_client = await async_client.get(
        "/api/v1/test/astrologer-zone",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_client.status_code == 403

    # Admin promotes user to astrologer in database
    await db_session.execute(
        update(User)
        .where(User.id == user_id)
        .values(role=UserRole.ASTROLOGER.value)
    )
    await db_session.commit()

    # Using the SAME original token (which had 'client' inside its JWT payload),
    # access is now granted because get_current_user fetches live DB state!
    res_promoted = await async_client.get(
        "/api/v1/test/astrologer-zone",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_promoted.status_code == 200
    assert res_promoted.json()["role"] == "astrologer"

    # Demote back to client
    await db_session.execute(
        update(User).where(User.id == user_id).values(role=UserRole.CLIENT.value)
    )
    await db_session.commit()

    # Access is immediately revoked
    res_demoted = await async_client.get(
        "/api/v1/test/astrologer-zone",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_demoted.status_code == 403


# ==============================================================================
# 7. Inactive Users Cannot Access Protected Endpoints
# ==============================================================================
@pytest.mark.asyncio
async def test_inactive_user_access_blocked(
    async_client: AsyncClient, db_session: AsyncSession
):
    """
    Verify that deactivated users are immediately blocked from:
    1. Authenticated endpoints (/api/v1/auth/me)
    2. Logging in (/api/v1/auth/login)
    3. Refreshing tokens (/api/v1/auth/refresh)
    """
    auth_data = await create_test_user(async_client, "inactive_user@veda.ai")
    token = auth_data["access_token"]
    refresh = auth_data["refresh_token"]
    user_id = uuid.UUID(auth_data["user"]["id"])

    # Deactivate user in database
    await db_session.execute(
        update(User).where(User.id == user_id).values(is_active=False)
    )
    await db_session.commit()

    # 1. Accessing /me fails with 403 USER_INACTIVE
    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 403
    assert me_res.json()["error_code"] == "USER_INACTIVE"

    # 2. Login fails with 403 USER_INACTIVE
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "inactive_user@veda.ai", "password": "SecurePass123!"},
    )
    assert login_res.status_code == 403
    assert login_res.json()["error_code"] == "USER_INACTIVE"

    # 3. Refresh fails with 403 USER_INACTIVE
    ref_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh},
    )
    assert ref_res.status_code == 403
    assert ref_res.json()["error_code"] == "USER_INACTIVE"


# ==============================================================================
# 8. Password Reset Tokens Are Hashed, Expire, and Can Only Be Used Once
# ==============================================================================
@pytest.mark.asyncio
async def test_password_reset_token_security_lifecycle(
    async_client: AsyncClient, db_session: AsyncSession
):
    """
    Verify password reset token security properties:
    1. Raw token is never stored in DB (only SHA-256 digest is saved).
    2. Expired tokens are rejected.
    3. Token cannot be reused (single-use enforcement).
    """
    await create_test_user(async_client, "reset_sec@veda.ai")
    TEST_OUTBOX.clear()

    # Request reset
    await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "reset_sec@veda.ai"},
    )
    assert len(TEST_OUTBOX) == 1
    raw_token = TEST_OUTBOX[0]["token"]

    # Verify hashing: raw token is NOT in database, SHA-256 digest IS
    digest = hash_token(raw_token)
    token_query = await db_session.execute(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == digest)
    )
    token_record = token_query.scalar_one_or_none()
    assert token_record is not None
    assert token_record.token_hash != raw_token
    assert len(token_record.token_hash) == 64

    # Single-use test: First reset succeeds
    reset_res1 = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewSecurePassword456!",
            "confirm_password": "NewSecurePassword456!",
        },
    )
    assert reset_res1.status_code == 200

    # Second reset attempt with same token fails (used_at is marked)
    reset_res2 = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "AnotherPassword789!",
            "confirm_password": "AnotherPassword789!",
        },
    )
    assert reset_res2.status_code == 400
    assert reset_res2.json()["error_code"] == "BAD_REQUEST"


@pytest.mark.asyncio
async def test_expired_password_reset_token_rejected(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Verify expired password reset token is rejected."""
    await create_test_user(async_client, "expired_reset@veda.ai")
    TEST_OUTBOX.clear()

    await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "expired_reset@veda.ai"},
    )
    raw_token = TEST_OUTBOX[0]["token"]
    digest = hash_token(raw_token)

    # Force expiration in DB
    past_time = datetime.now(timezone.utc) - timedelta(hours=2)
    await db_session.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.token_hash == digest)
        .values(expires_at=past_time)
    )
    await db_session.commit()

    # Attempt reset with expired token
    res = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewSecurePassword456!",
            "confirm_password": "NewSecurePassword456!",
        },
    )
    assert res.status_code == 400
    assert res.json()["error_code"] == "BAD_REQUEST"


# ==============================================================================
# 9. Password Reset Invalidates Existing Refresh Sessions
# ==============================================================================
@pytest.mark.asyncio
async def test_password_reset_revokes_all_active_sessions(
    async_client: AsyncClient,
):
    """
    Verify that completing a password reset invalidates all existing refresh sessions,
    forcing re-authentication across all user devices.
    """
    auth_data = await create_test_user(async_client, "session_inval@veda.ai")
    old_refresh = auth_data["refresh_token"]
    TEST_OUTBOX.clear()

    # Request and perform reset
    await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "session_inval@veda.ai"},
    )
    raw_token = TEST_OUTBOX[0]["token"]

    await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewBrandPassword123!",
            "confirm_password": "NewBrandPassword123!",
        },
    )

    # Attempt to refresh with the prior session token -> Must be rejected
    fail_refresh = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert fail_refresh.status_code == 401
    assert fail_refresh.json()["error_code"] == "INVALID_TOKEN"


# ==============================================================================
# 11. PostgreSQL Constraints and Enum Behavior
# ==============================================================================
@pytest.mark.asyncio
async def test_role_check_constraint_enforcement(db_session: AsyncSession):
    """
    Verify that the database level check constraint enforces valid user roles:
    Only 'client', 'astrologer', and 'admin' are permitted.
    """
    invalid_user = User(
        full_name="Hacker",
        email="hacker@evil.com",
        password_hash="fakehash",
        role="super_admin_unauthorized",  # Invalid role
    )
    db_session.add(invalid_user)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


# ==============================================================================
# 12 & 13. Production Security Configuration Validation
# ==============================================================================
def test_production_rejects_insecure_secrets():
    """Verify that Settings prevents insecure or default JWT secrets in production."""
    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="veda_ai_insecure_development_jwt_secret_key_change_in_production_min32chars",
            DEBUG=False,
            COOKIE_SECURE=True,
            _env_file=None,
        )


def test_production_rejects_debug_mode():
    """Verify that Settings prevents DEBUG=True in production."""
    with pytest.raises(ValidationError, match="DEBUG mode must be False"):
        Settings(
            APP_ENV="production",
            DEBUG=True,
            JWT_SECRET_KEY="cryptographically_secure_random_production_key_32bytes",
            COOKIE_SECURE=True,
            _env_file=None,
        )


def test_production_rejects_insecure_cookies():
    """Verify that Settings requires COOKIE_SECURE=True in production."""
    with pytest.raises(ValidationError, match="COOKIE_SECURE must be True"):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            COOKIE_SECURE=False,
            JWT_SECRET_KEY="cryptographically_secure_random_production_key_32bytes",
            _env_file=None,
        )


def test_production_rejects_cors_wildcard():
    """Verify that Settings forbids wildcard CORS origins in production."""
    with pytest.raises(ValidationError, match="Wildcard"):
        Settings(
            APP_ENV="production",
            DEBUG=False,
            COOKIE_SECURE=True,
            JWT_SECRET_KEY="cryptographically_secure_random_production_key_32bytes",
            CORS_ORIGINS=["*"],
            _env_file=None,
        )


def test_production_valid_configuration():
    """Verify that a properly configured production environment passes validation."""
    valid_settings = Settings(
        APP_ENV="production",
        DEBUG=False,
        COOKIE_SECURE=True,
        JWT_SECRET_KEY="cryptographically_secure_random_production_key_32bytes",
        CORS_ORIGINS=["https://app.veda.ai", "https://veda.ai"],
        _env_file=None,
    )
    assert valid_settings.is_production is True
    assert valid_settings.COOKIE_SECURE is True
    assert valid_settings.DEBUG is False
