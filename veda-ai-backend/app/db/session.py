import time
from typing import Any, AsyncGenerator, Dict
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

# Async Engine with Connection Pooling and Health Pre-ping
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and not settings.is_production,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Async Session Factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session.
    Automatically handles commit/rollback and ensures session closure.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db_connectivity() -> Dict[str, Any]:
    """
    Executes a lightweight query (SELECT 1) to verify database responsiveness.
    Returns connectivity status and latency metrics.
    """
    start_time = time.perf_counter()
    try:
        async with async_session_maker() as session:
            result = await session.execute(text("SELECT 1"))
            val = result.scalar()
            latency = (time.perf_counter() - start_time) * 1000
            if val == 1:
                return {
                    "connected": True,
                    "latency_ms": round(latency, 2),
                    "error": None,
                }
            return {
                "connected": False,
                "latency_ms": round(latency, 2),
                "error": "Unexpected probe return value.",
            }
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000
        return {
            "connected": False,
            "latency_ms": round(latency, 2),
            "error": str(exc),
        }

