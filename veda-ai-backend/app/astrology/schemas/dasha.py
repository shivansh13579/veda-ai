from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

from app.astrology.schemas.ascendant import NakshatraInfo


class DashaCalculationSettings(BaseModel):
    """Configuration and metadata for Vimshottari Dasha calculations."""
    astrology_system: str = Field(default="vedic", description="Astrology system: 'vedic'")
    zodiac_type: str = Field(default="sidereal", description="Zodiac type: 'sidereal'")
    ayanamsha: str = Field(default="lahiri", description="Sidereal ayanamsha system used")
    ayanamsha_value: float = Field(..., description="Ayanamsha value in degrees")
    dasha_cycle_years: float = Field(default=120.0, description="Total Vimshottari cycle length in years")
    year_length_days: float = Field(default=365.25, description="Number of days per dasha year")
    as_of: datetime = Field(..., description="Target calculation instant for active dasha determination")
    level: str = Field(..., description="Depth of calculation: 'mahadasha', 'antardasha', or 'pratyantardasha'")
    node_type: str = Field(default="true", description="Lunar node calculation convention ('true' or 'mean')")


class DashaBalanceResponse(BaseModel):
    """Balance of birth Mahadasha at the exact time of birth."""
    planet: str = Field(..., description="Ruling planet of birth Mahadasha")
    duration_years: float = Field(..., description="Full Mahadasha duration in years")
    elapsed_years: float = Field(..., description="Elapsed duration at birth in years")
    balance_years: float = Field(..., description="Remaining duration at birth in years")
    elapsed_percentage: float = Field(..., description="Percentage of Nakshatra/Dasha elapsed at birth")
    balance_percentage: float = Field(..., description="Percentage of Nakshatra/Dasha remaining at birth")
    balance_formatted: str = Field(..., description="Formatted remaining balance (years, months, days)")


class ActiveDashaPeriod(BaseModel):
    """Active Dasha period details at the as_of instant."""
    planet: str = Field(..., description="Ruling planet of this period")
    level: str = Field(..., description="Period level: 'mahadasha', 'antardasha', or 'pratyantardasha'")
    start_date: datetime = Field(..., description="Period start timestamp (UTC)")
    end_date: datetime = Field(..., description="Period end timestamp (UTC)")
    duration_years: float = Field(..., description="Duration in solar years")
    duration_days: float = Field(..., description="Duration in days")


class PratyantardashaPeriodResponse(BaseModel):
    """Vimshottari Pratyantardasha (sub-sub period)."""
    planet: str = Field(..., description="Ruling planet")
    start_date: datetime = Field(..., description="Start timestamp (UTC)")
    end_date: datetime = Field(..., description="End timestamp (UTC)")
    duration_years: float = Field(..., description="Duration in years")
    duration_days: float = Field(..., description="Duration in days")
    is_current: bool = Field(..., description="Whether this period is active at as_of")


class AntardashaPeriodResponse(BaseModel):
    """Vimshottari Antardasha (Bhukti / sub-period)."""
    planet: str = Field(..., description="Ruling planet")
    start_date: datetime = Field(..., description="Start timestamp (UTC)")
    end_date: datetime = Field(..., description="End timestamp (UTC)")
    duration_years: float = Field(..., description="Duration in years")
    duration_days: float = Field(..., description="Duration in days")
    is_current: bool = Field(..., description="Whether this period is active at as_of")
    pratyantardashas: Optional[List[PratyantardashaPeriodResponse]] = Field(
        default=None, description="Nested Pratyantardashas if requested"
    )


class MahadashaPeriodResponse(BaseModel):
    """Vimshottari Mahadasha (major planetary period)."""
    planet: str = Field(..., description="Ruling planet")
    start_date: datetime = Field(..., description="Start timestamp (UTC)")
    end_date: datetime = Field(..., description="End timestamp (UTC)")
    duration_years: float = Field(..., description="Duration in years")
    duration_days: float = Field(..., description="Duration in days")
    is_current: bool = Field(..., description="Whether this period is active at as_of")
    antardashas: Optional[List[AntardashaPeriodResponse]] = Field(
        default=None, description="Nested Antardashas if requested"
    )


class VimshottariDashaResponse(BaseModel):
    """Comprehensive Vimshottari Dasha calculation response."""
    birth_profile_id: uuid.UUID = Field(..., description="Unique ID of the evaluated birth profile")
    calculation_settings: DashaCalculationSettings = Field(..., description="Settings and ephemeris metadata")
    moon_sidereal_longitude: float = Field(..., description="Moon sidereal longitude in degrees (0 to 360)")
    birth_nakshatra: NakshatraInfo = Field(..., description="Moon birth Nakshatra details")
    nakshatra_pada: int = Field(..., description="Moon birth Pada (1 to 4)")
    birth_mahadasha: str = Field(..., description="Starting Mahadasha planet name at birth")
    birth_mahadasha_balance: DashaBalanceResponse = Field(..., description="Calculated balance of birth Mahadasha")
    current_mahadasha: Optional[ActiveDashaPeriod] = Field(
        default=None, description="Current active Mahadasha (null if as_of falls outside 120-year timeline)"
    )
    current_antardasha: Optional[ActiveDashaPeriod] = Field(
        default=None, description="Current active Antardasha (null if as_of falls outside 120-year timeline)"
    )
    current_pratyantardasha: Optional[ActiveDashaPeriod] = Field(
        default=None, description="Current active Pratyantardasha (null if as_of falls outside 120-year timeline)"
    )
    out_of_range_advisory: Optional[str] = Field(
        default=None, description="Advisory message if as_of instant falls outside the 120-year timeline"
    )
    timeline: List[MahadashaPeriodResponse] = Field(
        default_factory=list, description="Ordered 120-year timeline of Mahadashas"
    )

