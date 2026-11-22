from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for health check endpoint."""

    status: str = Field(..., description="Overall service status (healthy/unhealthy)")
    app_name: str = Field(..., description="Name of the application")
    version: str = Field(..., description="Service semantic version")
    environment: str = Field(..., description="Active runtime environment")
    database: str = Field(..., description="Database connection state (connected/disconnected)")
    database_latency_ms: Optional[float] = Field(
        None, description="Roundtrip query response time in milliseconds"
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC probe execution timestamp",
    )
    detail: Optional[str] = Field(None, description="Diagnostic error detail if degraded")


class RootResponse(BaseModel):
    """Schema for root API endpoint."""

    app_name: str
    version: str
    environment: str
    status: str = "active"
    api_v1_prefix: str
    documentation_urls: dict
