from typing import Any, Dict, Optional
from fastapi import status

from app.core.exceptions import AppException


class AstrologyError(AppException):
    """Base exception for all astrology and astronomical engine errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "ASTROLOGY_ENGINE_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status_code,
            error_code=error_code,
            details=details,
        )


class EphemerisUnavailableError(AstrologyError):
    """Raised when Swiss Ephemeris data files are missing or ephemeris path is inaccessible."""

    def __init__(
        self,
        message: str = "Swiss Ephemeris data files are unavailable or missing from the configured path.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="EPHEMERIS_UNAVAILABLE",
            details=details,
        )


class AstrologyCalculationError(AstrologyError):
    """Raised when astronomical coordinate or planetary position calculations fail."""

    def __init__(
        self,
        message: str = "Astrological calculation could not be completed.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="CALCULATION_ERROR",
            details=details,
        )


class InvalidBirthDateTimeError(AstrologyError):
    """Raised when birth date or time inputs are chronologically impossible or invalid."""

    def __init__(
        self,
        message: str = "Invalid birth date or time provided.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_BIRTH_DATETIME",
            details=details,
        )


class UnknownBirthTimeError(AstrologyError):
    """Raised when an exact planetary calculation is requested for a birth profile with unknown birth time."""

    def __init__(
        self,
        message: str = "Cannot calculate exact planetary positions: birth time is unknown. An exact birth time is required for planetary degrees.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=422,
            error_code="UNKNOWN_BIRTH_TIME",
            details=details,
        )


class UnsupportedAyanamshaError(AstrologyError):
    """Raised when an unrecognized or unsupported ayanamsha system is requested."""

    def __init__(
        self,
        message: str = "Requested ayanamsha system is not supported.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="UNSUPPORTED_AYANAMSHA",
            details=details,
        )


class InvalidTimezoneError(AstrologyError):
    """Raised when a timezone identifier is missing, invalid, or unrecognized."""

    def __init__(
        self,
        message: str = "Invalid or unrecognized IANA timezone identifier.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_TIMEZONE",
            details=details,
        )


class InvalidCoordinatesError(AstrologyError):
    """Raised when latitude or longitude coordinates are missing or out of valid bounds."""

    def __init__(
        self,
        message: str = "Invalid or missing geographic coordinates (latitude and longitude required).",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_COORDINATES",
            details=details,
        )


