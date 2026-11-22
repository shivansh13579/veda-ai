"""create_birth_profiles

Revision ID: 0002_create_birth_profiles
Revises: 0001_initial_auth
Create Date: 2026-11-21 11:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002_create_birth_profiles"
down_revision: Union[str, None] = "0001_initial_auth"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "birth_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("profile_name", sa.String(length=100), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("time_of_birth", sa.Time(), nullable=True),
        sa.Column(
            "birth_time_accuracy",
            sa.String(length=20),
            server_default="exact",
            nullable=False,
        ),
        sa.Column("birth_place", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column("longitude", sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column("timezone", sa.String(length=100), nullable=True),
        sa.Column(
            "ayanamsha",
            sa.String(length=20),
            server_default="lahiri",
            nullable=False,
        ),
        sa.Column("is_default", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "birth_time_accuracy IN ('exact', 'approximate', 'unknown')",
            name="ck_birth_profiles_accuracy",
        ),
        sa.CheckConstraint(
            "ayanamsha IN ('lahiri', 'raman', 'kp')",
            name="ck_birth_profiles_ayanamsha",
        ),
        sa.CheckConstraint(
            "latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)",
            name="ck_birth_profiles_latitude",
        ),
        sa.CheckConstraint(
            "longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)",
            name="ck_birth_profiles_longitude",
        ),
    )

    # Regular lookup index on user_id
    op.create_index(
        op.f("ix_birth_profiles_user_id"),
        "birth_profiles",
        ["user_id"],
        unique=False,
    )

    # Partial unique index enforcing at most one default profile per user
    op.create_index(
        "uq_birth_profiles_user_default",
        "birth_profiles",
        ["user_id"],
        unique=True,
        postgresql_where=sa.text("is_default = true"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_birth_profiles_user_default",
        table_name="birth_profiles",
        postgresql_where=sa.text("is_default = true"),
    )
    op.drop_index(op.f("ix_birth_profiles_user_id"), table_name="birth_profiles")
    op.drop_table("birth_profiles")

