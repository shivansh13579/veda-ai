from typing import Any, Dict, NamedTuple, Optional

from app.astrology.constants import (
    COMBUSTION_THRESHOLDS,
    EXALTATION_DATA,
    MOOLATRIKONA_RANGES,
    NATURAL_RELATIONSHIPS,
    OWN_SIGNS,
    SIGN_LORDS,
    ZODIAC_SIGNS,
    PlanetaryDignity,
)


class CombustionResult(NamedTuple):
    """Result of planetary combustion (Asta) calculation."""
    is_combust: bool
    angular_separation: Optional[float]
    combustion_threshold: Optional[float]
    is_applicable: bool
    explanation: str


class DignityResult(NamedTuple):
    """Result of planetary dignity calculation according to classical Parashara rules."""
    dignity: PlanetaryDignity
    sanskrit_dignity: str
    sign_number: int
    sign_name: str
    sign_sanskrit: str
    sign_lord: str
    sign_lord_id: str
    param_degree: Optional[float]
    distance_from_param_degree: Optional[float]
    explanation: str


def calculate_angular_separation(lon1: float, lon2: float) -> float:
    """
    Calculate the minimum geodesic angular separation between two ecliptic longitudes
    on the 360° circle [0.0°, 180.0°].
    """
    diff = abs(lon1 - lon2) % 360.0
    if diff > 180.0:
        diff = 360.0 - diff
    return round(diff, 6)


def check_combustion(
    planet_id: str,
    planet_lon: float,
    sun_lon: float,
    is_retrograde: bool = False,
) -> CombustionResult:
    """
    Calculate planetary combustion (Asta) based on angular separation from the Sun
    according to classical Surya Siddhanta / BPHS thresholds.

    Rules:
    - Sun itself is the illuminator and is never combust.
    - Lunar nodes (Rahu and Ketu) eclipse the Sun and do not suffer combustion.
    - Mercury and Venus utilize retrograde-specific thresholds.
    """
    p_id = planet_id.lower().strip()

    if p_id == "sun":
        return CombustionResult(
            is_combust=False,
            angular_separation=0.0,
            combustion_threshold=None,
            is_applicable=False,
            explanation="The Sun is the source of celestial illumination and cannot undergo combustion.",
        )

    if p_id in ("rahu", "ketu"):
        sep = calculate_angular_separation(planet_lon, sun_lon)
        return CombustionResult(
            is_combust=False,
            angular_separation=sep,
            combustion_threshold=None,
            is_applicable=False,
            explanation="Lunar nodes (Rahu and Ketu) are shadow intersections causing solar/lunar eclipses; classical Jyotish does not classify nodes as combustible.",
        )

    threshold_data = COMBUSTION_THRESHOLDS.get(p_id)
    if not threshold_data:
        return CombustionResult(
            is_combust=False,
            angular_separation=None,
            combustion_threshold=None,
            is_applicable=False,
            explanation=f"Combustion threshold is not defined for {planet_id}.",
        )

    motion_mode = "retrograde" if is_retrograde else "direct"
    threshold = threshold_data.get(motion_mode, threshold_data.get("direct", 15.0))
    sep = calculate_angular_separation(planet_lon, sun_lon)
    is_combust = sep <= threshold

    mode_str = f"retrograde ({threshold}°)" if is_retrograde else f"direct ({threshold}°)"
    if is_combust:
        explanation = f"Planet is combust (Asta): angular separation ({sep}°) is within the {mode_str} threshold of the Sun."
    else:
        explanation = f"Planet is not combust: angular separation ({sep}°) exceeds the {mode_str} threshold."

    return CombustionResult(
        is_combust=is_combust,
        angular_separation=sep,
        combustion_threshold=threshold,
        is_applicable=True,
        explanation=explanation,
    )


def calculate_dignity(
    planet_id: str,
    sign_number: int,
    degree_in_sign: float,
) -> DignityResult:
    """
    Calculate the classical Vedic planetary dignity for a Graha occupying a specific zodiac sign
    and exact degree.

    Evaluation precedence:
    1. Exaltation (Uccha)
    2. Debilitation (Neecha)
    3. Moolatrikona (explicit sign and degree span)
    4. Own Sign (Swakshetra)
    5. Natural Relationships (Mitra / Sama / Shatru Kshetra via Naisargika Sambandha)
    """
    p_id = planet_id.lower().strip()
    sign_info = ZODIAC_SIGNS[sign_number]
    lord_info = SIGN_LORDS[sign_number]
    sign_lord_id = lord_info.lord_id
    sign_lord_name = lord_info.english_name

    # 1. Check Exaltation (Uccha)
    exalt_info = EXALTATION_DATA.get(p_id)
    if exalt_info:
        # Classical exception: Mercury is exalted only in the first 15° of Virgo (15°-20° is MT, 20°-30° own)
        if p_id == "mercury":
            if sign_number == exalt_info.exaltation_sign and degree_in_sign <= 15.0:
                dist = round(abs(degree_in_sign - exalt_info.param_uccha_degree), 6)
                return DignityResult(
                    dignity=PlanetaryDignity.EXALTED,
                    sanskrit_dignity="Uccha",
                    sign_number=sign_number,
                    sign_name=sign_info.english_name,
                    sign_sanskrit=sign_info.sanskrit_name,
                    sign_lord=sign_lord_name,
                    sign_lord_id=sign_lord_id,
                    param_degree=exalt_info.param_uccha_degree,
                    distance_from_param_degree=dist,
                    explanation=f"Mercury is exalted (Uccha) in Virgo (0°–15°), with deep exaltation (Param Uccha) at {exalt_info.param_uccha_degree}°.",
                )
        # Classical exception: Moon is exalted only in the first 3° of Taurus (3°-30° is Moolatrikona)
        elif p_id == "moon":
            if sign_number == exalt_info.exaltation_sign and degree_in_sign <= 3.0:
                dist = round(abs(degree_in_sign - exalt_info.param_uccha_degree), 6)
                return DignityResult(
                    dignity=PlanetaryDignity.EXALTED,
                    sanskrit_dignity="Uccha",
                    sign_number=sign_number,
                    sign_name=sign_info.english_name,
                    sign_sanskrit=sign_info.sanskrit_name,
                    sign_lord=sign_lord_name,
                    sign_lord_id=sign_lord_id,
                    param_degree=exalt_info.param_uccha_degree,
                    distance_from_param_degree=dist,
                    explanation=f"Moon is exalted (Uccha) in Taurus (0°–3°), with deep exaltation (Param Uccha) at {exalt_info.param_uccha_degree}°.",
                )
        else:
            if sign_number == exalt_info.exaltation_sign:
                dist = round(abs(degree_in_sign - exalt_info.param_uccha_degree), 6)
                return DignityResult(
                    dignity=PlanetaryDignity.EXALTED,
                    sanskrit_dignity="Uccha",
                    sign_number=sign_number,
                    sign_name=sign_info.english_name,
                    sign_sanskrit=sign_info.sanskrit_name,
                    sign_lord=sign_lord_name,
                    sign_lord_id=sign_lord_id,
                    param_degree=exalt_info.param_uccha_degree,
                    distance_from_param_degree=dist,
                    explanation=f"{p_id.capitalize()} is exalted (Uccha) in {sign_info.english_name}, with deep exaltation (Param Uccha) at {exalt_info.param_uccha_degree}°.",
                )

    # 2. Check Debilitation (Neecha)
    if exalt_info and sign_number == exalt_info.debilitation_sign:
        dist = round(abs(degree_in_sign - exalt_info.param_neecha_degree), 6)
        return DignityResult(
            dignity=PlanetaryDignity.DEBILITATED,
            sanskrit_dignity="Neecha",
            sign_number=sign_number,
            sign_name=sign_info.english_name,
            sign_sanskrit=sign_info.sanskrit_name,
            sign_lord=sign_lord_name,
            sign_lord_id=sign_lord_id,
            param_degree=exalt_info.param_neecha_degree,
            distance_from_param_degree=dist,
            explanation=f"{p_id.capitalize()} is debilitated (Neecha) in {sign_info.english_name}, with deep debilitation (Param Neecha) at {exalt_info.param_neecha_degree}°.",
        )

    # 3. Check Moolatrikona (explicit sign and degree range)
    mt_range = MOOLATRIKONA_RANGES.get(p_id)
    if mt_range and sign_number == mt_range.sign_number:
        # For Moon in Taurus: 3° to 30°
        # For Mercury in Virgo: 15° to 20°
        if mt_range.start_degree <= degree_in_sign <= mt_range.end_degree:
            return DignityResult(
                dignity=PlanetaryDignity.MOOLATRIKONA,
                sanskrit_dignity="Moolatrikona",
                sign_number=sign_number,
                sign_name=sign_info.english_name,
                sign_sanskrit=sign_info.sanskrit_name,
                sign_lord=sign_lord_name,
                sign_lord_id=sign_lord_id,
                param_degree=None,
                distance_from_param_degree=None,
                explanation=f"{p_id.capitalize()} occupies its Moolatrikona zone ({mt_range.start_degree}°–{mt_range.end_degree}°) in {sign_info.english_name}.",
            )

    # 4. Check Own Sign (Swakshetra)
    own_signs = OWN_SIGNS.get(p_id, ())
    if sign_number in own_signs:
        return DignityResult(
            dignity=PlanetaryDignity.OWN_SIGN,
            sanskrit_dignity="Swakshetra",
            sign_number=sign_number,
            sign_name=sign_info.english_name,
            sign_sanskrit=sign_info.sanskrit_name,
            sign_lord=sign_lord_name,
            sign_lord_id=sign_lord_id,
            param_degree=None,
            distance_from_param_degree=None,
            explanation=f"{p_id.capitalize()} is situated in its own ruling sign (Swakshetra) of {sign_info.english_name}.",
        )

    # 5. Natural Planetary Relationships (Naisargika Sambandha)
    rel = NATURAL_RELATIONSHIPS.get(p_id, {"friends": (), "neutrals": (), "enemies": ()})
    if sign_lord_id in rel.get("friends", ()):
        dignity = PlanetaryDignity.FRIENDLY_SIGN
        sanskrit_dignity = "Mitra Kshetra"
        explanation = f"{p_id.capitalize()} occupies the sign of its natural friend ({sign_lord_name})."
    elif sign_lord_id in rel.get("neutrals", ()):
        dignity = PlanetaryDignity.NEUTRAL_SIGN
        sanskrit_dignity = "Sama Kshetra"
        explanation = f"{p_id.capitalize()} occupies the sign of a neutral planet ({sign_lord_name})."
    else:
        dignity = PlanetaryDignity.ENEMY_SIGN
        sanskrit_dignity = "Shatru Kshetra"
        explanation = f"{p_id.capitalize()} occupies the sign of its natural enemy ({sign_lord_name})."

    return DignityResult(
        dignity=dignity,
        sanskrit_dignity=sanskrit_dignity,
        sign_number=sign_number,
        sign_name=sign_info.english_name,
        sign_sanskrit=sign_info.sanskrit_name,
        sign_lord=sign_lord_name,
        sign_lord_id=sign_lord_id,
        param_degree=None,
        distance_from_param_degree=None,
        explanation=explanation,
    )

