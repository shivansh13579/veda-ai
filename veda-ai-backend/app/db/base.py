from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base Declarative Class for all SQLAlchemy models.
    Ensures model metadata is discoverable by Alembic.
    """
    pass


class TimestampMixin:
    """Reusable mixin providing created_at and updated_at timezone-aware timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# Import models so Base.metadata is fully populated for Alembic autogenerate
from app.db.models import user, refresh_session, password_reset_token, birth_profile  # noqa: E402, F401

