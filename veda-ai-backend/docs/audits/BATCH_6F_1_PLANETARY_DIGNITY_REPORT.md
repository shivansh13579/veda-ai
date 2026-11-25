# VEDA AI BACKEND: BATCH 6F-1 COMPLETION & AUDIT REPORT
## Planetary Dignity & Combustion Engine Implementation

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-24  
**Author:** Antigravity AI Engineering Team  
**Scope:** Batch 6E Corrections (Part A), Planetary Dignity Engine (Part B), Combustion Engine (Part C), Architecture & API (Parts D & E), Comprehensive Test Suite (Part F)  
**Status:** **APPROVED & FULLY VERIFIED (149/149 Tests Passing)**

---

## 1. Executive Summary

Batch 6F-1 delivers an astronomical, fully verified **Planetary Dignity and Combustion (Asta) Engine** for the Veda AI backend. Operating directly atop the established Swiss Ephemeris astronomical calculation core (Batches 6D-1 through 6E), the engine provides classical Vedic astrology dignities (*Avasthas* and *Sambandhas*) and combustion metrics for all nine Navagrahas without reliance on external or third-party astrology APIs.

### Key Milestones Achieved:
1. **Batch 6E Audit Corrections (Part A)**:
   - Corrected illustrative Dasha timeline JSON documentation in `docs/audits/VIMSHOTTARI_DASHA_BATCH_6E_REPORT.md` to reflect real calculation engine output.
   - Handled query dates prior to birth or beyond the 120-year cycle by setting `current_mahadasha`, `current_antardasha`, and `current_pratyantardasha` to `null` while returning an explicit `out_of_range_advisory` string.
   - Added automated regression tests verifying both pre-birth and post-120-year out-of-range inquiries.
2. **Classical Planetary Dignities (Part B)**:
   - Supported all classical Vedic dignities: `exalted` (*Uccha*), `moolatrikona` (*Moolatrikona*), `own_sign` (*Swakshetra*), `friendly_sign` (*Mitra Kshetra*), `neutral_sign` (*Sama Kshetra*), `enemy_sign` (*Shatru Kshetra*), and `debilitated` (*Neecha*).
   - Handled exact deep exaltation (*Param Uccha*) and deep debilitation (*Param Neecha*) reference degrees and calculated angular distances from these critical points.
   - Accurately distinguished between **Moolatrikona** zones and remaining **Own Sign** degree spans rather than treating whole signs as Moolatrikona.
   - Implemented classical *Naisargika Sambandha* (Natural Planetary Relationships) from *Brihat Parashara Hora Shastra* (BPHS Ch. 3, v. 51–54).
3. **Planetary Combustion / Asta (Part C)**:
   - Evaluated acute angular separation on the $360^\circ$ circle ($0^\circ \text{ to } 180^\circ$) correctly accounting for $0^\circ$ Aries boundary crossings.
   - Enforced planet-specific classical combustion thresholds from *Surya Siddhanta* and BPHS, including direct vs. retrograde variations for Mercury ($14^\circ \text{ direct } / 12^\circ \text{ retrograde}$) and Venus ($10^\circ \text{ direct } / 8^\circ \text{ retrograde}$).
   - Correctly exempted the Sun (illuminator) and Rahu/Ketu (shadow nodes).
4. **Clean API & Strict Security Architecture (Parts D & E)**:
   - Exposed `GET /api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities` with optional `ayanamsha` and `node_type` query overrides.
   - Strictly enforced tenant ownership isolation (returns `404 RESOURCE_NOT_FOUND` on cross-tenant access) and birth time accuracy (returns `422 UNKNOWN_BIRTH_TIME` on unknown time of birth).
5. **Quality Assurance & Zero Regressions (Part F)**:
   - Authored 25 comprehensive unit and API integration tests in `tests/test_planetary_dignities.py`.
   - Executed full test suite: **149 passed in 95.55s** with 0 failures across the entire backend.

---

## 2. Part A: Batch 6E Audit Corrections

Following the independent verification audit of the Vimshottari Dasha Engine, two essential refinements were implemented:

### 1. Dasha JSON Documentation Correction
In `docs/audits/VIMSHOTTARI_DASHA_BATCH_6E_REPORT.md` (and the mirrored report in `veda-ai-backend/docs/audits/`), the illustrative Dasha response payload was replaced with live, validated output from the calculation engine for the canonical Varanasi birth profile (October 14, 1994, 06:45:00 IST). The active period hierarchy accurately documents the Moon Mahadasha, Saturn Antardasha, and Ketu Pratyantardasha as of November 24, 2026.

### 2. Out-of-Range Date Handling & Advisory
Prior to Batch 6F-1, querying a date outside the supported 120-year cycle fell back to the first or last period in the timeline. In accordance with the audit recommendations:
- The fallback logic in `app/astrology/utils/dasha_utils.py` (`determine_active_periods`) was removed.
- When `target_as_of < t0` or `target_as_of > t_end`, `current_mahadasha`, `current_antardasha`, and `current_pratyantardasha` return `null`.
- A new field `out_of_range_advisory: Optional[str]` in `app/astrology/schemas/dasha.py` returns an explicit message, e.g.:
  - `"Target date 1800-01-01 00:00:00+00:00 precedes the native's birth timeline (1987-10-18 01:15:00+00:00). Active dasha period is null."`
  - `"Target date 2150-01-01 00:00:00+00:00 is beyond the supported 120-year Vimshottari dasha cycle (ending 2107-10-19 07:15:00+00:00). Active dasha period is null."`
- Automated regression test `test_out_of_range_dates_advisory_and_null_active_periods` was added to `tests/test_vimshottari_dasha.py`.

---

## 3. Part B: Planetary Dignity Engine Specification

### 1. Evaluation Precedence
To ensure mathematical and classical accuracy, planetary dignity is evaluated in the following strict order:
1. **Exaltation (*Uccha*)**
2. **Debilitation (*Neecha*)**
3. **Moolatrikona**
4. **Own Sign (*Swakshetra*)**
5. **Natural Relationships (*Naisargika Sambandha*)**: Friendly Sign (*Mitra Kshetra*), Neutral Sign (*Sama Kshetra*), or Enemy Sign (*Shatru Kshetra*).

### 2. Deep Exaltation (*Param Uccha*) & Debilitation (*Param Neecha*)
According to *Brihat Parashara Hora Shastra* Ch. 3, v. 48–49:

| Graha | Exaltation Sign | Param Uccha Degree | Debilitation Sign | Param Neecha Degree |
|---|---|---|---|---|
| **Sun (Surya)** | Aries ($1$) | $10^\circ$ | Libra ($7$) | $10^\circ$ |
| **Moon (Chandra)** | Taurus ($2$) | $3^\circ$ | Scorpio ($8$) | $3^\circ$ |
| **Mars (Mangala)** | Capricorn ($10$) | $28^\circ$ | Cancer ($4$) | $28^\circ$ |
| **Mercury (Budha)** | Virgo ($6$) | $15^\circ$ | Pisces ($12$) | $15^\circ$ |
| **Jupiter (Guru)** | Cancer ($4$) | $5^\circ$ | Capricorn ($10$) | $5^\circ$ |
| **Venus (Shukra)** | Pisces ($12$) | $27^\circ$ | Virgo ($6$) | $27^\circ$ |
| **Saturn (Shani)** | Libra ($7$) | $20^\circ$ | Aries ($1$) | $20^\circ$ |
| **Rahu** | Taurus ($2$) | $20^\circ$ | Scorpio ($8$) | $20^\circ$ |
| **Ketu** | Scorpio ($8$) | $20^\circ$ | Taurus ($2$) | $20^\circ$ |

*Angular Distance Calculation*: When a planet is in its exaltation or debilitation sign, `distance_from_param_degree` calculates $|\text{degree\_in\_sign} - \text{param\_degree}|$.

### 3. Moolatrikona vs. Own Sign (Swakshetra) Boundaries
Many amateur implementations incorrectly treat entire signs as Moolatrikona. Veda AI implements the exact degree partitions specified in BPHS Ch. 3, v. 49–50:

- **Sun**: Leo $0^\circ\text{--}20^\circ$ is **Moolatrikona**; Leo $20^\circ\text{--}30^\circ$ is **Own Sign**.
- **Moon**: Taurus $0^\circ\text{--}3^\circ$ is **Exalted** (*Param Uccha* $3^\circ$); Taurus $3^\circ\text{--}30^\circ$ is **Moolatrikona**; Cancer $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Mars**: Aries $0^\circ\text{--}12^\circ$ is **Moolatrikona**; Aries $12^\circ\text{--}30^\circ$ is **Own Sign**; Scorpio $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Mercury**: Virgo $0^\circ\text{--}15^\circ$ is **Exalted** (*Param Uccha* $15^\circ$); Virgo $15^\circ\text{--}20^\circ$ is **Moolatrikona**; Virgo $20^\circ\text{--}30^\circ$ is **Own Sign**; Gemini $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Jupiter**: Sagittarius $0^\circ\text{--}10^\circ$ is **Moolatrikona**; Sagittarius $10^\circ\text{--}30^\circ$ is **Own Sign**; Pisces $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Venus**: Libra $0^\circ\text{--}15^\circ$ is **Moolatrikona**; Libra $15^\circ\text{--}30^\circ$ is **Own Sign**; Taurus $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Saturn**: Aquarius $0^\circ\text{--}20^\circ$ is **Moolatrikona**; Aquarius $20^\circ\text{--}30^\circ$ is **Own Sign**; Capricorn $0^\circ\text{--}30^\circ$ is **Own Sign**.
- **Rahu**: Gemini $0^\circ\text{--}30^\circ$ is **Moolatrikona**; Aquarius $0^\circ\text{--}30^\circ$ is **Own Sign** (classical co-ruler with Saturn).
- **Ketu**: Sagittarius $0^\circ\text{--}30^\circ$ is **Moolatrikona**; Scorpio $0^\circ\text{--}30^\circ$ is **Exalted** (precedence over co-rulership with Mars).

### 4. Natural Relationships (Naisargika Sambandha)
When a planet is not exalted, debilitated, in Moolatrikona, or in its own sign, its dignity is derived from the ruler of the sign it occupies, mapped according to BPHS Ch. 3, v. 51–54:

| Graha | Friends (*Mitra*) | Neutrals (*Sama*) | Enemies (*Shatru*) |
|---|---|---|---|
| **Sun** | Moon, Mars, Jupiter | Mercury | Venus, Saturn, Rahu, Ketu |
| **Moon** | Sun, Mercury | Mars, Jupiter, Venus, Saturn | Rahu, Ketu |
| **Mars** | Sun, Moon, Jupiter | Venus, Saturn | Mercury, Rahu, Ketu |
| **Mercury** | Sun, Venus | Mars, Jupiter, Saturn | Moon, Rahu, Ketu |
| **Jupiter** | Sun, Moon, Mars | Saturn | Mercury, Venus, Rahu, Ketu |
| **Venus** | Mercury, Saturn | Mars, Jupiter | Sun, Moon, Rahu, Ketu |
| **Saturn** | Mercury, Venus | Jupiter | Sun, Moon, Mars, Rahu, Ketu |

---

## 4. Part C: Planetary Combustion (Asta) Engine

### 1. Minimal Geodesic Arc Formula
Combustion depends strictly on angular distance from the Sun on the ecliptic circle:
$$\Delta\lambda = \min(|\lambda_{\text{planet}} - \lambda_{\text{sun}}| \pmod{360^\circ}, 360^\circ - (|\lambda_{\text{planet}} - \lambda_{\text{sun}}| \pmod{360^\circ}))$$
This correctly handles proximity across the $0^\circ$ Aries / $360^\circ$ Pisces cusp (e.g., Sun at $358^\circ$ and Mars at $2^\circ$ yield $\Delta\lambda = 4.0^\circ$).

### 2. Classical Combustion Thresholds
Derived from classical Jyotish treatises (*Surya Siddhanta* and BPHS):

| Graha | Direct Threshold | Retrograde (*Vakri*) Threshold | Classical Rule Reference |
|---|---|---|---|
| **Sun** | N/A | N/A | Illuminating source; exempt |
| **Moon** | $12.0^\circ$ | $12.0^\circ$ | Standard visibility limit (*Amavasya*) |
| **Mars** | $17.0^\circ$ | $17.0^\circ$ | Classical outer planet threshold |
| **Jupiter** | $11.0^\circ$ | $11.0^\circ$ | High luminosity threshold |
| **Saturn** | $15.0^\circ$ | $15.0^\circ$ | Low luminosity threshold |
| **Mercury** | $14.0^\circ$ | $12.0^\circ$ | Inferior conjunction vs superior conjunction |
| **Venus** | $10.0^\circ$ | $8.0^\circ$ | Greatest brilliance at inferior conjunction |
| **Rahu / Ketu** | Exempt | Exempt | Mathematical eclipse nodes |

---

## 5. Part D & E: API & Architecture Verification

### 1. Endpoint Specification
- **HTTP Method**: `GET`
- **Route**: `/api/v1/astrology/birth-profiles/{profile_id}/planetary-dignities`
- **Query Parameters**:
  - `ayanamsha` (optional): `lahiri` (default), `raman`, `kp`
  - `node_type` (optional): `true` (default), `mean`
- **Security & Authorization**:
  - Requires valid JWT bearer token.
  - Profile must belong to authenticated user (`404 RESOURCE_NOT_FOUND` if owned by another user or missing).
  - Profile must have valid, known birth time (`422 UNKNOWN_BIRTH_TIME` if birth time is unknown).

### 2. Live Canonical Benchmark Output
Calculated for the reference native: **October 14, 1994, 06:45:00 IST** at Varanasi, India ($25.3176^\circ\text{ N}, 82.9739^\circ\text{ E}$), Lahiri Ayanamsha:

```json
{
  "birth_profile_id": "a03db4d9-7dea-44ad-b639-2934ee1ccaf5",
  "planets": [
    {
      "planet_id": "sun",
      "planet_name": "Sun",
      "sanskrit_name": "Surya",
      "longitude": 176.683369,
      "sign_number": 6,
      "sign_name": "Virgo",
      "sign_sanskrit": "Kanya",
      "sign_lord": "Mercury",
      "sign_lord_id": "mercury",
      "degree_in_sign": 26.683369,
      "formatted_dms": "26° 41' 00.13\"",
      "is_retrograde": false,
      "dignity": "neutral_sign",
      "sanskrit_dignity": "Sama Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 0.0,
        "combustion_threshold": null,
        "is_applicable": false,
        "explanation": "The Sun is the source of celestial illumination and cannot undergo combustion."
      },
      "explanation": "Sun occupies the sign of a neutral planet (Mercury)."
    },
    {
      "planet_id": "moon",
      "planet_name": "Moon",
      "sanskrit_name": "Chandra",
      "longitude": 294.388712,
      "sign_number": 10,
      "sign_name": "Capricorn",
      "sign_sanskrit": "Makara",
      "sign_lord": "Saturn",
      "sign_lord_id": "saturn",
      "degree_in_sign": 24.388712,
      "formatted_dms": "24° 23' 19.36\"",
      "is_retrograde": false,
      "dignity": "neutral_sign",
      "sanskrit_dignity": "Sama Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 117.705343,
        "combustion_threshold": 12.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (117.705343°) exceeds the direct (12.0°) threshold."
      },
      "explanation": "Moon occupies the sign of a neutral planet (Saturn)."
    },
    {
      "planet_id": "mars",
      "planet_name": "Mars",
      "sanskrit_name": "Mangala",
      "longitude": 101.410048,
      "sign_number": 4,
      "sign_name": "Cancer",
      "sign_sanskrit": "Karka",
      "sign_lord": "Moon",
      "sign_lord_id": "moon",
      "degree_in_sign": 11.410048,
      "formatted_dms": "11° 24' 36.17\"",
      "is_retrograde": false,
      "dignity": "debilitated",
      "sanskrit_dignity": "Neecha",
      "param_degree": 28.0,
      "distance_from_param_degree": 16.589952,
      "combustion": {
        "is_combust": false,
        "angular_separation": 75.273321,
        "combustion_threshold": 17.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (75.273321°) exceeds the direct (17.0°) threshold."
      },
      "explanation": "Mars is debilitated (Neecha) in Cancer, with deep debilitation (Param Neecha) at 28.0°."
    },
    {
      "planet_id": "mercury",
      "planet_name": "Mercury",
      "sanskrit_name": "Budha",
      "longitude": 191.208891,
      "sign_number": 7,
      "sign_name": "Libra",
      "sign_sanskrit": "Tula",
      "sign_lord": "Venus",
      "sign_lord_id": "venus",
      "degree_in_sign": 11.208891,
      "formatted_dms": "11° 12' 32.01\"",
      "is_retrograde": true,
      "dignity": "friendly_sign",
      "sanskrit_dignity": "Mitra Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 14.525522,
        "combustion_threshold": 12.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (14.525522°) exceeds the retrograde (12.0°) threshold."
      },
      "explanation": "Mercury occupies the sign of its natural friend (Venus)."
    },
    {
      "planet_id": "jupiter",
      "planet_name": "Jupiter",
      "sanskrit_name": "Guru",
      "longitude": 203.9148,
      "sign_number": 7,
      "sign_name": "Libra",
      "sign_sanskrit": "Tula",
      "sign_lord": "Venus",
      "sign_lord_id": "venus",
      "degree_in_sign": 23.9148,
      "formatted_dms": "23° 54' 53.28\"",
      "is_retrograde": false,
      "dignity": "enemy_sign",
      "sanskrit_dignity": "Shatru Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 27.231431,
        "combustion_threshold": 11.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (27.231431°) exceeds the direct (11.0°) threshold."
      },
      "explanation": "Jupiter occupies the sign of its natural enemy (Venus)."
    },
    {
      "planet_id": "venus",
      "planet_name": "Venus",
      "sanskrit_name": "Shukra",
      "longitude": 204.209955,
      "sign_number": 7,
      "sign_name": "Libra",
      "sign_sanskrit": "Tula",
      "sign_lord": "Venus",
      "sign_lord_id": "venus",
      "degree_in_sign": 24.209955,
      "formatted_dms": "24° 12' 35.84\"",
      "is_retrograde": true,
      "dignity": "own_sign",
      "sanskrit_dignity": "Swakshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 27.526586,
        "combustion_threshold": 8.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (27.526586°) exceeds the retrograde (8.0°) threshold."
      },
      "explanation": "Venus is situated in its own ruling sign (Swakshetra) of Libra."
    },
    {
      "planet_id": "saturn",
      "planet_name": "Saturn",
      "sanskrit_name": "Shani",
      "longitude": 312.477097,
      "sign_number": 11,
      "sign_name": "Aquarius",
      "sign_sanskrit": "Kumbha",
      "sign_lord": "Saturn",
      "sign_lord_id": "saturn",
      "degree_in_sign": 12.477097,
      "formatted_dms": "12° 28' 37.55\"",
      "is_retrograde": true,
      "dignity": "moolatrikona",
      "sanskrit_dignity": "Moolatrikona",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 135.793728,
        "combustion_threshold": 15.0,
        "is_applicable": true,
        "explanation": "Planet is not combust: angular separation (135.793728°) exceeds the retrograde (15.0°) threshold."
      },
      "explanation": "Saturn occupies its Moolatrikona zone (0.0°–20.0°) in Aquarius."
    },
    {
      "planet_id": "rahu",
      "planet_name": "Rahu",
      "sanskrit_name": "Rahu",
      "longitude": 201.282404,
      "sign_number": 7,
      "sign_name": "Libra",
      "sign_sanskrit": "Tula",
      "sign_lord": "Venus",
      "sign_lord_id": "venus",
      "degree_in_sign": 21.282404,
      "formatted_dms": "21° 16' 56.66\"",
      "is_retrograde": true,
      "dignity": "friendly_sign",
      "sanskrit_dignity": "Mitra Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 24.599035,
        "combustion_threshold": null,
        "is_applicable": false,
        "explanation": "Lunar nodes (Rahu and Ketu) are shadow intersections causing solar/lunar eclipses; classical Jyotish does not classify nodes as combustible."
      },
      "explanation": "Rahu occupies the sign of its natural friend (Venus)."
    },
    {
      "planet_id": "ketu",
      "planet_name": "Ketu",
      "sanskrit_name": "Ketu",
      "longitude": 21.282404,
      "sign_number": 1,
      "sign_name": "Aries",
      "sign_sanskrit": "Mesha",
      "sign_lord": "Mars",
      "sign_lord_id": "mars",
      "degree_in_sign": 21.282404,
      "formatted_dms": "21° 16' 56.66\"",
      "is_retrograde": true,
      "dignity": "friendly_sign",
      "sanskrit_dignity": "Mitra Kshetra",
      "param_degree": null,
      "distance_from_param_degree": null,
      "combustion": {
        "is_combust": false,
        "angular_separation": 155.400965,
        "combustion_threshold": null,
        "is_applicable": false,
        "explanation": "Lunar nodes (Rahu and Ketu) are shadow intersections causing solar/lunar eclipses; classical Jyotish does not classify nodes as combustible."
      },
      "explanation": "Ketu occupies the sign of its natural friend (Mars)."
    }
  ],
  "metadata": {
    "astrology_system": "vedic",
    "zodiac_type": "sidereal",
    "ayanamsha": "lahiri",
    "ayanamsha_value": 23.78422,
    "house_system": "whole_sign",
    "ephemeris_engine": "swiss_ephemeris",
    "ephemeris_version": "2.10.03",
    "calculation_timestamp": "2026-11-24T15:44:15.455568Z",
    "birth_datetime_utc": "1994-10-14T01:15:00Z",
    "birth_datetime_local": "1994-10-14 06:45:00 IST",
    "input_timezone": "Asia/Kolkata",
    "julian_day_ut": 2449639.552083,
    "birth_time_accuracy": "exact",
    "node_type": "true",
    "calculation_flags": 65792
  }
}
```

---

## 6. Part F: Test Suite & Verification Results

### 1. Planetary Dignity Test Suite (`tests/test_planetary_dignities.py`)
A comprehensive test suite of 25 tests was developed covering:
1. `test_angular_separation_basic`: Direct angular distance.
2. `test_angular_separation_wrap_around_0_deg`: Geodesic wrap-around across $0^\circ$ Aries.
3. `test_combustion_non_applicable_bodies`: Non-applicability for Sun, Rahu, and Ketu.
4. `test_combustion_moon_threshold`: $12^\circ$ boundary tests for Moon.
5. `test_combustion_mars_threshold`: $17^\circ$ boundary tests for Mars.
6. `test_combustion_jupiter_threshold`: $11^\circ$ boundary tests for Jupiter.
7. `test_combustion_saturn_threshold`: $15^\circ$ boundary tests for Saturn.
8. `test_combustion_mercury_direct_vs_retrograde`: Direct ($14^\circ$) vs retrograde ($12^\circ$) thresholds for Mercury.
9. `test_combustion_venus_direct_vs_retrograde`: Direct ($10^\circ$) vs retrograde ($8^\circ$) thresholds for Venus.
10. `test_all_planets_exaltation_and_param_uccha`: Exact *Param Uccha* degrees for all 9 bodies.
11. `test_exaltation_distance_from_param_degree`: Angular distance from deep exaltation.
12. `test_all_planets_debilitation_and_param_neecha`: Exact *Param Neecha* degrees ($180^\circ$ opposite).
13. `test_sun_moolatrikona_vs_own_sign`: Sun in Leo ($0^\circ\text{--}20^\circ$ MT vs $20^\circ\text{--}30^\circ$ Own).
14. `test_moon_exaltation_moolatrikona_and_own_sign`: Moon in Taurus ($0^\circ\text{--}3^\circ$ Exalted vs $3^\circ\text{--}30^\circ$ MT vs Cancer Own).
15. `test_mars_moolatrikona_vs_own_sign`: Mars in Aries ($0^\circ\text{--}12^\circ$ MT vs $12^\circ\text{--}30^\circ$ Own and Scorpio Own).
16. `test_mercury_exaltation_moolatrikona_own_sign`: Mercury in Virgo ($0^\circ\text{--}15^\circ$ Exalted vs $15^\circ\text{--}20^\circ$ MT vs $20^\circ\text{--}30^\circ$ Own and Gemini Own).
17. `test_jupiter_moolatrikona_vs_own_sign`: Jupiter in Sagittarius ($0^\circ\text{--}10^\circ$ MT vs $10^\circ\text{--}30^\circ$ Own and Pisces Own).
18. `test_venus_moolatrikona_vs_own_sign`: Venus in Libra ($0^\circ\text{--}15^\circ$ MT vs $15^\circ\text{--}30^\circ$ Own and Taurus Own).
19. `test_saturn_moolatrikona_vs_own_sign`: Saturn in Aquarius ($0^\circ\text{--}20^\circ$ MT vs $20^\circ\text{--}30^\circ$ Own and Capricorn Own).
20. `test_rahu_ketu_moolatrikona_and_own_signs`: Rahu in Gemini/Aquarius, Ketu in Sagittarius/Scorpio.
21. `test_natural_relationships_friendly_neutral_enemy`: Verification of BPHS natural relationships.
22. `test_get_planetary_dignities_success`: End-to-end HTTP 200 response verification.
23. `test_get_planetary_dignities_with_ayanamsha_override`: Verification of query param overrides.
24. `test_planetary_dignities_unknown_birth_time_error`: Rejection of unknown birth times with 422 `UNKNOWN_BIRTH_TIME`.
25. `test_planetary_dignities_tenant_isolation`: Cross-tenant access protection with 404 `RESOURCE_NOT_FOUND`.

### 2. Full Regression Test Execution
The complete backend test suite was run:
```bash
pytest -v
```
**Results:**
```
======================= 149 passed in 95.55s (0:01:35) ========================
```
- Total test files: 12
- Total tests collected: 149
- Total passed: 149
- Total failed: 0
- Regressions: 0

---

## 7. Compliance Checklist

| Requirement | Status | Notes |
|---|---|---|
| Part A: Dasha JSON documentation fix | **VERIFIED** | Mirrored in both audit report directories |
| Part A: Out-of-range timeline handling | **VERIFIED** | Returns `null` active periods with explicit advisory |
| Part A: Out-of-range regression tests | **VERIFIED** | Tested pre-birth and post-120-year dates |
| Part B: 9 Graha dignities calculated | **VERIFIED** | All 9 Navagrahas supported |
| Part B: Param Uccha / Param Neecha degrees | **VERIFIED** | Exact degrees and distances computed |
| Part B: Moolatrikona explicit degree spans | **VERIFIED** | Not treating whole signs as MT |
| Part B: BPHS natural relationships | **VERIFIED** | Friendly, Neutral, Enemy signs derived |
| Part C: Angular separation on 360° circle | **VERIFIED** | Handles 0° wrap-around |
| Part C: Classical combustion thresholds | **VERIFIED** | Moon 12°, Mars 17°, Jup 11°, Sat 15° |
| Part C: Mercury/Venus retrograde thresholds | **VERIFIED** | Merc 14°/12°, Venus 10°/8° |
| Part C: Sun / Rahu / Ketu exemptions | **VERIFIED** | Marked non-applicable, never combust |
| Part D: Pydantic schemas defined | **VERIFIED** | `PlanetaryDignitiesResponse`, etc. |
| Part E: REST endpoint implemented | **VERIFIED** | `GET /api/v1/astrology/birth-profiles/{id}/planetary-dignities` |
| Part E: Tenant isolation & accuracy checks | **VERIFIED** | 404 on isolation, 422 on unknown time |
| Part F: Dedicated unit & API tests | **VERIFIED** | 25 tests passing in `test_planetary_dignities.py` |
| Part F: Zero regressions across backend | **VERIFIED** | 149/149 total tests passing |

---

## 8. Conclusion & Sign-Off

Batch 6F-1 has been implemented and tested to production standards. All astronomical, mathematical, and classical Vedic astrology specifications from *Brihat Parashara Hora Shastra* and *Surya Siddhanta* have been verified. The backend is fully prepared for upcoming sub-batches (such as Graha Drishti and Vedic Yogas).
