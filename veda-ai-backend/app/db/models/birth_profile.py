import enum
import uuid
from datetime import date, time
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
import sqlalchemy as sa
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Numeric,
    String,
    Time,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.user import User


class BirthTimeAccuracy(str, enum.Enum):
    EXACT = "exact"
    APPROXIMATE = "approximate"
    UNKNOWN = "unknown"


class Ayanamsha(str, enum.Enum):
    LAHIRI = "lahiri"
    RAMAN = "raman"
    KP = "kp"


class BirthProfile(Base, TimestampMixin):
    """
    SQLAlchemy model representing a user's saved Vedic birth profile.
    Stores native birth details, coordinates, timezone, and ayanamsha preference.
    Calculated Kundli charts/astronomical data are strictly excluded.
    """

    __tablename__ = "birth_profiles"
    __table_args__ = (
        CheckConstraint(
            "birth_time_accuracy IN ('exact', 'approximate', 'unknown')",
            name="ck_birth_profiles_accuracy",
        ),
        CheckConstraint(
            "ayanamsha IN ('lahiri', 'raman', 'kp')",
            name="ck_birth_profiles_ayanamsha",
        ),
        CheckConstraint(
            "latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)",
            name="ck_birth_profiles_latitude",
        ),
        CheckConstraint(
            "longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)",
            name="ck_birth_profiles_longitude",
        ),
        # Partial unique index enforcing at most one default profile per user
        Index(
            "uq_birth_profiles_user_default",
            "user_id",
            unique=True,
            postgresql_where=sa.text("is_default = true"),
            sqlite_where=sa.text("is_default = 1"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    profile_name: Mapped[str] = mapped_column(String(100), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    time_of_birth: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    birth_time_accuracy: Mapped[str] = mapped_column(
        String(20),
        default=BirthTimeAccuracy.EXACT.value,
        nullable=False,
    )
    birth_place: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ayanamsha: Mapped[str] = mapped_column(
        String(20),
        default=Ayanamsha.LAHIRI.value,
        nullable=False,
    )
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="birth_profiles")

