from unittest.mock import patch
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_healthy(async_client: AsyncClient):
    """Verify health endpoint returns 200 OK when database probe succeeds."""
    mock_probe = {
        "connected": True,
        "latency_ms": 1.45,
        "error": None,
    }

    with patch("app.api.v1.endpoints.health.check_db_connectivity", return_value=mock_probe):
        response = await async_client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert data["database_latency_ms"] == 1.45
        assert "timestamp" in data
        assert data["detail"] is None


@pytest.mark.asyncio
async def test_health_check_unhealthy(async_client: AsyncClient):
    """Verify health endpoint returns 503 Service Unavailable when database probe fails."""
    mock_probe = {
        "connected": False,
        "latency_ms": 12.3,
        "error": "Connection refused to PostgreSQL host",
    }

    with patch("app.api.v1.endpoints.health.check_db_connectivity", return_value=mock_probe):
        response = await async_client.get("/api/v1/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"
        assert "Database unreachable" in data["detail"]


@pytest.mark.asyncio
async def test_live_db_connectivity_failure_handled():
    """Verify check_db_connectivity gracefully handles uncontactable database without crashing."""
    from app.db.session import check_db_connectivity

    result = await check_db_connectivity()
    assert isinstance(result, dict)
    assert "connected" in result
    assert "latency_ms" in result
    assert "error" in result
    # In an environment without active PostgreSQL, it must report connected=False gracefully
    if not result["connected"]:
        assert result["error"] is not None

