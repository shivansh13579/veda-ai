import enum
from typing import Dict, NamedTuple, Tuple

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore


class ZodiacSignInfo(NamedTuple):
    number: int
    id: str
    english_name: str
    sanskrit_name: str
    start_degree: float
    end_degree: float


ZODIAC_SIGNS: Dict[int, ZodiacSignInfo] = {
    1: ZodiacSignInfo(1, "aries", "Aries", "Mesha", 0.0, 30.0),
    2: ZodiacSignInfo(2, "taurus", "Taurus", "Vrishabha", 30.0, 60.0),
    3: ZodiacSignInfo(3, "gemini", "Gemini", "Mithuna", 60.0, 90.0),
    4: ZodiacSignInfo(4, "cancer", "Cancer", "Karka", 90.0, 120.0),
    5: ZodiacSignInfo(5, "leo", "Leo", "Simha", 120.0, 150.0),
    6: ZodiacSignInfo(6, "virgo", "Virgo", "Kanya", 150.0, 180.0),
    7: ZodiacSignInfo(7, "libra", "Libra", "Tula", 180.0, 210.0),
    8: ZodiacSignInfo(8, "scorpio", "Scorpio", "Vrishchika", 210.0, 240.0),
    9: ZodiacSignInfo(9, "sagittarius", "Sagittarius", "Dhanu", 240.0, 270.0),
    10: ZodiacSignInfo(10, "capricorn", "Capricorn", "Makara", 270.0, 300.0),
    11: ZodiacSignInfo(11, "aquarius", "Aquarius", "Kumbha", 300.0, 330.0),
    12: ZodiacSignInfo(12, "pisces", "Pisces", "Meena", 330.0, 360.0),
}


class NodeType(str, enum.Enum):
    """Lunar node calculation convention."""
    TRUE = "true"
    MEAN = "mean"


class AyanamshaSystem(str, enum.Enum):
    """Supported Vedic sidereal ayanamsha systems."""
    LAHIRI = "lahiri"
    RAMAN = "raman"
    KP = "kp"


# Swiss Ephemeris sidereal mode ID mappings
SWISSEPH_AYANAMSHA_MAP: Dict[str, int] = {
    AyanamshaSystem.LAHIRI.value: 1 if swe is None else swe.SIDM_LAHIRI,  # SIDM_LAHIRI = 1
    AyanamshaSystem.RAMAN.value: 3 if swe is None else swe.SIDM_RAMAN,    # SIDM_RAMAN = 3
    AyanamshaSystem.KP.value: 5 if swe is None else swe.SIDM_KRISHNAMURTI, # SIDM_KRISHNAMURTI = 5
}


class PlanetId(str, enum.Enum):
    """Classical Vedic Navagraha (Nine Celestial Bodies)."""
    SUN = "sun"
    MOON = "moon"
    MARS = "mars"
    MERCURY = "mercury"
    JUPITER = "jupiter"
    VENUS = "venus"
    SATURN = "saturn"
    RAHU = "rahu"
    KETU = "ketu"


class PlanetMetadata(NamedTuple):
    id: PlanetId
    english_name: str
    sanskrit_name: str
    swe_id: int  # Swiss Ephemeris body ID (-1 for synthetic Ketu)


# Classical Navagraha metadata (excluding outer modern planets Uranus, Neptune, Pluto)
NAVAGRAHA_BODIES: Tuple[PlanetMetadata, ...] = (
    PlanetMetadata(PlanetId.SUN, "Sun", "Surya", 0 if swe is None else swe.SUN),
    PlanetMetadata(PlanetId.MOON, "Moon", "Chandra", 1 if swe is None else swe.MOON),
    PlanetMetadata(PlanetId.MARS, "Mars", "Mangala", 4 if swe is None else swe.MARS),
    PlanetMetadata(PlanetId.MERCURY, "Mercury", "Budha", 2 if swe is None else swe.MERCURY),
    PlanetMetadata(PlanetId.JUPITER, "Jupiter", "Guru", 5 if swe is None else swe.JUPITER),
    PlanetMetadata(PlanetId.VENUS, "Venus", "Shukra", 3 if swe is None else swe.VENUS),
    PlanetMetadata(PlanetId.SATURN, "Saturn", "Shani", 6 if swe is None else swe.SATURN),
    PlanetMetadata(PlanetId.RAHU, "Rahu", "Rahu", 11 if swe is None else swe.TRUE_NODE),  # Will adapt to True vs Mean
    PlanetMetadata(PlanetId.KETU, "Ketu", "Ketu", -1),  # Calculated as 180° opposite of Rahu
)


class SignLordInfo(NamedTuple):
    lord_id: str
    english_name: str
    sanskrit_name: str


# Classical Vedic Rulership (excluding modern outer planets)
SIGN_LORDS: Dict[int, SignLordInfo] = {
    1: SignLordInfo("mars", "Mars", "Mangala"),
    2: SignLordInfo("venus", "Venus", "Shukra"),
    3: SignLordInfo("mercury", "Mercury", "Budha"),
    4: SignLordInfo("moon", "Moon", "Chandra"),
    5: SignLordInfo("sun", "Sun", "Surya"),
    6: SignLordInfo("mercury", "Mercury", "Budha"),
    7: SignLordInfo("venus", "Venus", "Shukra"),
    8: SignLordInfo("mars", "Mars", "Mangala"),
    9: SignLordInfo("jupiter", "Jupiter", "Guru"),
    10: SignLordInfo("saturn", "Saturn", "Shani"),
    11: SignLordInfo("saturn", "Saturn", "Shani"),
    12: SignLordInfo("jupiter", "Jupiter", "Guru"),
}


# The 27 Classical Vedic Nakshatras (Lunar Mansions)
NAKSHATRAS: Tuple[str, ...] = (
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
)

# Traditional Vimshottari Nakshatra Lord cycle (repeats every 9 Nakshatras)
VIMSHOTTARI_LORDS: Tuple[str, ...] = (
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
)

# Vimshottari Mahadasha planetary durations in solar years (Total = 120 years)
VIMSHOTTARI_DURATIONS: Dict[str, float] = {
    "Ketu": 7.0,
    "Venus": 20.0,
    "Sun": 6.0,
    "Moon": 10.0,
    "Mars": 7.0,
    "Rahu": 18.0,
    "Jupiter": 16.0,
    "Saturn": 19.0,
    "Mercury": 17.0,
}

TOTAL_VIMSHOTTARI_YEARS: float = 120.0


class DashaYearConvention(str, enum.Enum):
    """
    Standard year-length conventions for converting Dasha years to calendar duration.
    - SOLAR_365_25: 365.25 days (Julian/Solar year, standard modern default in Jagannatha Hora).
    - SAVANA_360: 360.0 days (Classical Savana year = 12 months x 30 solar days/tithis).
    - GREGORIAN_365_2425: 365.2425 days (Mean Gregorian solar calendar year).
    """
    SOLAR_365_25 = "365.25"
    SAVANA_360 = "360.0"
    GREGORIAN_365_2425 = "365.2425"


DEFAULT_DASHA_YEAR_DAYS: float = 365.25

# Exact mathematical spans
NAKSHATRA_SPAN_DEGREES: float = 40.0 / 3.0  # 13° 20' = 13.333333333333334°
PADA_SPAN_DEGREES: float = 10.0 / 3.0       # 3° 20' = 3.3333333333333335°
NAKSHATRA_SPAN_MINUTES: float = 800.0       # 800 arcminutes
PADA_SPAN_MINUTES: float = 200.0            # 200 arcminutes

# Navamsa (D9) mathematical constants
NAVAMSA_SPAN_DEGREES: float = 10.0 / 3.0    # 3° 20' = 3.3333333333333335°
NAVAMSA_SPAN_MINUTES: float = 200.0         # 200 arcminutes
NAVAMSAS_PER_SIGN: int = 9
TOTAL_NAVAMSAS: int = 108


class ZodiacModality(str, enum.Enum):
    """Vedic sign quadruplicity / modality."""
    MOVABLE = "movable"    # Chara (Cardinal)
    FIXED = "fixed"        # Sthira (Fixed)
    DUAL = "dual"          # Dvisvabhava (Mutable)


SIGN_MODALITIES: Dict[int, ZodiacModality] = {
    1: ZodiacModality.MOVABLE,   # Aries
    2: ZodiacModality.FIXED,     # Taurus
    3: ZodiacModality.DUAL,      # Gemini
    4: ZodiacModality.MOVABLE,   # Cancer
    5: ZodiacModality.FIXED,     # Leo
    6: ZodiacModality.DUAL,      # Virgo
    7: ZodiacModality.MOVABLE,   # Libra
    8: ZodiacModality.FIXED,     # Scorpio
    9: ZodiacModality.DUAL,      # Sagittarius
    10: ZodiacModality.MOVABLE,  # Capricorn
    11: ZodiacModality.FIXED,    # Aquarius
    12: ZodiacModality.DUAL,     # Pisces
}



