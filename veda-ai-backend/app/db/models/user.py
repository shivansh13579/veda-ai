import enum
import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import Boolean, CheckConstraint, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.refresh_session import RefreshSession
    from app.db.models.password_reset_token import PasswordResetToken
    from app.db.models.birth_profile import BirthProfile


class UserRole(str, enum.Enum):
    CLIENT = "client"
    ASTROLOGER = "astrologer"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    """
    SQLAlchemy model representing application users across all roles (Client, Astrologer, Admin).
    """

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('client', 'astrologer', 'admin')", name="ck_users_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50),
        default=UserRole.CLIENT.value,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    refresh_sessions: Mapped[List["RefreshSession"]] = relationship(
        "RefreshSession",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    password_reset_tokens: Mapped[List["PasswordResetToken"]] = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    birth_profiles: Mapped[List["BirthProfile"]] = relationship(
        "BirthProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
