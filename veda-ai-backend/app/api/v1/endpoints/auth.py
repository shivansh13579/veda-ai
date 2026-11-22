from typing import Optional
from fastapi import APIRouter, Cookie, Depends, Header, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import BadRequestError, ForbiddenError
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.user import (
    AuthMessageResponse,
    ForgotPasswordRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Client Account",
    description="Registers a new user account defaulting strictly to the client role. Prevents administrative role self-assignment.",
)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    user = await AuthService.register_user(db, payload)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate & Issue Tokens",
    description="Validates email/password credentials and issues a short-lived access token and cryptographically secure refresh session.",
)
async def login(
    payload: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user, access_token, raw_refresh_token = await AuthService.authenticate_user(db, payload)

    # Optionally set HTTP-only cookie for secure browser environments
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE or settings.is_production,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        domain=settings.COOKIE_DOMAIN,
        path=settings.COOKIE_PATH,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate Refresh Token",
    description="Exchanges an active refresh token for a new access token and rotated refresh token. Detects token reuse attacks.",
)
async def refresh_token(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    refresh_token_cookie: Optional[str] = Cookie(None, alias="refresh_token"),
    db: AsyncSession = Depends(get_db),
):
    # Accept token either from JSON body or secure HTTP-only cookie
    token_candidate = None
    is_cookie_auth = False
    if payload and payload.refresh_token:
        token_candidate = payload.refresh_token
    elif refresh_token_cookie:
        token_candidate = refresh_token_cookie
        is_cookie_auth = True

    if not token_candidate:
        raise BadRequestError("No refresh token supplied in request body or cookie.")

    # Defense-in-depth CSRF verification for cookie-based authentication
    if is_cookie_auth:
        origin = request.headers.get("origin")
        if origin and origin not in settings.CORS_ORIGINS:
            raise ForbiddenError("CSRF protection: untrusted request origin.")

    user, new_access_token, new_raw_refresh_token = await AuthService.refresh_tokens(
        db, token_candidate
    )

    if response:
        response.set_cookie(
            key="refresh_token",
            value=new_raw_refresh_token,
            httponly=True,
            secure=settings.COOKIE_SECURE or settings.is_production,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            domain=settings.COOKIE_DOMAIN,
            path=settings.COOKIE_PATH,
        )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/logout",
    response_model=AuthMessageResponse,
    summary="Revoke Active Session",
    description="Revokes the current refresh session and clears session cookies.",
)
async def logout(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    refresh_token_cookie: Optional[str] = Cookie(None, alias="refresh_token"),
    db: AsyncSession = Depends(get_db),
):
    token_candidate = None
    is_cookie_auth = False
    if payload and payload.refresh_token:
        token_candidate = payload.refresh_token
    elif refresh_token_cookie:
        token_candidate = refresh_token_cookie
        is_cookie_auth = True

    # Defense-in-depth CSRF verification for cookie-based authentication
    if is_cookie_auth:
        origin = request.headers.get("origin")
        if origin and origin not in settings.CORS_ORIGINS:
            raise ForbiddenError("CSRF protection: untrusted request origin.")

    if token_candidate:
        await AuthService.logout_session(db, token_candidate)

    if response:
        response.delete_cookie(
            key="refresh_token",
            domain=settings.COOKIE_DOMAIN,
            path=settings.COOKIE_PATH,
            httponly=True,
            secure=settings.COOKIE_SECURE or settings.is_production,
            samesite=settings.COOKIE_SAMESITE,
        )

    return AuthMessageResponse(
        status="success",
        message="Session revoked successfully.",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Authenticated User Profile",
    description="Returns current authenticated user identity and role claims.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post(
    "/forgot-password",
    response_model=AuthMessageResponse,
    summary="Request Password Reset",
    description="Initiates password recovery with a single-use token. Always returns a generic response to prevent email enumeration.",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    await AuthService.request_password_reset(db, payload.email)
    return AuthMessageResponse(
        status="success",
        message="If this email is registered, password recovery instructions have been sent.",
    )


@router.post(
    "/reset-password",
    response_model=AuthMessageResponse,
    summary="Complete Password Reset",
    description="Resets password using a verified single-use token and invalidates all existing refresh sessions.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    await AuthService.reset_password(db, payload.token, payload.new_password)
    return AuthMessageResponse(
        status="success",
        message="Password has been successfully reset. Please log in with your new password.",
    )
