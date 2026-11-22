from fastapi import APIRouter
from app.api.v1.endpoints import astrology, auth, birth_profiles, health, root

api_router = APIRouter()

# Core System Endpoints
api_router.include_router(root.router, tags=["System"])
api_router.include_router(health.router, tags=["System"])

# Authentication & User Management Endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Birth Profile Management Endpoints
api_router.include_router(
    birth_profiles.router, prefix="/birth-profiles", tags=["Birth Profiles"]
)

# Astrology Engine Endpoints (Batch 6D-1)
api_router.include_router(
    astrology.router, prefix="/astrology", tags=["Astrology Engine"]
)

