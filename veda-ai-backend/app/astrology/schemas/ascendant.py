from pydantic import BaseModel, ConfigDict, Field

from app.astrology.schemas.planetary import CalculationMetadata


class NakshatraInfo(BaseModel):
    """Nakshatra (Lunar Mansion) and Pada details for a celestial position."""

    model_config = ConfigDict(from_attributes=True)

    number: int = Field(..., ge=1, le=27, description="Nakshatra sequence number (1 to 27)")
    name: str = Field(..., description="Vedic name of the Nakshatra (e.g. 'Swati')")
    pada: int = Field(..., ge=1, le=4, description="Pada quarter within the Nakshatra (1 to 4)")
    lord: str = Field(..., description="Vimshottari Dasha ruler of the Nakshatra (e.g. 'Rahu')")
    lord_id: str = Field(..., description="Machine-readable ruler ID (e.g. 'rahu')")
    degree_in_nakshatra: float = Field(
        ..., ge=0.0, lt=13.333334, description="Decimal degrees traversed in current Nakshatra [0.0, 13°20')"
    )
    formatted_dms: str = Field(..., description="DMS string of position within Nakshatra")


class AscendantDetail(BaseModel):
    """Calculated sidereal Ascendant (Lagna) and astronomical metrics."""

    model_config = ConfigDict(from_attributes=True)

    longitude: float = Field(..., description="Normalized sidereal longitude of Ascendant [0.0, 360.0) degrees")
    sign_number: int = Field(..., ge=1, le=12, description="Zodiac sign number of Lagna (1=Aries to 12=Pisces)")
    sign_name: str = Field(..., description="English zodiac sign name (e.g. 'Libra')")
    sign_sanskrit: str = Field(..., description="Sanskrit Rashi name (e.g. 'Tula')")
    degree_in_sign: float = Field(..., ge=0.0, lt=30.0, description="Decimal degree within sign [0.0, 30.0)")
    degree: int = Field(..., ge=0, le=29, description="Integer degrees component (0 to 29)")
    minutes: int = Field(..., ge=0, le=59, description="Integer arcminutes component (0 to 59)")
    seconds: float = Field(..., ge=0.0, lt=60.0, description="Arcseconds component (0.00 to 59.99)")
    formatted_dms: str = Field(..., description="Human-readable DMS representation (e.g. 06° 48' 14.01\")")
    nakshatra: NakshatraInfo = Field(..., description="Nakshatra, Pada, and Lord of the Ascendant point")


class AscendantResponse(BaseModel):
    """API response model for Ascendant (Lagna) calculation."""

    ascendant: AscendantDetail = Field(..., description="Calculated Ascendant (Lagna) details")
    metadata: CalculationMetadata = Field(..., description="Calculation and ephemeris metadata")

