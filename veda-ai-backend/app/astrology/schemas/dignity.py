from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field

from app.astrology.schemas.planetary import CalculationMetadata


class CombustionDetail(BaseModel):
    """Details regarding planetary combustion (Asta) by the Sun."""

    model_config = ConfigDict(from_attributes=True)

    is_combust: bool = Field(..., description="Whether the planet is currently combust (Asta)")
    angular_separation: Optional[float] = Field(
        default=None, description="Minimum geodesic angular separation from the Sun in degrees"
    )
    combustion_threshold: Optional[float] = Field(
        default=None, description="Maximum threshold arc in degrees within which combustion occurs"
    )
    is_applicable: bool = Field(
        ..., description="Whether combustion rules apply to this celestial body (false for Sun, Rahu, Ketu)"
    )
    explanation: str = Field(..., description="Technical explanation of the combustion status")


class PlanetDignityDetail(BaseModel):
    """Comprehensive Vedic dignity and combustion evaluation for a celestial Graha."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable planet identifier (e.g. 'jupiter')")
    planet_name: str = Field(..., description="English common name (e.g. 'Jupiter')")
    sanskrit_name: str = Field(..., description="Classical Sanskrit name (e.g. 'Guru')")
    longitude: float = Field(..., description="Normalized sidereal longitude in degrees [0.0, 360.0)")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="English zodiac sign name")
    sign_sanskrit: str = Field(..., description="Sanskrit Rashi name")
    sign_lord: str = Field(..., description="Ruler of the occupied zodiac sign")
    sign_lord_id: str = Field(..., description="Machine-readable ruler ID")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within sign [0.0, 30.0)")
    formatted_dms: str = Field(..., description="DMS string representation within sign")
    is_retrograde: bool = Field(..., description="Whether the planet is retrograde (Vakri)")
    dignity: str = Field(
        ..., description="Classical dignity classification (exalted, moolatrikona, own_sign, friendly_sign, neutral_sign, enemy_sign, debilitated)"
    )
    sanskrit_dignity: str = Field(
        ..., description="Vedic Sanskrit dignity name (Uccha, Moolatrikona, Swakshetra, Mitra Kshetra, Sama Kshetra, Shatru Kshetra, Neecha)"
    )
    param_degree: Optional[float] = Field(
        default=None, description="Deep exaltation (Param Uccha) or debilitation (Param Neecha) reference degree"
    )
    distance_from_param_degree: Optional[float] = Field(
        default=None, description="Angular distance from the deep exaltation or debilitation point"
    )
    combustion: CombustionDetail = Field(..., description="Combustion (Asta) assessment relative to the Sun")
    explanation: str = Field(..., description="Concise rationale for the assigned dignity and relationship")


class PlanetaryDignitiesResponse(BaseModel):
    """API response model for planetary dignities and combustion analysis."""

    model_config = ConfigDict(from_attributes=True)

    birth_profile_id: uuid.UUID = Field(..., description="Unique ID of the evaluated birth profile")
    planets: List[PlanetDignityDetail] = Field(..., description="Dignity and combustion metrics for all 9 Navagrahas")
    metadata: CalculationMetadata = Field(..., description="Astronomical calculation and ephemeris metadata")

