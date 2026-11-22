import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi import Depends
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.db.models.user import User, UserRole
from app.main import app
from app.services.email_service import TEST_OUTBOX


# Test helper to register a client
async def register_sample_user(async_client: AsyncClient, email: str = "seeker@veda.ai"):
    payload = {
        "full_name": "Aarav Sharma",
        "email": email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    return response, payload


@pytest.mark.asyncio
async def test_successful_registration(async_client: AsyncClient):
    """Verify user registration returns 201 Created and safe user schema."""
    response, _ = await register_sample_user(async_client, "newuser@veda.ai")
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@veda.ai"
    assert data["full_name"] == "Aarav Sharma"
    assert data["role"] == "client"
    assert "password" not in data
    assert "password_hash" not in data
    assert "id" in data


@pytest.mark.asyncio
async def test_duplicate_email_registration(async_client: AsyncClient):
    """Verify registration fails with 409 Conflict when email already exists."""
    await register_sample_user(async_client, "duplicate@veda.ai")
    response, _ = await register_sample_user(async_client, "duplicate@veda.ai")
    assert response.status_code == 409
    data = response.json()
    assert data["error_code"] == "DUPLICATE_EMAIL"


@pytest.mark.asyncio
async def test_registration_password_mismatch(async_client: AsyncClient):
    """Verify password confirmation validation."""
    payload = {
        "full_name": "Aarav Sharma",
        "email": "mismatch@veda.ai",
        "password": "SecurePassword123!",
        "confirm_password": "DifferentPassword456!",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_password_hashing_and_verification():
    """Verify Argon2 password hashing integrity."""
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


@pytest.mark.asyncio
async def test_successful_login(async_client: AsyncClient):
    """Verify login returns access token and sets refresh session."""
    await register_sample_user(async_client, "login_test@veda.ai")
    login_payload = {
        "email": "login_test@veda.ai",
        "password": "SecurePassword123!",
    }
    response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login_test@veda.ai"
    assert "set-cookie" in response.headers
    assert "refresh_token" in response.headers["set-cookie"]


@pytest.mark.asyncio
async def test_login_incorrect_password(async_client: AsyncClient):
    """Verify login with wrong password returns 401 with generic error."""
    await register_sample_user(async_client, "wrong_pw@veda.ai")
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "wrong_pw@veda.ai", "password": "BadPassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error_code"] == "INVALID_CREDENTIALS"
    assert data["message"] == "Invalid email or password."


@pytest.mark.asyncio
async def test_login_nonexistent_email_enumeration_protection(async_client: AsyncClient):
    """Verify login with non-existent email returns identical generic error."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@veda.ai", "password": "AnyPassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error_code"] == "INVALID_CREDENTIALS"
    assert data["message"] == "Invalid email or password."


@pytest.mark.asyncio
async def test_auth_me_endpoint(async_client: AsyncClient):
    """Verify /auth/me returns profile when authenticated, 401 otherwise."""
    await register_sample_user(async_client, "me_test@veda.ai")
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "me_test@veda.ai", "password": "SecurePassword123!"},
    )
    token = login_res.json()["access_token"]

    # Authorized request
    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "me_test@veda.ai"

    # Unauthorized request (no token)
    anon_res = await async_client.get("/api/v1/auth/me")
    assert anon_res.status_code == 401


@pytest.mark.asyncio
async def test_expired_token_rejection(async_client: AsyncClient, db_session: AsyncSession):
    """Verify expired JWT access token is rejected with 401 TOKEN_EXPIRED."""
    await register_sample_user(async_client, "expired_jwt@veda.ai")
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "expired_jwt@veda.ai", "password": "SecurePassword123!"},
    )
    user_id = login_res.json()["user"]["id"]

    # Manually craft an expired token
    expired_token = create_access_token(
        user_id=user_id,
        role="client",
        email="expired_jwt@veda.ai",
        expires_delta=timedelta(seconds=-10),
    )

    res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert res.status_code == 401
    assert res.json()["error_code"] == "TOKEN_EXPIRED"


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(async_client: AsyncClient):
    """Verify refresh rotation issues a new token pair and revokes the old refresh token."""
    await register_sample_user(async_client, "rotation@veda.ai")
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "rotation@veda.ai", "password": "SecurePassword123!"},
    )
    initial_refresh = login_res.json()["refresh_token"]

    # Rotate refresh token
    refresh_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert refresh_res.status_code == 200
    rotated_data = refresh_res.json()
    new_refresh = rotated_data["refresh_token"]
    assert new_refresh != initial_refresh

    # Try reusing the initial (now revoked) refresh token -> Token Reuse Detection
    reuse_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh},
    )
    assert reuse_res.status_code == 401
    assert reuse_res.json()["error_code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_logout_revokes_session(async_client: AsyncClient):
    """Verify logout revokes the refresh session."""
    await register_sample_user(async_client, "logout_test@veda.ai")
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "logout_test@veda.ai", "password": "SecurePassword123!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    logout_res = await async_client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200

    # Refresh should now fail
    after_logout_res = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert after_logout_res.status_code == 401


@pytest.mark.asyncio
async def test_role_based_authorization_protection(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Verify role dependencies reject users lacking the required role with 403 Forbidden."""

    # Temporary test route requiring admin role
    @app.get("/api/v1/test/admin-only")
    async def admin_only_endpoint(user: User = Depends(require_roles(UserRole.ADMIN.value))):
        return {"admin": True, "user": user.email}

    # Register normal client
    await register_sample_user(async_client, "client_role@veda.ai")
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "client_role@veda.ai", "password": "SecurePassword123!"},
    )
    client_token = login_res.json()["access_token"]

    # Client accessing admin-only endpoint
    forbidden_res = await async_client.get(
        "/api/v1/test/admin-only",
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert forbidden_res.status_code == 403
    assert forbidden_res.json()["error_code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_password_reset_flow(async_client: AsyncClient):
    """Verify full password recovery flow: forgot password, token single-use, reset password."""
    await register_sample_user(async_client, "reset_flow@veda.ai")

    # 1. Request password reset
    forgot_res = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "reset_flow@veda.ai"},
    )
    assert forgot_res.status_code == 200
    assert len(TEST_OUTBOX) == 1
    raw_token = TEST_OUTBOX[0]["token"]

    # 2. Complete password reset with new password
    reset_res = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "BrandNewPassword999!",
            "confirm_password": "BrandNewPassword999!",
        },
    )
    assert reset_res.status_code == 200

    # 3. Old password should fail
    old_pw_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "reset_flow@veda.ai", "password": "SecurePassword123!"},
    )
    assert old_pw_res.status_code == 401

    # 4. New password succeeds
    new_pw_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "reset_flow@veda.ai", "password": "BrandNewPassword999!"},
    )
    assert new_pw_res.status_code == 200

    # 5. Token reuse is rejected (Single-use enforcement)
    reuse_token_res = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "AnotherNewPassword000!",
            "confirm_password": "AnotherNewPassword000!",
        },
    )
    assert reuse_token_res.status_code == 400
