import uuid
import zoneinfo
from datetime import date, datetime, time
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.timezones import COMMON_IANA_TIMEZONES
from app.db.models.birth_profile import Ayanamsha, BirthTimeAccuracy


def validate_iana_timezone(v: Optional[str]) -> Optional[str]:
    """Validate that the string is a valid IANA timezone identifier."""
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None

    # 1. Primary verification via zoneinfo if database is available
    if len(zoneinfo.available_timezones()) > 0:
        try:
            zoneinfo.ZoneInfo(v)
            return v
        except (zoneinfo.ZoneInfoNotFoundError, ValueError, KeyError):
            raise ValueError(
                f"Invalid IANA timezone identifier '{v}'. Expected format like 'Asia/Kolkata', 'America/New_York', or 'UTC'."
            )

    # 2. Reference verification via standard IANA timezone set (e.g. Windows without tzdata package)
    if v in COMMON_IANA_TIMEZONES:
        return v

    try:
        zoneinfo.ZoneInfo(v)
        return v
    except (zoneinfo.ZoneInfoNotFoundError, ValueError, KeyError):
        raise ValueError(
            f"Invalid IANA timezone identifier '{v}'. Expected format like 'Asia/Kolkata', 'America/New_York', or 'UTC'."
        )


def validate_birth_date(v: Optional[date]) -> Optional[date]:
    """Ensure birth date is not in the future."""
    if v is not None and v > date.today():
        raise ValueError("Date of birth cannot be in the future.")
    return v


def validate_geo_latitude(v: Optional[Decimal]) -> Optional[Decimal]:
    """Ensure latitude is between -90.0 and 90.0 degrees."""
    if v is not None and not (-90.0 <= float(v) <= 90.0):
        raise ValueError("Latitude must be between -90.0 and 90.0 degrees.")
    return v


def validate_geo_longitude(v: Optional[Decimal]) -> Optional[Decimal]:
    """Ensure longitude is between -180.0 and 180.0 degrees."""
    if v is not None and not (-180.0 <= float(v) <= 180.0):
        raise ValueError("Longitude must be between -180.0 and 180.0 degrees.")
    return v


class BirthProfileBase(BaseModel):
    """Shared birth profile properties."""

    profile_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="User-defined label for the profile (e.g. 'My Birth Chart', 'Spouse')",
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Full legal or native birth name",
    )
    date_of_birth: date = Field(..., description="Date of birth (YYYY-MM-DD)")
    time_of_birth: Optional[time] = Field(
        default=None,
        description="Exact or approximate birth time (HH:MM:SS or HH:MM). Must be null if accuracy is 'unknown'.",
    )
    birth_time_accuracy: BirthTimeAccuracy = Field(
        default=BirthTimeAccuracy.EXACT,
        description="Accuracy of birth time: 'exact', 'approximate', or 'unknown'",
    )
    birth_place: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Human-readable birth location text (e.g. 'Varanasi, Uttar Pradesh, India')",
    )
    latitude: Optional[Decimal] = Field(
        default=None,
        description="Geographic latitude coordinate (-90.0 to 90.0)",
    )
    longitude: Optional[Decimal] = Field(
        default=None,
        description="Geographic longitude coordinate (-180.0 to 180.0)",
    )
    timezone: Optional[str] = Field(
        default=None,
        description="Valid IANA timezone identifier (e.g. 'Asia/Kolkata')",
    )
    ayanamsha: Ayanamsha = Field(
        default=Ayanamsha.LAHIRI,
        description="Vedic ayanamsha calculation preference ('lahiri', 'raman', 'kp')",
    )
    is_default: bool = Field(
        default=False,
        description="Whether this profile is the user's primary default birth profile",
    )

    @field_validator("date_of_birth")
    @classmethod
    def check_dob(cls, v: date) -> date:
        return validate_birth_date(v)  # type: ignore

    @field_validator("latitude")
    @classmethod
    def check_lat(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        return validate_geo_latitude(v)

    @field_validator("longitude")
    @classmethod
    def check_lon(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        return validate_geo_longitude(v)

    @field_validator("timezone")
    @classmethod
    def check_tz(cls, v: Optional[str]) -> Optional[str]:
        return validate_iana_timezone(v)


class BirthProfileCreate(BirthProfileBase):
    """Payload for creating a new birth profile. Extra fields including user_id are forbidden."""

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_birth_time_rules(self) -> "BirthProfileCreate":
        if self.birth_time_accuracy == BirthTimeAccuracy.EXACT and self.time_of_birth is None:
            raise ValueError("time_of_birth is required when birth_time_accuracy is 'exact'.")
        if self.birth_time_accuracy == BirthTimeAccuracy.UNKNOWN and self.time_of_birth is not None:
            raise ValueError("time_of_birth must be null when birth_time_accuracy is 'unknown'.")
        return self


class BirthProfileUpdate(BaseModel):
    """Payload for updating an existing birth profile. Extra fields including user_id are forbidden."""

    model_config = ConfigDict(extra="forbid")

    profile_name: Optional[str] = Field(None, min_length=1, max_length=100)
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)
    date_of_birth: Optional[date] = None
    time_of_birth: Optional[time] = None
    birth_time_accuracy: Optional[BirthTimeAccuracy] = None
    birth_place: Optional[str] = Field(None, min_length=1, max_length=255)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: Optional[str] = None
    ayanamsha: Optional[Ayanamsha] = None
    is_default: Optional[bool] = None

    @field_validator("date_of_birth")
    @classmethod
    def check_dob(cls, v: Optional[date]) -> Optional[date]:
        return validate_birth_date(v)

    @field_validator("latitude")
    @classmethod
    def check_lat(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        return validate_geo_latitude(v)

    @field_validator("longitude")
    @classmethod
    def check_lon(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        return validate_geo_longitude(v)

    @field_validator("timezone")
    @classmethod
    def check_tz(cls, v: Optional[str]) -> Optional[str]:
        return validate_iana_timezone(v)

    @model_validator(mode="after")
    def validate_update_time_rules(self) -> "BirthProfileUpdate":
        if (
            self.birth_time_accuracy == BirthTimeAccuracy.EXACT
            and "time_of_birth" in self.model_fields_set
            and self.time_of_birth is None
        ):
            raise ValueError("time_of_birth is required when birth_time_accuracy is 'exact'.")
        if (
            self.birth_time_accuracy == BirthTimeAccuracy.UNKNOWN
            and self.time_of_birth is not None
        ):
            raise ValueError("time_of_birth must be null when birth_time_accuracy is 'unknown'.")
        return self


class BirthProfileDefaultUpdate(BaseModel):
    """Payload for updating default status of a birth profile."""

    model_config = ConfigDict(extra="forbid")
    is_default: bool = Field(default=True, description="Set as primary default profile")


class BirthProfileResponse(BaseModel):
    """Detailed safe representation of a user's birth profile."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Unique profile identifier")
    user_id: uuid.UUID = Field(..., description="Owner user identifier")
    profile_name: str
    full_name: str
    date_of_birth: date
    time_of_birth: Optional[time] = None
    birth_time_accuracy: str
    birth_place: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: Optional[str] = None
    ayanamsha: str
    is_default: bool
    created_at: datetime
    updated_at: datetime


class BirthProfileListResponse(BaseModel):
    """Collection wrapper for listing birth profiles."""

    profiles: List[BirthProfileResponse] = Field(..., description="List of birth profiles")
    total: int = Field(..., description="Total count of owned birth profiles")


class BirthProfileMessageResponse(BaseModel):
    """Standard operation message response."""

    status: str = Field(default="success", description="Status indicator")
    message: str = Field(..., description="Human-readable confirmation message")

