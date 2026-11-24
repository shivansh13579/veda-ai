from typing import List
from pydantic import BaseModel, ConfigDict, Field

from app.astrology.schemas.ascendant import AscendantDetail, NakshatraInfo
from app.astrology.schemas.bhava import BhavaDetail, PlanetHousePlacement
from app.astrology.schemas.planetary import CalculationMetadata


class D1ChartResponse(BaseModel):
    """Structured D1 Rashi (Natal) Chart response."""

    model_config = ConfigDict(from_attributes=True)

    chart_type: str = Field(default="D1", description="Divisional chart identifier ('D1')")
    chart_name: str = Field(default="Rashi", description="Traditional Vedic name ('Rashi')")
    ascendant: AscendantDetail = Field(..., description="Sidereal Ascendant (Lagna) metrics")
    houses: List[BhavaDetail] = Field(..., description="Twelve Whole Sign Bhavas with occupying Grahas")
    planetary_placements: List[PlanetHousePlacement] = Field(..., description="Planetary positions with house numbers")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")


class D9AscendantDetail(BaseModel):
    """Calculated D9 Navamsa Ascendant (Navamsa Lagna) metrics."""

    model_config = ConfigDict(from_attributes=True)

    sign_number: int = Field(..., ge=1, le=12, description="D9 zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="D9 English zodiac sign name (e.g. 'Sagittarius')")
    sign_sanskrit: str = Field(..., description="D9 Sanskrit Rashi name (e.g. 'Dhanu')")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within D9 sign [0.0, 30.0)")
    degree: int = Field(..., ge=0, le=29, description="Degrees component in D9")
    minutes: int = Field(..., ge=0, le=59, description="Arcminutes component in D9")
    seconds: float = Field(..., ge=0.0, lt=60.0, description="Arcseconds component in D9")
    formatted_dms: str = Field(..., description="Human-readable DMS representation in D9")
    longitude: float = Field(..., description="Ecliptic longitude in D9 framework [0.0, 360.0)")
    navamsa_number: int = Field(..., ge=1, le=9, description="Navamsa division number (1 to 9)")
    navamsa_start_sign: int = Field(..., ge=1, le=12, description="Starting sign for the Navamsa sequence")
    sign_modality: str = Field(..., description="Modality of D1 sign: 'movable', 'fixed', or 'dual'")
    d1_longitude: float = Field(..., description="Original D1 sidereal longitude [0.0, 360.0)")
    d1_sign_number: int = Field(..., ge=1, le=12, description="Original D1 zodiac sign number")
    d1_sign_name: str = Field(..., description="Original D1 sign name")
    d1_sign_sanskrit: str = Field(..., description="Original D1 Sanskrit sign name")
    d1_degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Original D1 degree in sign")
    d1_formatted_dms: str = Field(..., description="Original D1 DMS string")
    nakshatra: NakshatraInfo = Field(..., description="Nakshatra, Pada, and Lord of the Ascendant")


class D9PlanetInHouse(BaseModel):
    """Concise representation of a planet occupying a D9 Navamsa Bhava."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable planet identifier (e.g. 'sun')")
    planet_name: str = Field(..., description="English common name (e.g. 'Sun')")
    sanskrit_name: str = Field(..., description="Vedic Sanskrit designation (e.g. 'Surya')")
    sign_number: int = Field(..., ge=1, le=12, description="D9 zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="D9 English zodiac sign name")
    sign_sanskrit: str = Field(..., description="D9 Sanskrit sign name")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within D9 sign [0.0, 30.0)")
    formatted_dms: str = Field(..., description="Human-readable DMS position in D9")
    is_retrograde: bool = Field(..., description="Whether the planet is retrograde (Vakri)")
    navamsa_number: int = Field(..., ge=1, le=9, description="Navamsa division number (1 to 9)")
    d1_longitude: float = Field(..., description="Original D1 sidereal longitude")
    d1_sign_number: int = Field(..., ge=1, le=12, description="Original D1 sign number")
    d1_sign_name: str = Field(..., description="Original D1 sign name")
    d1_degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Original D1 degree in sign")
    nakshatra_name: str = Field(..., description="Nakshatra name")
    pada: int = Field(..., ge=1, le=4, description="Nakshatra Pada quarter (1 to 4)")


class D9BhavaDetail(BaseModel):
    """A single astrological house (Bhava) in the D9 Navamsa Whole Sign system."""

    model_config = ConfigDict(from_attributes=True)

    house_number: int = Field(..., ge=1, le=12, description="D9 house number from 1 to 12")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number of this D9 house (1 to 12)")
    sign_name: str = Field(..., description="D9 English zodiac sign name")
    sign_sanskrit: str = Field(..., description="D9 Sanskrit sign name")
    house_lord: str = Field(..., description="Lord of the sign governing this D9 house (e.g. 'Jupiter')")
    house_lord_id: str = Field(..., description="Machine-readable lord ID (e.g. 'jupiter')")
    is_ascendant_house: bool = Field(..., description="True if this is the 1st house / Navamsa Lagna")
    start_degree: float = Field(..., ge=0.0, lt=360.0, description="Start longitude of house")
    end_degree: float = Field(..., ge=0.0, le=360.0, description="End longitude of house")
    planets: List[D9PlanetInHouse] = Field(default_factory=list, description="Planets positioned inside this D9 house")


class D9PlanetPlacement(BaseModel):
    """Comprehensive D9 Navamsa placement, house assignment, and original D1 metrics for a planet."""

    model_config = ConfigDict(from_attributes=True)

    planet_id: str = Field(..., description="Machine-readable planet identifier (e.g. 'sun')")
    planet_name: str = Field(..., description="English common name (e.g. 'Sun')")
    sanskrit_name: str = Field(..., description="Vedic Sanskrit designation (e.g. 'Surya')")
    sign_number: int = Field(..., ge=1, le=12, description="D9 zodiac sign number (1 to 12)")
    sign_name: str = Field(..., description="D9 English zodiac sign name")
    sign_sanskrit: str = Field(..., description="D9 Sanskrit sign name")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Degree within D9 sign [0.0, 30.0)")
    degree: int = Field(..., ge=0, le=29, description="Degrees component in D9")
    minutes: int = Field(..., ge=0, le=59, description="Arcminutes component in D9")
    seconds: float = Field(..., ge=0.0, lt=60.0, description="Arcseconds component in D9")
    formatted_dms: str = Field(..., description="DMS string in D9 sign")
    longitude: float = Field(..., description="Ecliptic longitude in D9 framework")
    house_number: int = Field(..., ge=1, le=12, description="D9 Whole Sign house placement (1 to 12)")
    house_lord: str = Field(..., description="Lord of the occupying D9 house sign")
    house_lord_id: str = Field(..., description="Machine-readable lord ID")
    navamsa_number: int = Field(..., ge=1, le=9, description="Navamsa division (1 to 9)")
    navamsa_start_sign: int = Field(..., ge=1, le=12, description="Starting sign for Navamsa cycle")
    sign_modality: str = Field(..., description="Modality of original D1 sign ('movable', 'fixed', 'dual')")
    is_retrograde: bool = Field(..., description="Whether the planet is retrograde (preserved from D1)")
    d1_longitude: float = Field(..., description="Original D1 sidereal longitude [0.0, 360.0)")
    d1_sign_number: int = Field(..., ge=1, le=12, description="Original D1 zodiac sign number")
    d1_sign_name: str = Field(..., description="Original D1 zodiac sign name")
    d1_sign_sanskrit: str = Field(..., description="Original D1 Sanskrit sign name")
    d1_degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Original D1 degree in sign")
    d1_formatted_dms: str = Field(..., description="Original D1 DMS string")
    d1_house_number: int = Field(..., ge=1, le=12, description="Original D1 house placement")
    nakshatra: NakshatraInfo = Field(..., description="Nakshatra, Pada, and Lord")


class D9ChartResponse(BaseModel):
    """Complete D9 Navamsa Chart response uniting Navamsa Lagna, 12 D9 Bhavas, and D9 Placements."""

    model_config = ConfigDict(from_attributes=True)

    chart_type: str = Field(default="D9", description="Divisional chart identifier ('D9')")
    chart_name: str = Field(default="Navamsa", description="Traditional Vedic name ('Navamsa')")
    ascendant: D9AscendantDetail = Field(..., description="D9 Navamsa Ascendant (Navamsa Lagna) details")
    houses: List[D9BhavaDetail] = Field(..., description="Twelve Whole Sign Bhavas of D9")
    planetary_placements: List[D9PlanetPlacement] = Field(..., description="D9 planetary placements with D9 house numbers")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")


class DivisionalChartsResponse(BaseModel):
    """Combined response containing both D1 Rashi and D9 Navamsa charts."""

    model_config = ConfigDict(from_attributes=True)

    d1: D1ChartResponse = Field(..., description="D1 Rashi Chart")
    d9: D9ChartResponse = Field(..., description="D9 Navamsa Chart")
    metadata: CalculationMetadata = Field(..., description="Shared calculation and ephemeris metadata")

