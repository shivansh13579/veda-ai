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


class PlanetaryDignity(str, enum.Enum):
    """Classical Vedic Planetary Dignity classifications."""
    EXALTED = "exalted"                    # Uccha
    MOOLATRIKONA = "moolatrikona"          # Moolatrikona
    OWN_SIGN = "own_sign"                  # Swakshetra
    FRIENDLY_SIGN = "friendly_sign"        # Mitra Kshetra
    NEUTRAL_SIGN = "neutral_sign"          # Sama Kshetra
    ENEMY_SIGN = "enemy_sign"              # Shatru Kshetra
    DEBILITATED = "debilitated"            # Neecha


class ExaltationInfo(NamedTuple):
    """Deep exaltation (Param Uccha) and debilitation (Param Neecha) reference data."""
    exaltation_sign: int        # Sign number (1 to 12)
    param_uccha_degree: float   # Exact deep exaltation degree within sign
    debilitation_sign: int      # Sign number (1 to 12)
    param_neecha_degree: float  # Exact deep debilitation degree within sign


# Classical Exaltation & Debilitation signs and exact degrees (BPHS Ch. 3)
EXALTATION_DATA: Dict[str, ExaltationInfo] = {
    "sun": ExaltationInfo(1, 10.0, 7, 10.0),       # Aries 10° / Libra 10°
    "moon": ExaltationInfo(2, 3.0, 8, 3.0),        # Taurus 3° / Scorpio 3°
    "mars": ExaltationInfo(10, 28.0, 4, 28.0),     # Capricorn 28° / Cancer 28°
    "mercury": ExaltationInfo(6, 15.0, 12, 15.0),  # Virgo 15° / Pisces 15°
    "jupiter": ExaltationInfo(4, 5.0, 10, 5.0),    # Cancer 5° / Capricorn 5°
    "venus": ExaltationInfo(12, 27.0, 6, 27.0),    # Pisces 27° / Virgo 27°
    "saturn": ExaltationInfo(7, 20.0, 1, 20.0),    # Libra 20° / Aries 20°
    "rahu": ExaltationInfo(2, 20.0, 8, 20.0),      # Taurus 20° / Scorpio 20° (Parashari tradition)
    "ketu": ExaltationInfo(8, 20.0, 2, 20.0),      # Scorpio 20° / Taurus 20° (Parashari tradition)
}


class MoolatrikonaRange(NamedTuple):
    """Moolatrikona sign and active degree span."""
    sign_number: int
    start_degree: float
    end_degree: float


# Classical Moolatrikona sign and degree spans (BPHS Ch. 3, v. 49-50)
MOOLATRIKONA_RANGES: Dict[str, MoolatrikonaRange] = {
    "sun": MoolatrikonaRange(5, 0.0, 20.0),         # Leo 0° - 20°
    "moon": MoolatrikonaRange(2, 3.0, 30.0),        # Taurus 3° - 30°
    "mars": MoolatrikonaRange(1, 0.0, 12.0),        # Aries 0° - 12°
    "mercury": MoolatrikonaRange(6, 15.0, 20.0),    # Virgo 15° - 20°
    "jupiter": MoolatrikonaRange(9, 0.0, 10.0),     # Sagittarius 0° - 10°
    "venus": MoolatrikonaRange(7, 0.0, 15.0),       # Libra 0° - 15°
    "saturn": MoolatrikonaRange(11, 0.0, 20.0),     # Aquarius 0° - 20°
    "rahu": MoolatrikonaRange(3, 0.0, 30.0),        # Gemini 0° - 30° (Classical BPHS option)
    "ketu": MoolatrikonaRange(9, 0.0, 30.0),        # Sagittarius 0° - 30° (Classical BPHS option)
}


# Classical Rulership / Own Signs (Swakshetra)
OWN_SIGNS: Dict[str, Tuple[int, ...]] = {
    "sun": (5,),            # Leo
    "moon": (4,),           # Cancer
    "mars": (1, 8),         # Aries, Scorpio
    "mercury": (3, 6),      # Gemini, Virgo
    "jupiter": (9, 12),     # Sagittarius, Pisces
    "venus": (2, 7),        # Taurus, Libra
    "saturn": (10, 11),     # Capricorn, Aquarius
    "rahu": (11,),          # Aquarius (Classical co-ruler with Saturn)
    "ketu": (8,),           # Scorpio (Classical co-ruler with Mars)
}


# Classical Natural Planetary Relationships (Naisargika Sambandha) from BPHS Ch. 3, v. 51-54
NATURAL_RELATIONSHIPS: Dict[str, Dict[str, Tuple[str, ...]]] = {
    "sun": {
        "friends": ("moon", "mars", "jupiter"),
        "neutrals": ("mercury",),
        "enemies": ("venus", "saturn", "rahu", "ketu"),
    },
    "moon": {
        "friends": ("sun", "mercury"),
        "neutrals": ("mars", "jupiter", "venus", "saturn"),
        "enemies": ("rahu", "ketu"),
    },
    "mars": {
        "friends": ("sun", "moon", "jupiter"),
        "neutrals": ("venus", "saturn"),
        "enemies": ("mercury", "rahu", "ketu"),
    },
    "mercury": {
        "friends": ("sun", "venus"),
        "neutrals": ("mars", "jupiter", "saturn"),
        "enemies": ("moon", "rahu", "ketu"),
    },
    "jupiter": {
        "friends": ("sun", "moon", "mars"),
        "neutrals": ("saturn",),
        "enemies": ("mercury", "venus", "rahu", "ketu"),
    },
    "venus": {
        "friends": ("mercury", "saturn"),
        "neutrals": ("mars", "jupiter"),
        "enemies": ("sun", "moon", "rahu", "ketu"),
    },
    "saturn": {
        "friends": ("mercury", "venus"),
        "neutrals": ("jupiter",),
        "enemies": ("sun", "moon", "mars", "rahu", "ketu"),
    },
    "rahu": {
        "friends": ("mercury", "venus", "saturn"),
        "neutrals": ("jupiter",),
        "enemies": ("sun", "moon", "mars"),
    },
    "ketu": {
        "friends": ("mars", "venus", "saturn"),
        "neutrals": ("mercury", "jupiter"),
        "enemies": ("sun", "moon"),
    },
}


# Classical Combustion (Asta) thresholds in degrees (Surya Siddhanta & BPHS)
# Mercury and Venus have distinct direct and retrograde combustion thresholds.
COMBUSTION_THRESHOLDS: Dict[str, Dict[str, float]] = {
    "moon": {"direct": 12.0, "retrograde": 12.0},
    "mars": {"direct": 17.0, "retrograde": 17.0},
    "mercury": {"direct": 14.0, "retrograde": 12.0},
    "jupiter": {"direct": 11.0, "retrograde": 11.0},
    "venus": {"direct": 10.0, "retrograde": 8.0},
    "saturn": {"direct": 15.0, "retrograde": 15.0},
}



