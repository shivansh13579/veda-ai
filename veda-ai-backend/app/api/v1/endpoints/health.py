from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import check_db_connectivity
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health & Database Connectivity Check",
    description="Probes application runtime and verifies live PostgreSQL database responsiveness.",
    responses={
        200: {"description": "Service is healthy and database is connected."},
        503: {"description": "Service is unhealthy or database connection failed."},
    },
)
async def health_check():
    """
    Returns 200 OK when the database connection probe succeeds.
    Returns 503 Service Unavailable if the database is disconnected or unreachable.
    """
    db_status = await check_db_connectivity()

    if not db_status["connected"]:
        response_payload = HealthResponse(
            status="unhealthy",
            app_name=settings.APP_NAME,
            version=settings.APP_VERSION,
            environment=settings.APP_ENV,
            database="disconnected",
            database_latency_ms=db_status.get("latency_ms"),
            detail=f"Database unreachable: {db_status.get('error')}",
        )
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response_payload.model_dump(mode="json"),
        )

    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        database="connected",
        database_latency_ms=db_status.get("latency_ms"),
        detail=None,
    )

