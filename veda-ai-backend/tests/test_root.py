import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Verify system root endpoint returns active status and docs URLs."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "app_name" in data
    assert "version" in data
    assert "documentation" in data
    assert data["documentation"]["swagger"] == "/docs"
    assert data["documentation"]["redoc"] == "/redoc"


@pytest.mark.asyncio
async def test_api_v1_root_endpoint(async_client: AsyncClient):
    """Verify versioned /api/v1/ root endpoint returns metadata."""
    response = await async_client.get("/api/v1/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert data["api_v1_prefix"] == "/api/v1"
    assert "documentation_urls" in data


@pytest.mark.asyncio
async def test_openapi_json(async_client: AsyncClient):
    """Verify OpenAPI JSON specification is generated."""
    response = await async_client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert data["info"]["title"] == "Veda AI Backend API"
    assert data["info"]["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_swagger_and_redoc_docs(async_client: AsyncClient):
    """Verify Swagger UI and ReDoc HTML documentation endpoints."""
    swagger_res = await async_client.get("/docs")
    assert swagger_res.status_code == 200
    assert "swagger-ui" in swagger_res.text.lower()

    redoc_res = await async_client.get("/redoc")
    assert redoc_res.status_code == 200
    assert "redoc" in redoc_res.text.lower()
