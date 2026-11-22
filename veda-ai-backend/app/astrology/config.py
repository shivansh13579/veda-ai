from typing import Optional
from pydantic import BaseModel, Field

from app.astrology.constants import AyanamshaSystem, NodeType
from app.core.config import settings


class AstrologyEngineConfig(BaseModel):
    """Centralized configuration for the Vedic Astrology calculation engine."""

    astrology_system: str = Field(
        default_factory=lambda: settings.ASTROLOGY_SYSTEM,
        description="Core astrology system: 'vedic' (Jyotish)",
    )
    zodiac_type: str = Field(
        default_factory=lambda: settings.ASTROLOGY_ZODIAC_TYPE,
        description="Zodiac reference frame: 'sidereal'",
    )
    default_ayanamsha: str = Field(
        default_factory=lambda: settings.ASTROLOGY_DEFAULT_AYANAMSHA,
        description="Default ayanamsha: 'lahiri', 'raman', or 'kp'",
    )
    default_house_system: str = Field(
        default_factory=lambda: settings.ASTROLOGY_DEFAULT_HOUSE_SYSTEM,
        description="Default house system: 'whole_sign'",
    )
    node_type: str = Field(
        default_factory=lambda: settings.ASTROLOGY_NODE_TYPE,
        description="Lunar node calculation mode: 'true' (True Node) or 'mean' (Mean Node)",
    )
    ephemeris_path: Optional[str] = Field(
        default_factory=lambda: settings.SWISS_EPHEMERIS_PATH,
        description="Filesystem directory containing Swiss Ephemeris data files (.se1)",
    )
    require_ephemeris_files: bool = Field(
        default_factory=lambda: settings.ASTROLOGY_REQUIRE_EPHEMERIS_FILES,
        description="Strictly require .se1 files; rejects Moshier analytical fallback if true",
    )
    allow_approximate_time: bool = Field(
        default_factory=lambda: settings.ASTROLOGY_ALLOW_APPROXIMATE_TIME,
        description="Allow calculations when birth time is marked as approximate",
    )


def get_astrology_config() -> AstrologyEngineConfig:
    """Return the current astrology engine configuration instance."""
    return AstrologyEngineConfig()

