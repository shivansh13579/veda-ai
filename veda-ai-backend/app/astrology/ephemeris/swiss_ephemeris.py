import logging
import os
import threading
from typing import Dict, List, Optional, Tuple

try:
    import swisseph as swe
except ImportError:
    swe = None  # type: ignore

from app.astrology.constants import (
    AyanamshaSystem,
    NodeType,
    SWISSEPH_AYANAMSHA_MAP,
)
from app.astrology.exceptions import (
    AstrologyCalculationError,
    EphemerisUnavailableError,
    UnsupportedAyanamshaError,
)
from app.core.config import settings

logger = logging.getLogger("veda_ai.astrology.ephemeris")

# Mutex to ensure thread safety across C-level static state in Swiss Ephemeris
_SWE_LOCK = threading.Lock()


class SwissEphemerisWrapper:
    """
    Low-level singleton wrapper providing thread-safe access to the Swiss Ephemeris C-library.
    Manages ephemeris file paths, sidereal ayanamsha configuration, and planetary calculations.
    """

    _initialized: bool = False
    _ephe_path_set: bool = False

    @classmethod
    def is_available(cls) -> bool:
        """Return True if Swiss Ephemeris native bindings are installed and loaded."""
        return swe is not None

    @classmethod
    def get_version(cls) -> Optional[str]:
        """Return the Swiss Ephemeris C library version string."""
        if swe is not None:
            return getattr(swe, "version", "2.10.03")
        return None

    @classmethod
    def initialize(cls) -> None:
        """Configure Swiss Ephemeris file path and environment settings once."""
        if not cls.is_available():
            logger.warning("Swiss Ephemeris Python binding (swisseph/pysweph) is not installed.")
            return

        with _SWE_LOCK:
            if cls._initialized:
                return

            ephe_path = settings.SWISS_EPHEMERIS_PATH
            if ephe_path:
                cleaned_path = os.path.abspath(ephe_path.strip())
                if os.path.isdir(cleaned_path):
                    swe.set_ephe_path(cleaned_path)
                    cls._ephe_path_set = True
                    logger.info("Configured Swiss Ephemeris path to '%s'", cleaned_path)
                else:
                    if settings.ASTROLOGY_REQUIRE_EPHEMERIS_FILES:
                        raise EphemerisUnavailableError(
                            f"Configured SWISS_EPHEMERIS_PATH '{cleaned_path}' does not exist on disk."
                        )
                    logger.warning(
                        "Configured SWISS_EPHEMERIS_PATH '%s' not found. Operating with built-in ephemeris.",
                        cleaned_path,
                    )
            cls._initialized = True

    @classmethod
    def check_ephemeris_files_available(cls) -> bool:
        """Check whether .se1 ephemeris files are accessible in the configured or default path."""
        if not cls.is_available():
            return False

        path_to_check = settings.SWISS_EPHEMERIS_PATH
        if path_to_check and os.path.isdir(path_to_check):
            # Check for standard planet and moon ephemeris files (covering 1800-2400)
            has_planets = os.path.isfile(os.path.join(path_to_check, "sepl_18.se1"))
            has_moon = os.path.isfile(os.path.join(path_to_check, "semo_18.se1"))
            return has_planets and has_moon
        return False

    @classmethod
    def calculate_planet_position(
        cls,
        julian_day_ut: float,
        swe_body_id: int,
        ayanamsha: str = AyanamshaSystem.LAHIRI.value,
        flags: Optional[int] = None,
    ) -> Tuple[Tuple[float, float, float, float, float, float], float, int, Optional[str]]:
        """
        Calculate sidereal planetary position for a celestial body at a specific Julian Day.

        Returns:
            ((longitude, latitude, distance, speed_lon, speed_lat, speed_dist), ayanamsha_val, ret_flag, warning_message)
        """
        if not cls.is_available():
            raise EphemerisUnavailableError(
                "Swiss Ephemeris library is not available. Please ensure pysweph is installed."
            )

        cls.initialize()

        # Validate Ayanamsha
        ayanamsha_key = ayanamsha.lower()
        if ayanamsha_key not in SWISSEPH_AYANAMSHA_MAP:
            raise UnsupportedAyanamshaError(
                f"Unsupported ayanamsha '{ayanamsha}'. Supported: {list(SWISSEPH_AYANAMSHA_MAP.keys())}"
            )
        sid_mode = SWISSEPH_AYANAMSHA_MAP[ayanamsha_key]

        # Determine calculation flags: default to Sidereal + Longitudinal Speed
        calc_flags = flags if flags is not None else (swe.FLG_SIDEREAL | swe.FLG_SPEED)

        with _SWE_LOCK:
            try:
                # 1. Configure the sidereal ayanamsha mode
                swe.set_sid_mode(sid_mode, 0, 0)

                # 2. Compute exact ayanamsha value for this Julian Day
                ayan_value = swe.get_ayanamsa_ut(julian_day_ut)

                # 3. Perform planetary calculation
                calc_result = swe.calc_ut(julian_day_ut, swe_body_id, calc_flags)
                coords, ret_flag, serr = calc_result

                # Check for critical calculation failure
                if ret_flag < 0:
                    raise AstrologyCalculationError(
                        f"Swiss Ephemeris calculation failed for body {swe_body_id}: {serr}"
                    )

                # Check if high-precision files were strictly required but fallback was triggered
                warning = None
                if serr:
                    warning = serr.strip()
                    if settings.ASTROLOGY_REQUIRE_EPHEMERIS_FILES and "using Moshier eph" in serr:
                        raise EphemerisUnavailableError(
                            f"High-precision Swiss Ephemeris data files (.se1) missing. Ephemeris reported: {serr}"
                        )

                return coords, ayan_value, ret_flag, warning

            except (EphemerisUnavailableError, AstrologyCalculationError, UnsupportedAyanamshaError):
                raise
            except Exception as exc:
                raise AstrologyCalculationError(
                    f"Unexpected astronomical calculation error for body {swe_body_id}: {exc}"
                ) from exc

    @classmethod
    def calculate_houses_and_ascendant(
        cls,
        julian_day_ut: float,
        latitude: float,
        longitude: float,
        ayanamsha: str = AyanamshaSystem.LAHIRI.value,
        hsys: bytes = b"W",
    ) -> Tuple[float, List[float], float, Optional[str]]:
        """
        Calculate sidereal Ascendant (Lagna) and 12 house cusps at a specific Julian Day and geographic coordinates.

        Returns:
            (ascendant_longitude, house_cusps_list_12, ayanamsha_val, warning_message)
        """
        if not cls.is_available():
            raise EphemerisUnavailableError(
                "Swiss Ephemeris library is not available. Please ensure pysweph is installed."
            )

        cls.initialize()

        # Validate Ayanamsha
        ayanamsha_key = ayanamsha.lower()
        if ayanamsha_key not in SWISSEPH_AYANAMSHA_MAP:
            raise UnsupportedAyanamshaError(
                f"Unsupported ayanamsha '{ayanamsha}'. Supported: {list(SWISSEPH_AYANAMSHA_MAP.keys())}"
            )
        sid_mode = SWISSEPH_AYANAMSHA_MAP[ayanamsha_key]

        with _SWE_LOCK:
            try:
                # 1. Configure the sidereal ayanamsha mode
                swe.set_sid_mode(sid_mode, 0, 0)

                # 2. Compute exact ayanamsha value for this Julian Day
                ayan_value = swe.get_ayanamsa_ut(julian_day_ut)

                # 3. Calculate houses and ascendant using sidereal flag
                # houses_ex returns (cusps, ascmc) where cusps has 13 elements (1..12) and ascmc has 10 elements (0: Asc, 1: MC)
                cusps, ascmc = swe.houses_ex(julian_day_ut, latitude, longitude, hsys, swe.FLG_SIDEREAL)

                ascendant_lon = ascmc[0] % 360.0
                # cusps is 1-indexed (index 0 is dummy), cusps[1..12]
                house_cusps = [cusps[i] % 360.0 for i in range(1, 13)]

                return ascendant_lon, house_cusps, ayan_value, None
            except (EphemerisUnavailableError, UnsupportedAyanamshaError):
                raise
            except Exception as exc:
                raise AstrologyCalculationError(
                    f"Unexpected astronomical calculation error for houses/ascendant at lat={latitude}, lon={longitude}: {exc}"
                ) from exc


