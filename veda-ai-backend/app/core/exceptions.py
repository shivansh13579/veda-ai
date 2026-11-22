from typing import Any, Dict, Optional
from fastapi import status


class AppException(Exception):
    """Base application exception for standardized error reporting."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}


class DatabaseConnectionError(AppException):
    """Raised when the database connection cannot be established or verified."""

    def __init__(
        self,
        message: str = "Database connection unavailable.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="DATABASE_UNAVAILABLE",
            details=details,
        )


class NotFoundError(AppException):
    """Resource not found exception."""

    def __init__(
        self,
        message: str = "Requested resource not found.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            details=details,
        )


class BadRequestError(AppException):
    """Invalid request parameters or payload."""

    def __init__(
        self,
        message: str = "Invalid request.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="BAD_REQUEST",
            details=details,
        )


class InvalidCredentialsError(AppException):
    """Generic invalid credentials error to prevent user enumeration."""

    def __init__(
        self,
        message: str = "Invalid email or password.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_CREDENTIALS",
            details=details,
        )


class TokenExpiredError(AppException):
    """Raised when JWT or refresh token has expired."""

    def __init__(
        self,
        message: str = "Authentication token has expired.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="TOKEN_EXPIRED",
            details=details,
        )


class InvalidTokenError(AppException):
    """Raised when token signature, format, or session is invalid/revoked."""

    def __init__(
        self,
        message: str = "Invalid authentication token.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_TOKEN",
            details=details,
        )


class ForbiddenError(AppException):
    """Insufficient role or permission."""

    def __init__(
        self,
        message: str = "Insufficient permissions for this resource.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
            details=details,
        )


class DuplicateEmailError(AppException):
    """Raised when registering an email that already exists."""

    def __init__(
        self,
        message: str = "An account with this email address already exists.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="DUPLICATE_EMAIL",
            details=details,
        )


class UserInactiveError(AppException):
    """Raised when a deactivated user attempts to authenticate."""

    def __init__(
        self,
        message: str = "User account has been deactivated.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="USER_INACTIVE",
            details=details,
        )
