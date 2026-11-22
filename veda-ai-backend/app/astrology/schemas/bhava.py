from typing import List
from pydantic import BaseModel, ConfigDict, Field

from app.astrology.schemas.ascendant import AscendantDetail, NakshatraInfo
from app.astrology.schemas.planetary import CalculationMetadata


class PlanetInHouse(BaseModel):
    """Concise representation of a celestial body residing in a specific Bhava."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable planet identifier (e.g. 'sun')")
    planet_name: str = Field(..., description="English common name (e.g. 'Sun')")
    sanskrit_name: str = Field(..., description="Vedic Sanskrit designation (e.g. 'Surya')")
    longitude: float = Field(..., description="Normalized sidereal longitude [0.0, 360.0)")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="English zodiac sign name")
    sign_sanskrit: str = Field(..., description="Sanskrit sign name")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within sign [0.0, 30.0)")
    formatted_dms: str = Field(..., description="Human-readable DMS position")
    is_retrograde: bool = Field(..., description="Whether the planet is retrograde (Vakri)")
    nakshatra_number: int = Field(..., ge=1, le=27, description="Nakshatra number (1 to 27)")
    nakshatra_name: str = Field(..., description="Nakshatra name (e.g. 'Chitra')")
    pada: int = Field(..., ge=1, le=4, description="Nakshatra quarter Pada (1 to 4)")
    nakshatra_lord: str = Field(..., description="Vimshottari ruler name")
    nakshatra_lord_id: str = Field(..., description="Vimshottari ruler identifier")


class BhavaDetail(BaseModel):
    """A single astrological house (Bhava) in the Whole Sign house system."""

    model_config = ConfigDict(from_attributes=True)

    house_number: int = Field(..., ge=1, le=12, description="House number from 1 to 12")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number of this house (1 to 12)")
    sign_name: str = Field(..., description="English zodiac sign name")
    sign_sanskrit: str = Field(..., description="Sanskrit sign name")
    house_lord: str = Field(..., description="Lord of the sign governing this house (e.g. 'Venus')")
    house_lord_id: str = Field(..., description="Machine-readable lord ID (e.g. 'venus')")
    is_ascendant_house: bool = Field(..., description="True if this is the 1st house / Lagna Bhava")
    start_degree: float = Field(..., ge=0.0, lt=360.0, description="Start longitude of house in ecliptic")
    end_degree: float = Field(..., ge=0.0, le=360.0, description="End longitude of house in ecliptic")
    planets: List[PlanetInHouse] = Field(default_factory=list, description="Planets positioned inside this house")


class HouseChartResponse(BaseModel):
    """Complete 12-house chart response."""

    houses: List[BhavaDetail] = Field(..., description="12 Whole Sign Bhavas with assigned planets")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")


class PlanetHousePlacement(BaseModel):
    """Comprehensive position, house placement, and Nakshatra metrics for a single planet."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable planet identifier (e.g. 'mars')")
    planet_name: str = Field(..., description="English common name (e.g. 'Mars')")
    sanskrit_name: str = Field(..., description="Vedic Sanskrit designation (e.g. 'Mangala')")
    longitude: float = Field(..., description="Normalized sidereal longitude [0.0, 360.0)")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="English zodiac sign name")
    sign_sanskrit: str = Field(..., description="Sanskrit sign name")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within sign [0.0, 30.0)")
    degree: int = Field(..., ge=0, le=29, description="Degrees component")
    minutes: int = Field(..., ge=0, le=59, description="Arcminutes component")
    seconds: float = Field(..., ge=0.0, lt=60.0, description="Arcseconds component")
    formatted_dms: str = Field(..., description="DMS string in sign")
    speed_longitude: float = Field(..., description="Daily speed in degrees/day")
    is_retrograde: bool = Field(..., description="True if retrograde")
    house_number: int = Field(..., ge=1, le=12, description="Whole Sign house placement (1 to 12)")
    nakshatra: NakshatraInfo = Field(..., description="Nakshatra, Pada, and Lord")


class PlanetaryPlacementsResponse(BaseModel):
    """Response containing all nine Navagrahas with house placements and Nakshatra details."""

    placements: List[PlanetHousePlacement] = Field(..., description="All planetary house placements")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")


class LagnaChartResponse(BaseModel):
    """Unified D1 Lagna Chart response uniting Ascendant, 12 Bhavas, and Planetary Placements."""

    ascendant: AscendantDetail = Field(..., description="Ascendant (Lagna) details")
    houses: List[BhavaDetail] = Field(..., description="12 Whole Sign Bhavas with occupying planets")
    planetary_placements: List[PlanetHousePlacement] = Field(..., description="Planetary positions with house numbers")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")

