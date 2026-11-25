from typing import Any, List, Optional
import uuid

from app.astrology.exceptions import (
    AstrologyCalculationError,
    UnknownBirthTimeError,
)
from app.astrology.schemas.dignity import (
    CombustionDetail,
    PlanetDignityDetail,
    PlanetaryDignitiesResponse,
)
from app.astrology.services.planetary_service import PlanetaryService
from app.astrology.utils.dignity_utils import (
    calculate_dignity,
    check_combustion,
)


class PlanetaryDignityService:
    """
    Domain service evaluating classical Vedic planetary dignities (Uccha, Neecha,
    Moolatrikona, Swakshetra, Sambandhas) and combustion (Asta) for all nine Navagrahas.
    """

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> PlanetaryDignitiesResponse:
        """
        Calculate planetary dignities and combustion for a user-owned BirthProfile entity.

        Args:
            profile: BirthProfile model instance
            ayanamsha: Optional ayanamsha override ('lahiri', 'raman', 'kp')
            node_type: Optional lunar node convention ('true' or 'mean')

        Returns:
            PlanetaryDignitiesResponse
        """
        # 1. Enforce birth time validity
        accuracy = (getattr(profile, "birth_time_accuracy", "exact") or "exact").lower()
        if accuracy == "unknown" or profile.time_of_birth is None:
            raise UnknownBirthTimeError(
                "Cannot calculate planetary dignities: birth time is unknown. "
                "An exact birth time is required to compute reliable planetary longitudes."
            )

        # 2. Obtain planetary positions (reuses Swiss Ephemeris under mutex lock)
        planet_resp = PlanetaryService.calculate_for_birth_profile(
            profile=profile,
            ayanamsha=ayanamsha,
            node_type=node_type,
        )

        sun_pos = next((p for p in planet_resp.planets if p.planet_id == "sun"), None)
        if not sun_pos:
            raise AstrologyCalculationError("Failed to calculate Sun position for planetary dignity evaluation.")

        sun_lon = sun_pos.longitude

        # 3. Evaluate dignity and combustion for each of the 9 Navagrahas
        dignities: List[PlanetDignityDetail] = []
        for p in planet_resp.planets:
            combustion_res = check_combustion(
                planet_id=p.planet_id,
                planet_lon=p.longitude,
                sun_lon=sun_lon,
                is_retrograde=p.is_retrograde,
            )

            dignity_res = calculate_dignity(
                planet_id=p.planet_id,
                sign_number=p.sign_number,
                degree_in_sign=p.degree_in_sign,
            )

            combustion_detail = CombustionDetail(
                is_combust=combustion_res.is_combust,
                angular_separation=combustion_res.angular_separation,
                combustion_threshold=combustion_res.combustion_threshold,
                is_applicable=combustion_res.is_applicable,
                explanation=combustion_res.explanation,
            )

            dignities.append(
                PlanetDignityDetail(
                    planet_id=p.planet_id,
                    planet_name=p.planet_name,
                    sanskrit_name=p.sanskrit_name,
                    longitude=p.longitude,
                    sign_number=dignity_res.sign_number,
                    sign_name=dignity_res.sign_name,
                    sign_sanskrit=dignity_res.sign_sanskrit,
                    sign_lord=dignity_res.sign_lord,
                    sign_lord_id=dignity_res.sign_lord_id,
                    degree_in_sign=p.degree_in_sign,
                    formatted_dms=p.formatted_dms,
                    is_retrograde=p.is_retrograde,
                    dignity=dignity_res.dignity.value,
                    sanskrit_dignity=dignity_res.sanskrit_dignity,
                    param_degree=dignity_res.param_degree,
                    distance_from_param_degree=dignity_res.distance_from_param_degree,
                    combustion=combustion_detail,
                    explanation=dignity_res.explanation,
                )
            )

        return PlanetaryDignitiesResponse(
            birth_profile_id=profile.id,
            planets=dignities,
            metadata=planet_resp.metadata,
        )

