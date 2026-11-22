from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PlanetaryPosition(BaseModel):
    """Calculated sidereal position and astronomical metrics for a single celestial body."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable celestial body identifier (e.g. 'sun', 'moon')")
    planet_name: str = Field(..., description="English common name (e.g. 'Sun', 'Moon')")
    sanskrit_name: str = Field(..., description="Vedic Sanskrit designation (e.g. 'Surya', 'Chandra')")
    longitude: float = Field(..., description="Normalized sidereal longitude [0.0, 360.0) degrees")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number (1=Aries to 12=Pisces)")
    sign_name: str = Field(..., description="English zodiac sign name (e.g. 'Virgo')")
    sign_sanskrit: str = Field(..., description="Sanskrit Rashi name (e.g. 'Kanya')")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Decimal degree within sign [0.0, 30.0)")
    degree: int = Field(..., ge=0, le=29, description="Integer degrees component (0 to 29)")
    minutes: int = Field(..., ge=0, le=59, description="Integer arcminutes component (0 to 59)")
    seconds: float = Field(..., ge=0.0, lt=60.0, description="Arcseconds component (0.00 to 59.99)")
    formatted_dms: str = Field(..., description="Human-readable DMS representation (e.g. 26° 41' 00.12\")")
    speed_longitude: float = Field(..., description="Daily longitudinal speed in degrees/day")
    is_retrograde: bool = Field(..., description="True if planetary longitudinal speed is negative (Vakri)")
    latitude: Optional[float] = Field(None, description="Ecliptic celestial latitude in degrees")
    distance_au: Optional[float] = Field(None, description="Distance from Earth in Astronomical Units (AU)")


class CalculationMetadata(BaseModel):
    """Detailed metadata accompanying every astrological calculation."""

    model_config = ConfigDict(from_attributes=True)

    astrology_system: str = Field(default="vedic", description="Astrology methodology ('vedic')")
    zodiac_type: str = Field(default="sidereal", description="Zodiac reference frame ('sidereal')")
    ayanamsha: str = Field(..., description="Selected sidereal ayanamsha system (e.g. 'lahiri')")
    ayanamsha_value: float = Field(..., description="Computed ayanamsha offset value in decimal degrees")
    house_system: str = Field(default="whole_sign", description="House calculation method (metadata)")
    ephemeris_engine: str = Field(default="swiss_ephemeris", description="Underlying astronomical computation engine")
    ephemeris_version: Optional[str] = Field(None, description="Version of the ephemeris library")
    calculation_timestamp: datetime = Field(..., description="UTC timestamp when computation occurred")
    birth_datetime_utc: datetime = Field(..., description="Exact birth instant in Universal Time (UTC)")
    birth_datetime_local: str = Field(..., description="Original localized birth date and time string")
    input_timezone: str = Field(..., description="IANA timezone identifier utilized for conversion")
    julian_day_ut: float = Field(..., description="Universal Time Julian Day used for planetary calculations")
    birth_time_accuracy: str = Field(..., description="Accuracy status: 'exact', 'approximate', or 'unknown'")
    node_type: str = Field(..., description="Node convention used for Rahu and Ketu ('true' or 'mean')")
    calculation_flags: int = Field(..., description="Bitwise Swiss Ephemeris calculation flags")
    warnings: List[str] = Field(default_factory=list, description="Operational warnings or precision caveats")


class PlanetaryPositionsResponse(BaseModel):
    """Complete planetary chart calculation result."""

    planets: List[PlanetaryPosition] = Field(..., description="Positions for all supported celestial bodies")
    metadata: CalculationMetadata = Field(..., description="Complete audit and calculation metadata")


class AstrologyEngineStatusResponse(BaseModel):
    """Diagnostic health and configuration status of the Astrology Engine."""

    engine_name: str = Field(..., description="Name of the astronomical ephemeris engine")
    engine_available: bool = Field(..., description="Whether Swiss Ephemeris bindings are active")
    engine_version: Optional[str] = Field(None, description="Library version string")
    astrology_system: str = Field(..., description="Configured default astrology system")
    zodiac_type: str = Field(..., description="Configured default zodiac type")
    default_ayanamsha: str = Field(..., description="Configured default ayanamsha system")
    default_house_system: str = Field(..., description="Configured default house system")
    node_type: str = Field(..., description="Configured default lunar node convention")
    ephemeris_path_configured: bool = Field(..., description="Whether custom ephemeris directory is configured")
    ephemeris_files_available: bool = Field(..., description="Whether .se1 high-precision files are present")
    ephemeris_mode: str = Field(..., description="'high_precision_se1' or 'moshier_analytical'")
    supported_celestial_bodies: List[str] = Field(..., description="List of supported planet identifiers")
    supported_ayanamshas: List[str] = Field(..., description="List of supported ayanamsha systems")

