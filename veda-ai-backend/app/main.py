import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.session import engine
from app.schemas.common import ErrorResponse

# Configure Logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("veda_ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager for clean startup and shutdown.
    Ensures connection pool initialization and resource disposal.
    """
    logger.info("Starting up %s v%s (%s mode)", settings.APP_NAME, settings.APP_VERSION, settings.APP_ENV)
    yield
    logger.info("Shutting down %s - closing database connection pool...", settings.APP_NAME)
    await engine.dispose()
    logger.info("Database connection pool closed successfully.")


# Initialize FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Vedic Astrology AI Backend Engine providing high-precision astrological computations.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.warning("Application exception on %s: [%s] %s", request.url.path, exc.error_code, exc.message)
    error_payload = ErrorResponse(
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload.model_dump(mode="json"),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    error_payload = ErrorResponse(
        error_code="VALIDATION_ERROR",
        message="Request validation failed. Please check the supplied parameters.",
        details={"validation_errors": jsonable_encoder(exc.errors())},
    )
    return JSONResponse(
        status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
        content=error_payload.model_dump(mode="json"),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc), exc_info=True)
    error_payload = ErrorResponse(
        error_code="INTERNAL_SERVER_ERROR",
        message="An unexpected internal server error occurred.",
        details={"error": str(exc)} if settings.DEBUG else None,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_payload.model_dump(mode="json"),
    )


# Root Endpoint
@app.get("/", tags=["System"], summary="Root Information")
async def root():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "status": "online",
        "api_v1": f"{settings.API_V1_PREFIX}/",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        },
    }


# Mount Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

