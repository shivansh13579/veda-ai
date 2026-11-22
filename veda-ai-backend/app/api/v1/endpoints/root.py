from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import RootResponse

router = APIRouter()


@router.get(
    "/",
    response_model=RootResponse,
    summary="API v1 Root",
    description="Returns metadata and navigation links for Veda AI API v1.",
)
async def api_v1_root():
    return RootResponse(
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        status="active",
        api_v1_prefix=settings.API_V1_PREFIX,
        documentation_urls={
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        },
    )

