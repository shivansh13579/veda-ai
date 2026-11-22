import logging
from datetime import date, time
from typing import Any, List, Optional

from app.astrology.schemas.bhava import (
    BhavaDetail,
    HouseChartResponse,
    PlanetInHouse,
)
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.utils.house_utils import get_whole_sign_houses

logger = logging.getLogger("veda_ai.astrology.bhava")


class BhavaService:
    """
    Calculates the twelve Whole Sign Bhavas (astrological houses) populated with
    their occupying planets according to Vedic Jyotish principles.
    """

    @classmethod
    def calculate_houses(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> HouseChartResponse:
        """
        Calculate all 12 Whole Sign houses and populate each house with planets.
        """
        norm_asc, placements, metadata = HousePlacementService.calculate_placements_raw(
            date_of_birth=date_of_birth,
            time_of_birth=time_of_birth,
            timezone_str=timezone_str,
            latitude=latitude,
            longitude=longitude,
            birth_time_accuracy=birth_time_accuracy,
            ayanamsha=ayanamsha,
            node_type=node_type,
        )

        whole_sign_houses = get_whole_sign_houses(norm_asc)
        bhava_details: List[BhavaDetail] = []

        for h in whole_sign_houses:
            h_num = h["house_number"]
            occupying_planets: List[PlanetInHouse] = []

            for p in placements:
                if p.house_number == h_num:
                    occupying_planets.append(
                        PlanetInHouse(
                            planet_id=p.planet_id,
                            planet_name=p.planet_name,
                            sanskrit_name=p.sanskrit_name,
                            longitude=p.longitude,
                            sign_number=p.sign_number,
                            sign_name=p.sign_name,
                            sign_sanskrit=p.sign_sanskrit,
                            degree_in_sign=p.degree_in_sign,
                            formatted_dms=p.formatted_dms,
                            is_retrograde=p.is_retrograde,
                            nakshatra_number=p.nakshatra.number,
                            nakshatra_name=p.nakshatra.name,
                            pada=p.nakshatra.pada,
                            nakshatra_lord=p.nakshatra.lord,
                            nakshatra_lord_id=p.nakshatra.lord_id,
                        )
                    )

            bhava_details.append(
                BhavaDetail(
                    house_number=h_num,
                    sign_number=h["sign_number"],
                    sign_name=h["sign_name"],
                    sign_sanskrit=h["sign_sanskrit"],
                    house_lord=h["house_lord"],
                    house_lord_id=h["house_lord_id"],
                    is_ascendant_house=h["is_ascendant_house"],
                    start_degree=h["start_degree"],
                    end_degree=h["end_degree"],
                    planets=occupying_planets,
                )
            )

        return HouseChartResponse(houses=bhava_details, metadata=metadata)

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> HouseChartResponse:
        """Calculate houses directly from a BirthProfile database entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_houses(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

