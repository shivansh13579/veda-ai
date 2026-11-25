from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, NamedTuple, Optional, Tuple

from app.astrology.constants import (
    DEFAULT_DASHA_YEAR_DAYS,
    NAKSHATRA_SPAN_MINUTES,
    NAKSHATRAS,
    PADA_SPAN_MINUTES,
    TOTAL_VIMSHOTTARI_YEARS,
    VIMSHOTTARI_DURATIONS,
    VIMSHOTTARI_LORDS,
)
from app.astrology.utils.coordinate_utils import format_dms, normalize_degrees


class DashaBalanceResult(NamedTuple):
    """Mathematical result of birth Mahadasha balance calculation."""
    planet: str
    duration_years: float
    elapsed_years: float
    balance_years: float
    elapsed_fraction: float
    remaining_fraction: float
    elapsed_percentage: float
    balance_percentage: float
    balance_formatted: str
    nakshatra_number: int
    nakshatra_name: str
    nakshatra_pada: int
    degree_in_nakshatra: float
    formatted_dms: str


def format_duration_ymd(years_val: float) -> str:
    """Format a fractional year duration into years, months, and days."""
    if years_val <= 0.0:
        return "0 years, 0 months, 0 days"

    y = int(years_val)
    rem_months = (years_val - y) * 12.0
    m = int(rem_months)
    rem_days = (rem_months - m) * 30.0
    d = int(round(rem_days))

    if d >= 30:
        d = 0
        m += 1
    if m >= 12:
        m = 0
        y += 1

    return f"{y} years, {m} months, {d} days"


def calculate_dasha_balance(moon_longitude: float) -> DashaBalanceResult:
    """
    Calculate the starting Vimshottari Mahadasha and birth balance based on the Moon's
    exact sidereal longitude.

    Formula:
    - Nakshatra span = 13° 20' (800 arcminutes)
    - Elapsed fraction = Moon arcminutes from Nakshatra start / 800.0
    - Remaining fraction = 1.0 - Elapsed fraction
    - Balance = Remaining fraction * Lord Mahadasha duration (years)
    """
    norm_lon = normalize_degrees(moon_longitude)
    total_arcmin = norm_lon * 60.0

    nak_idx = int(total_arcmin // NAKSHATRA_SPAN_MINUTES)
    if nak_idx >= 27:
        nak_idx = 26

    arcmin_in_nak = total_arcmin - (nak_idx * NAKSHATRA_SPAN_MINUTES)
    if arcmin_in_nak < 0.0:
        arcmin_in_nak = 0.0
    elif arcmin_in_nak > NAKSHATRA_SPAN_MINUTES:
        arcmin_in_nak = NAKSHATRA_SPAN_MINUTES

    deg_in_nak = arcmin_in_nak / 60.0
    pada = int(arcmin_in_nak // PADA_SPAN_MINUTES) + 1
    if pada > 4:
        pada = 4

    nak_number = nak_idx + 1
    nak_name = NAKSHATRAS[nak_idx]

    # Lord of the birth Nakshatra in the 9-planet Vimshottari cycle
    lord_name = VIMSHOTTARI_LORDS[nak_idx % 9]
    full_duration = VIMSHOTTARI_DURATIONS[lord_name]

    elapsed_fraction = arcmin_in_nak / NAKSHATRA_SPAN_MINUTES
    remaining_fraction = 1.0 - elapsed_fraction

    elapsed_years = elapsed_fraction * full_duration
    balance_years = remaining_fraction * full_duration

    elapsed_pct = elapsed_fraction * 100.0
    balance_pct = remaining_fraction * 100.0

    return DashaBalanceResult(
        planet=lord_name,
        duration_years=round(full_duration, 6),
        elapsed_years=round(elapsed_years, 6),
        balance_years=round(balance_years, 6),
        elapsed_fraction=round(elapsed_fraction, 6),
        remaining_fraction=round(remaining_fraction, 6),
        elapsed_percentage=round(elapsed_pct, 4),
        balance_percentage=round(balance_pct, 4),
        balance_formatted=format_duration_ymd(balance_years),
        nakshatra_number=nak_number,
        nakshatra_name=nak_name,
        nakshatra_pada=pada,
        degree_in_nakshatra=round(deg_in_nak, 6),
        formatted_dms=format_dms(deg_in_nak),
    )


def get_antardasha_sequence(mahadasha_lord: str) -> List[Tuple[str, float]]:
    """
    Generate the 9 cyclic Antardashas within a Mahadasha.
    Starts with the Mahadasha lord and cycles through the 9 Vimshottari lords.

    Duration formula:
        AD duration = (MD duration * AD lord duration) / 120.0
    """
    if mahadasha_lord not in VIMSHOTTARI_LORDS:
        raise ValueError(f"Unknown Mahadasha lord: {mahadasha_lord}")

    md_duration = VIMSHOTTARI_DURATIONS[mahadasha_lord]
    start_idx = VIMSHOTTARI_LORDS.index(mahadasha_lord)

    antardashas: List[Tuple[str, float]] = []
    for i in range(9):
        lord = VIMSHOTTARI_LORDS[(start_idx + i) % 9]
        lord_dur = VIMSHOTTARI_DURATIONS[lord]
        ad_dur = (md_duration * lord_dur) / TOTAL_VIMSHOTTARI_YEARS
        antardashas.append((lord, ad_dur))

    return antardashas


def get_pratyantardasha_sequence(
    mahadasha_lord: str, antardasha_lord: str
) -> List[Tuple[str, float]]:
    """
    Generate the 9 cyclic Pratyantardashas within an Antardasha.
    Starts with the Antardasha lord and cycles through the 9 Vimshottari lords.

    Duration formula:
        PD duration = (MD duration * AD duration in planetary years * PD lord duration) / 120^2
                    = (AD duration in years * PD lord duration) / 120.0
    """
    if mahadasha_lord not in VIMSHOTTARI_LORDS:
        raise ValueError(f"Unknown Mahadasha lord: {mahadasha_lord}")
    if antardasha_lord not in VIMSHOTTARI_LORDS:
        raise ValueError(f"Unknown Antardasha lord: {antardasha_lord}")

    md_dur = VIMSHOTTARI_DURATIONS[mahadasha_lord]
    ad_lord_dur = VIMSHOTTARI_DURATIONS[antardasha_lord]
    ad_duration = (md_dur * ad_lord_dur) / TOTAL_VIMSHOTTARI_YEARS
    start_idx = VIMSHOTTARI_LORDS.index(antardasha_lord)

    pratyantardashas: List[Tuple[str, float]] = []
    for j in range(9):
        lord = VIMSHOTTARI_LORDS[(start_idx + j) % 9]
        pd_lord_dur = VIMSHOTTARI_DURATIONS[lord]
        pd_dur = (ad_duration * pd_lord_dur) / TOTAL_VIMSHOTTARI_YEARS
        pratyantardashas.append((lord, pd_dur))

    return pratyantardashas


def build_vimshottari_timeline(
    birth_dt_utc: datetime,
    moon_longitude: float,
    as_of_utc: datetime,
    level: str = "pratyantardasha",
    days_per_year: float = DEFAULT_DASHA_YEAR_DAYS,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    """
    Construct the complete 120-year Vimshottari Dasha timeline with zero-gap consecutive
    timestamps, determine active Dasha periods at as_of_utc, and return nested structure.

    Returns:
        (timeline, current_md_info, current_ad_info, current_pd_info)
    """
    if birth_dt_utc.tzinfo is None:
        birth_dt_utc = birth_dt_utc.replace(tzinfo=timezone.utc)
    if as_of_utc.tzinfo is None:
        as_of_utc = as_of_utc.replace(tzinfo=timezone.utc)

    balance = calculate_dasha_balance(moon_longitude)
    birth_lord = balance.planet
    birth_lord_idx = VIMSHOTTARI_LORDS.index(birth_lord)

    # The mathematical start of the first Mahadasha before birth
    elapsed_days = balance.elapsed_years * days_per_year
    timeline_cursor = birth_dt_utc - timedelta(days=elapsed_days)

    level_norm = level.lower().strip()
    include_ad = level_norm in ("antardasha", "pratyantardasha")
    include_pd = level_norm == "pratyantardasha"

    timeline: List[Dict[str, Any]] = []

    current_md: Optional[Dict[str, Any]] = None
    current_ad: Optional[Dict[str, Any]] = None
    current_pd: Optional[Dict[str, Any]] = None

    # Generate the 9 Mahadashas of the 120-year cycle
    for i in range(9):
        md_lord = VIMSHOTTARI_LORDS[(birth_lord_idx + i) % 9]
        md_duration_years = VIMSHOTTARI_DURATIONS[md_lord]
        md_duration_days = md_duration_years * days_per_year

        md_start = timeline_cursor
        md_end = md_start + timedelta(days=md_duration_days)
        timeline_cursor = md_end

        # Check if as_of falls within this Mahadasha
        is_md_current = (md_start <= as_of_utc < md_end) or (i == 8 and as_of_utc == md_end)
        if is_md_current:
            current_md = {
                "planet": md_lord,
                "level": "mahadasha",
                "start_date": md_start,
                "end_date": md_end,
                "duration_years": round(md_duration_years, 6),
                "duration_days": round(md_duration_days, 4),
            }

        ad_list: Optional[List[Dict[str, Any]]] = [] if include_ad else None

        # Build Antardashas
        ad_cursor = md_start
        antardasha_seq = get_antardasha_sequence(md_lord)

        for a_idx, (ad_lord, ad_years) in enumerate(antardasha_seq):
            ad_days = ad_years * days_per_year
            ad_start = ad_cursor
            ad_end = md_end if a_idx == 8 else ad_start + timedelta(days=ad_days)
            ad_cursor = ad_end

            is_ad_current = (ad_start <= as_of_utc < ad_end) or (
                i == 8 and a_idx == 8 and as_of_utc == ad_end
            )
            if is_ad_current:
                current_ad = {
                    "planet": ad_lord,
                    "level": "antardasha",
                    "start_date": ad_start,
                    "end_date": ad_end,
                    "duration_years": round(ad_years, 6),
                    "duration_days": round(ad_days, 4),
                }

            pd_list: Optional[List[Dict[str, Any]]] = [] if include_pd else None

            # Build Pratyantardashas
            pd_cursor = ad_start
            pratyantardasha_seq = get_pratyantardasha_sequence(md_lord, ad_lord)

            for p_idx, (pd_lord, pd_years) in enumerate(pratyantardasha_seq):
                pd_days = pd_years * days_per_year
                pd_start = pd_cursor
                pd_end = ad_end if p_idx == 8 else pd_start + timedelta(days=pd_days)
                pd_cursor = pd_end

                is_pd_current = (pd_start <= as_of_utc < pd_end) or (
                    i == 8 and a_idx == 8 and p_idx == 8 and as_of_utc == pd_end
                )
                if is_pd_current:
                    current_pd = {
                        "planet": pd_lord,
                        "level": "pratyantardasha",
                        "start_date": pd_start,
                        "end_date": pd_end,
                        "duration_years": round(pd_years, 6),
                        "duration_days": round(pd_days, 4),
                    }

                if include_pd and pd_list is not None:
                    pd_list.append(
                        {
                            "planet": pd_lord,
                            "start_date": pd_start,
                            "end_date": pd_end,
                            "duration_years": round(pd_years, 6),
                            "duration_days": round(pd_days, 4),
                            "is_current": is_pd_current,
                        }
                    )

            if include_ad and ad_list is not None:
                ad_dict: Dict[str, Any] = {
                    "planet": ad_lord,
                    "start_date": ad_start,
                    "end_date": ad_end,
                    "duration_years": round(ad_years, 6),
                    "duration_days": round(ad_days, 4),
                    "is_current": is_ad_current,
                }
                if include_pd:
                    ad_dict["pratyantardashas"] = pd_list
                ad_list.append(ad_dict)

        md_dict: Dict[str, Any] = {
            "planet": md_lord,
            "start_date": md_start,
            "end_date": md_end,
            "duration_years": round(md_duration_years, 6),
            "duration_days": round(md_duration_days, 4),
            "is_current": is_md_current,
        }
        if include_ad:
            md_dict["antardashas"] = ad_list

        timeline.append(md_dict)

    # Note: If as_of is outside the 120-year timeline (before T0 or after T0 + 120y),
    # current_md, current_ad, and current_pd remain None, and out_of_range_advisory is returned.
    return timeline, current_md, current_ad, current_pd

