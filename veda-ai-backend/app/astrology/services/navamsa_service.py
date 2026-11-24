import logging
from datetime import date, time
from typing import Any, List, Optional

from app.astrology.constants import SIGN_LORDS, ZODIAC_SIGNS
from app.astrology.schemas.ascendant import NakshatraInfo
from app.astrology.schemas.divisional import (
    D9AscendantDetail,
    D9BhavaDetail,
    D9ChartResponse,
    D9PlanetInHouse,
    D9PlanetPlacement,
)
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.utils.nakshatra_utils import calculate_nakshatra
from app.astrology.utils.navamsa_utils import calculate_navamsa

logger = logging.getLogger("veda_ai.astrology.navamsa")


class NavamsaService:
    """
    Calculates the D9 Navamsa Chart according to classical Vedic Parashara principles.
    Each zodiac sign is divided into 9 equal parts of 3°20' (200 arcminutes).
    Movable signs start from the sign itself, Fixed from the 9th, and Dual from the 5th.
    D9 Whole Sign houses are determined independently from the D9 Ascendant.
    """

    @classmethod
    def calculate_d9_chart(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> D9ChartResponse:
        """
        Calculate D9 Navamsa Chart reusing validated sidereal planetary positions and Ascendant.
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

        return cls.build_d9_chart_from_placements(
            norm_asc=norm_asc,
            placements=placements,
            metadata=metadata,
        )

    @classmethod
    def build_d9_chart_from_placements(
        cls,
        norm_asc: float,
        placements: list,
        metadata: Any,
    ) -> D9ChartResponse:
        """
        Pure transformer function constructing the complete D9 Navamsa Chart
        from raw D1 placements and Ascendant without redundant astronomical calls.
        """
        # 1. Compute D9 Ascendant
        asc_nav = calculate_navamsa(norm_asc)
        asc_nak = calculate_nakshatra(norm_asc)
        asc_nak_info = NakshatraInfo(
            number=asc_nak.number,
            name=asc_nak.name,
            pada=asc_nak.pada,
            lord=asc_nak.lord_name,
            lord_id=asc_nak.lord_id,
            degree_in_nakshatra=round(asc_nak.degree_in_nakshatra, 6),
            formatted_dms=asc_nak.formatted_dms,
        )

        d9_ascendant = D9AscendantDetail(
            sign_number=asc_nav.d9_sign_number,
            sign_name=asc_nav.d9_sign_name,
            sign_sanskrit=asc_nav.d9_sign_sanskrit,
            degree_in_sign=asc_nav.d9_degree_in_sign,
            degree=asc_nav.d9_degree,
            minutes=asc_nav.d9_minutes,
            seconds=asc_nav.d9_seconds,
            formatted_dms=asc_nav.d9_formatted_dms,
            longitude=asc_nav.d9_longitude,
            navamsa_number=asc_nav.navamsa_number,
            navamsa_start_sign=asc_nav.navamsa_start_sign,
            sign_modality=asc_nav.sign_modality,
            d1_longitude=asc_nav.d1_longitude,
            d1_sign_number=asc_nav.d1_sign_number,
            d1_sign_name=asc_nav.d1_sign_name,
            d1_sign_sanskrit=asc_nav.d1_sign_sanskrit,
            d1_degree_in_sign=asc_nav.d1_degree_in_sign,
            d1_formatted_dms=asc_nav.d1_formatted_dms,
            nakshatra=asc_nak_info,
        )

        d9_asc_sign = asc_nav.d9_sign_number

        # 2. Compute D9 Placements for all 9 Navagrahas
        d9_placements: List[D9PlanetPlacement] = []
        for p in placements:
            p_nav = calculate_navamsa(p.longitude)
            # D9 house placement relative to D9 Ascendant
            d9_house = ((p_nav.d9_sign_number - d9_asc_sign) % 12) + 1
            house_lord_info = SIGN_LORDS[p_nav.d9_sign_number]

            d9_placements.append(
                D9PlanetPlacement(
                    planet_id=p.planet_id,
                    planet_name=p.planet_name,
                    sanskrit_name=p.sanskrit_name,
                    sign_number=p_nav.d9_sign_number,
                    sign_name=p_nav.d9_sign_name,
                    sign_sanskrit=p_nav.d9_sign_sanskrit,
                    degree_in_sign=p_nav.d9_degree_in_sign,
                    degree=p_nav.d9_degree,
                    minutes=p_nav.d9_minutes,
                    seconds=p_nav.d9_seconds,
                    formatted_dms=p_nav.d9_formatted_dms,
                    longitude=p_nav.d9_longitude,
                    house_number=d9_house,
                    house_lord=house_lord_info.english_name,
                    house_lord_id=house_lord_info.lord_id,
                    navamsa_number=p_nav.navamsa_number,
                    navamsa_start_sign=p_nav.navamsa_start_sign,
                    sign_modality=p_nav.sign_modality,
                    is_retrograde=p.is_retrograde,
                    d1_longitude=p_nav.d1_longitude,
                    d1_sign_number=p_nav.d1_sign_number,
                    d1_sign_name=p_nav.d1_sign_name,
                    d1_sign_sanskrit=p_nav.d1_sign_sanskrit,
                    d1_degree_in_sign=p_nav.d1_degree_in_sign,
                    d1_formatted_dms=p_nav.d1_formatted_dms,
                    d1_house_number=p.house_number,
                    nakshatra=p.nakshatra,
                )
            )

        # 3. Generate 12 D9 Whole Sign houses
        d9_houses: List[D9BhavaDetail] = []
        for h in range(1, 13):
            h_sign_num = ((d9_asc_sign - 1 + (h - 1)) % 12) + 1
            h_sign_info = ZODIAC_SIGNS[h_sign_num]
            h_lord_info = SIGN_LORDS[h_sign_num]

            occupying_planets: List[D9PlanetInHouse] = []
            for dp in d9_placements:
                if dp.house_number == h:
                    occupying_planets.append(
                        D9PlanetInHouse(
                            planet_id=dp.planet_id,
                            planet_name=dp.planet_name,
                            sanskrit_name=dp.sanskrit_name,
                            sign_number=dp.sign_number,
                            sign_name=dp.sign_name,
                            sign_sanskrit=dp.sign_sanskrit,
                            degree_in_sign=dp.degree_in_sign,
                            formatted_dms=dp.formatted_dms,
                            is_retrograde=dp.is_retrograde,
                            navamsa_number=dp.navamsa_number,
                            d1_longitude=dp.d1_longitude,
                            d1_sign_number=dp.d1_sign_number,
                            d1_sign_name=dp.d1_sign_name,
                            d1_degree_in_sign=dp.d1_degree_in_sign,
                            nakshatra_name=dp.nakshatra.name,
                            pada=dp.nakshatra.pada,
                        )
                    )

            d9_houses.append(
                D9BhavaDetail(
                    house_number=h,
                    sign_number=h_sign_num,
                    sign_name=h_sign_info.english_name,
                    sign_sanskrit=h_sign_info.sanskrit_name,
                    house_lord=h_lord_info.english_name,
                    house_lord_id=h_lord_info.lord_id,
                    is_ascendant_house=(h == 1),
                    start_degree=h_sign_info.start_degree,
                    end_degree=h_sign_info.end_degree,
                    planets=occupying_planets,
                )
            )

        return D9ChartResponse(
            chart_type="D9",
            chart_name="Navamsa",
            ascendant=d9_ascendant,
            houses=d9_houses,
            planetary_placements=d9_placements,
            metadata=metadata,
        )

    @classmethod
    def calculate_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> D9ChartResponse:
        """Calculate D9 Navamsa Chart directly from a BirthProfile entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_d9_chart(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

