import logging
from typing import List, Dict
from app.core.config import settings

logger = logging.getLogger("veda_ai.email")

# In-memory mailbox for automated testing verification
TEST_OUTBOX: List[Dict[str, str]] = []


class EmailService:
    """Service handling transactional emails (verification, password resets)."""

    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> None:
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        if settings.EMAIL_PROVIDER == "mock" or settings.APP_ENV == "testing":
            TEST_OUTBOX.append({
                "to": email,
                "token": token,
                "reset_link": reset_link,
            })
            logger.info("MOCK EMAIL SENT to %s: Reset Token = %s", email, token)
            return

        if settings.EMAIL_PROVIDER == "console" or settings.DEBUG:
            logger.info("=" * 60)
            logger.info("PASSWORD RESET EMAIL DISPATCH (Development Console)")
            logger.info("To: %s", email)
            logger.info("Reset Link: %s", reset_link)
            logger.info("Raw Token: %s", token)
            logger.info("=" * 60)
            return

        # Production SMTP provider implementation
        logger.warning("SMTP email delivery requested but external SMTP transport not configured.")

