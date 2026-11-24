import logging
from datetime import date, time
from typing import Any, List, Optional

from app.astrology.schemas.ascendant import AscendantDetail, NakshatraInfo
from app.astrology.schemas.bhava import BhavaDetail, PlanetInHouse
from app.astrology.schemas.divisional import (
    D1ChartResponse,
    D9ChartResponse,
    DivisionalChartsResponse,
)
from app.astrology.services.house_placement_service import HousePlacementService
from app.astrology.services.navamsa_service import NavamsaService
from app.astrology.utils.coordinate_utils import (
    format_dms,
    get_degree_in_sign,
    get_zodiac_sign,
    split_dms,
)
from app.astrology.utils.house_utils import get_whole_sign_houses
from app.astrology.utils.nakshatra_utils import calculate_nakshatra

logger = logging.getLogger("veda_ai.astrology.divisional")


class DivisionalService:
    """
    Coordinates D1 Rashi (Natal) Chart and D9 Navamsa Chart generation according to
    Vedic Jyotish principles, reusing shared astronomical ephemeris calculations without duplication.
    """

    @classmethod
    def build_d1_chart_from_placements(
        cls,
        norm_asc: float,
        placements: list,
        metadata: Any,
    ) -> D1ChartResponse:
        """Pure transformer building D1 Rashi Chart from raw placements and Ascendant."""
        # 1. Build AscendantDetail
        sign_info = get_zodiac_sign(norm_asc)
        deg_in_sign = get_degree_in_sign(norm_asc)
        d, m, s = split_dms(deg_in_sign)
        nak_res = calculate_nakshatra(norm_asc)

        nak_info = NakshatraInfo(
            number=nak_res.number,
            name=nak_res.name,
            pada=nak_res.pada,
            lord=nak_res.lord_name,
            lord_id=nak_res.lord_id,
            degree_in_nakshatra=round(nak_res.degree_in_nakshatra, 6),
            formatted_dms=nak_res.formatted_dms,
        )

        asc_detail = AscendantDetail(
            longitude=round(norm_asc, 6),
            sign_number=sign_info.number,
            sign_name=sign_info.english_name,
            sign_sanskrit=sign_info.sanskrit_name,
            degree_in_sign=round(deg_in_sign, 6),
            degree=d,
            minutes=m,
            seconds=s,
            formatted_dms=format_dms(deg_in_sign),
            nakshatra=nak_info,
        )

        # 2. Build 12 Whole Sign Bhavas with occupying planets
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

        return D1ChartResponse(
            chart_type="D1",
            chart_name="Rashi",
            ascendant=asc_detail,
            houses=bhava_details,
            planetary_placements=placements,
            metadata=metadata,
        )

    @classmethod
    def calculate_d1_chart(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> D1ChartResponse:
        """Calculate D1 Rashi (Natal) Chart reusing validated raw calculations."""
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
        return cls.build_d1_chart_from_placements(norm_asc, placements, metadata)

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
        """Calculate D9 Navamsa Chart."""
        return NavamsaService.calculate_d9_chart(
            date_of_birth=date_of_birth,
            time_of_birth=time_of_birth,
            timezone_str=timezone_str,
            latitude=latitude,
            longitude=longitude,
            birth_time_accuracy=birth_time_accuracy,
            ayanamsha=ayanamsha,
            node_type=node_type,
        )

    @classmethod
    def calculate_divisional_charts(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        timezone_str: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        birth_time_accuracy: str = "exact",
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> DivisionalChartsResponse:
        """
        Calculate D1 Rashi and D9 Navamsa charts simultaneously from a single
        astronomical ephemeris evaluation without duplicate computation.
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

        d1_chart = cls.build_d1_chart_from_placements(norm_asc, placements, metadata)
        d9_chart = NavamsaService.build_d9_chart_from_placements(norm_asc, placements, metadata)

        return DivisionalChartsResponse(
            d1=d1_chart,
            d9=d9_chart,
            metadata=metadata,
        )

    @classmethod
    def calculate_d1_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> D1ChartResponse:
        """Calculate D1 Rashi chart directly from a BirthProfile entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_d1_chart(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

    @classmethod
    def calculate_d9_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> D9ChartResponse:
        """Calculate D9 Navamsa chart directly from a BirthProfile entity."""
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

    @classmethod
    def calculate_divisional_for_birth_profile(
        cls,
        profile: Any,
        ayanamsha: Optional[str] = None,
        node_type: Optional[str] = None,
    ) -> DivisionalChartsResponse:
        """Calculate both D1 and D9 charts directly from a BirthProfile entity."""
        selected_ayanamsha = ayanamsha or getattr(profile, "ayanamsha", None)
        return cls.calculate_divisional_charts(
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            timezone_str=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
            birth_time_accuracy=getattr(profile, "birth_time_accuracy", "exact"),
            ayanamsha=selected_ayanamsha,
            node_type=node_type,
        )

