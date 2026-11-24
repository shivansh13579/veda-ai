# Veda AI: Batch 6E Independent Verification Audit
## Vimshottari Dasha Engine

**Date:** 2026-11-24  
**Audit Type:** Strictly Read-Only Implementation & Architectural Audit  
**Audited Batch:** Phase 3 – Batch 6E (Vimshottari Dasha Engine)  
**Target Repository:** `veda-ai-backend`  
**Overall Verdict:** **APPROVED WITH CONDITIONS**

---

## 1. Executive Summary

This document presents a strictly read-only, forensic technical audit of the **Vimshottari Dasha Engine** implemented in Batch 6E for the Veda AI backend.

The audit inspected:
- Mathematical calculations (`app/astrology/utils/dasha_utils.py`)
- High-level orchestration & validation (`app/astrology/services/vimshottari_dasha_service.py`)
- Pydantic v2 schemas (`app/astrology/schemas/dasha.py`)
- REST API endpoint & parameters (`app/api/v1/endpoints/astrology.py`)
- Test suite & assertions (`tests/test_vimshottari_dasha.py`)
- Integration with foundation services (`PlanetaryService`, `SwissEphemerisWrapper`, `BirthProfileService`)

### Final Verdict: APPROVED WITH CONDITIONS
The engine is mathematically sound, architecturally clean, tenant-isolated, and passes 100% of all 123 automated test cases. The conditions for full production readiness pertain to:
1. Clarifying illustrative vs. live sample outputs in documentation.
2. Formalizing out-of-bounds behavior for query dates beyond the 120-year cycle.
3. Adding explicit test assertions for multi-cycle lifespans and sub-second boundary limits.

---

## 2. Verification Requirements Matrix

| Requirement | Audit Focus | Verified Status | Code Reference |
| :--- | :--- | :---: | :--- |
| **1. 9 Mahadasha Durations & 120y Total** | Parashari durations ($7, 20, 6, 10, 7, 18, 16, 19, 17$) summing to 120.0 years | **VERIFIED** | `app/astrology/constants.py:159-171` |
| **2. 27 Nakshatra Lord Mappings** | Cyclic 9-lord sequence ($Ketu \rightarrow Mercury$) across all 27 mansions | **VERIFIED** | `app/astrology/utils/dasha_utils.py:88` |
| **3. Moon Longitude Boundary & Normalization** | $0^\circ$, $360^\circ$, negative wrap-around, and edge-clamping | **VERIFIED** | `app/astrology/utils/dasha_utils.py:66-78` |
| **4. Birth Balance & Pre-Birth Anchoring** | Balance $= (1 - f_{\text{elapsed}}) \times D_M$; $T_0 = T_{\text{birth}} - \Delta t_{\text{elapsed}}$ | **VERIFIED** | `app/astrology/utils/dasha_utils.py:91-95, 197-198` |
| **5. Antardasha & Pratyantardasha Formulas** | $D_A = \frac{D_M \times D_A}{120}$; $D_P = \frac{D_M \times D_A \times D_P}{14400}$ | **VERIFIED** | `app/astrology/utils/dasha_utils.py:136, 167-168` |
| **6. Period Sequences & Continuity** | $T_{\text{end}}[i] \equiv T_{\text{start}}[i+1]$; zero gaps, zero overlaps | **VERIFIED** | `app/astrology/utils/dasha_utils.py:216-218, 241, 266` |
| **7. Current-Period Selection & Boundaries** | Half-open intervals: $T_{\text{start}} \le \text{as\_of} < T_{\text{end}}$ | **VERIFIED** | `app/astrology/utils/dasha_utils.py:221, 244, 269` |
| **8. Timezone Handling & UTC Normalization** | Naive and aware datetime normalization with IANA timezone lookup | **VERIFIED** | `app/astrology/utils/dasha_utils.py:187-190` |
| **9. Year Conventions (365.25d vs. 360d)** | Configurable solar Julian year vs. classical Savana year | **VERIFIED** | `app/astrology/constants.py:174-182` |
| **10. Engine & Ephemeris Uniformity** | Same Swiss Ephemeris wrapper, Ayanamsha, and Moon calculation | **VERIFIED** | `app/astrology/services/vimshottari_dasha_service.py:84-95` |
| **11. Validation & Multi-Tenant Security** | Unknown birth-time rejection (422) & tenant isolation (404) | **VERIFIED** | `app/astrology/services/vimshottari_dasha_service.py:66-70` |
| **12. Historical & Future Timeline Coverage** | Full 120-year coverage relative to calculated $T_0$ anchor | **VERIFIED** | `app/astrology/utils/dasha_utils.py:210-219` |
| **13. API Response Consistency** | Representative response comparison against live calculation | **FINDING LOGGED** | `docs/audits/VIMSHOTTARI_DASHA_BATCH_6E_REPORT.md:152-221` |

---

## 3. Deep-Dive Mathematical & Forensic Analysis

### 3.1 Planetary Durations & 120-Year Total (Requirement 1)
In `app/astrology/constants.py` (lines 159–171):
```python
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
```
- **Sum Verification**: $7 + 20 + 6 + 10 + 7 + 18 + 16 + 19 + 17 = 120.0$.
- **Adherence**: Strictly matches *Brihat Parashara Hora Shastra* (BPHS), Chapter 46 (Vimshottari Dasha).
- **Test Coverage**: Verified in `test_all_nine_mahadasha_durations()` and `test_total_vimshottari_cycle_duration()`.

### 3.2 27 Nakshatras to Lord Mapping (Requirement 2)
In `app/astrology/utils/dasha_utils.py` (lines 69–88):
```python
nak_idx = int(total_arcmin // NAKSHATRA_SPAN_MINUTES)
if nak_idx >= 27:
    nak_idx = 26
...
lord_name = VIMSHOTTARI_LORDS[nak_idx % 9]
```
- The 27 Nakshatras span $13^\circ 20'$ ($800$ arcminutes) each: $27 \times 800' = 21600' = 360^\circ$.
- Cycle 1 (Ashwini–Ashlesha, $0^\circ - 120^\circ$): Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury.
- Cycle 2 (Magha–Jyeshtha, $120^\circ - 240^\circ$): Identical 9-lord sequence.
- Cycle 3 (Mula–Revati, $240^\circ - 360^\circ$): Identical 9-lord sequence.
- **Test Coverage**: Tested across all 27 mansions in `test_all_27_nakshatras_mapping_to_lords()`.

### 3.3 Moon Longitude Normalization & Boundary Handling (Requirement 3)
In `app/astrology/utils/dasha_utils.py` (lines 66–78):
- `norm_lon = normalize_degrees(moon_longitude)` enforces $\lambda \in [0.0, 360.0)$ via modulo arithmetic (`deg % 360.0`).
- If `moon_longitude == 360.0`: $360.0 \pmod{360.0} = 0.0^\circ$ (Ashwini, Ketu, $0'$ elapsed).
- If `moon_longitude == -0.001`: $-0.001 \pmod{360.0} = 359.999^\circ$ (Revati, Mercury).
- `total_arcmin = norm_lon * 60.0`.
- Clamping safeguard:
  ```python
  if arcmin_in_nak < 0.0:
      arcmin_in_nak = 0.0
  elif arcmin_in_nak > NAKSHATRA_SPAN_MINUTES:
      arcmin_in_nak = NAKSHATRA_SPAN_MINUTES
  ```
  Prevents floating-point precision artifacts from generating negative fractions or values $> 1.0$.

### 3.4 Birth Balance & Pre-Birth Timeline Anchoring (Requirement 4)
In `app/astrology/utils/dasha_utils.py` (lines 91–98, 197–198):
$$f_{\text{elapsed}} = \frac{\text{arcmin\_in\_nak}}{800.0}, \quad f_{\text{remaining}} = 1.0 - f_{\text{elapsed}}$$
$$\Delta t_{\text{elapsed}} = f_{\text{elapsed}} \times D_M \times \text{days\_per\_year}$$
$$T_0 = T_{\text{birth}} - \Delta t_{\text{elapsed}}$$
$$\text{md\_end}_0 = T_0 + (D_M \times \text{days\_per\_year}) = T_{\text{birth}} + (f_{\text{remaining}} \times D_M \times \text{days\_per\_year})$$
- **Forensic Verification**:
  - The first Mahadasha does **not** reset at the birth instant; it correctly starts at $T_0$ in the past.
  - The remaining time from $T_{\text{birth}}$ to $\text{md\_end}_0$ strictly equals the remaining balance.
  - The elapsed Antardashas prior to birth are naturally placed in the historical timeline before $T_{\text{birth}}$, so an inquiry at $T_{\text{birth}}$ immediately identifies the exact Antardasha running at the moment of birth.

### 3.5 Antardasha & Pratyantardasha Formulations (Requirement 5)
In `app/astrology/utils/dasha_utils.py` (lines 124–137, 158–170):
$$\text{Duration}(A) = \frac{D_M \times D_A}{120.0} \quad (\text{years})$$
$$\text{Duration}(P) = \frac{\text{Duration}(A) \times D_P}{120.0} = \frac{D_M \times D_A \times D_P}{14400.0} \quad (\text{years})$$
- **Mathematical Sum Proofs**:
  - $\sum_{A=0}^8 \text{Duration}(A) = \frac{D_M}{120} \sum D_A = \frac{D_M \times 120}{120} = D_M$. (Max delta in code: $0.000000\text{ s}$).
  - $\sum_{P=0}^8 \text{Duration}(P) = \frac{\text{Duration}(A)}{120} \sum D_P = \text{Duration}(A)$. (Max delta in code: $< 10^{-8}\text{ s}$).
- **Sequence**:
  - Antardasha starts with Mahadasha lord: `VIMSHOTTARI_LORDS[(start_idx + i) % 9]`.
  - Pratyantardasha starts with Antardasha lord: `VIMSHOTTARI_LORDS[(start_idx + j) % 9]`.

### 3.6 Timestamp Continuity & Cumulative Drift Prevention (Requirement 6)
In `app/astrology/utils/dasha_utils.py` (lines 216–218, 241, 266):
```python
md_start = timeline_cursor
md_end = md_start + timedelta(days=md_duration_days)
timeline_cursor = md_end
...
ad_end = md_end if a_idx == 8 else ad_start + timedelta(days=ad_days)
...
pd_end = ad_end if p_idx == 8 else pd_start + timedelta(days=pd_days)
```
- **Continuity**: Because each subsequent period assigns $T_{\text{start}} \leftarrow T_{\text{end}}$, there are **zero gaps and zero overlaps**.
- **Boundary Clamping**: Clamping the 9th sub-period (`a_idx == 8` and `p_idx == 8`) directly to the enclosing parent end timestamp guarantees that no sub-microsecond IEEE 754 precision drift escapes to the next period.

### 3.7 Boundary Condition & Active Dasha Resolution (Requirement 7)
In `app/astrology/utils/dasha_utils.py` (lines 221, 244, 269):
```python
is_md_current = (md_start <= as_of_utc < md_end) or (i == 8 and as_of_utc == md_end)
```
- Standard interval is half-open: $[T_{\text{start}}, T_{\text{end}})$.
- At an exact transition point $t = T_{\text{boundary}}$:
  - Expiring period: $t < T_{\text{end}}$ evaluates to `False`.
  - Commencing period: $T_{\text{start}} \le t$ evaluates to `True`.
  - Unambiguously designates the newly beginning period as active.
- Verified in `test_current_dasha_selection_and_transition_boundary()`.

### 3.8 Timezone Handling & UTC Normalization (Requirement 8)
- Local birth datetimes are parsed via IANA timezone identifiers using `ZoneInfo` (`app/astrology/utils/datetime_utils.py:13–24`).
- All internal arithmetic operates on offset-aware UTC datetimes (`tzinfo=timezone.utc`).
- Naive datetime inputs to `build_vimshottari_timeline` are safely coerced to UTC:
  ```python
  if birth_dt_utc.tzinfo is None:
      birth_dt_utc = birth_dt_utc.replace(tzinfo=timezone.utc)
  if as_of_utc.tzinfo is None:
      as_of_utc = as_of_utc.replace(tzinfo=timezone.utc)
  ```
- Verified by `test_timezone_normalization_impact()` comparing Tokyo (UTC+9) vs. New York (UTC-5).

### 3.9 Year Conventions: 365.25 vs. 360.0 Days (Requirement 9)
In `app/astrology/constants.py`:
- `DEFAULT_DASHA_YEAR_DAYS = 365.25`: Standard modern solar Julian calendar year.
- `SAVANA_360 = 360.0`: Traditional Savana year (12 months $\times$ 30 days).
- Cumulative shift over 120-year cycle:
  $$\Delta T = 120 \times (365.25 - 360.0) = 630.0 \text{ solar days} \approx 1.7248 \text{ years}$$
- Supported via API query parameter: `?year_length=360.0` or `?year_length=365.25`. Non-positive inputs return HTTP 400 (`test_invalid_year_length_parameter`).

### 3.10 Engine Uniformity (Requirement 10)
In `app/astrology/services/vimshottari_dasha_service.py` (lines 84–95):
- Invokes `PlanetaryService.calculate_for_birth_profile(...)`, ensuring:
  - Same Swiss Ephemeris C-library bindings under thread-safe mutex `_SWE_LOCK`.
  - Same Julian Day calculation (`datetime_to_julian_day`).
  - Same sidereal Ayanamsha setting (`swe.set_sid_mode`).
  - Same lunar node convention (`swe.TRUE_NODE` vs. `swe.MEAN_NODE`).
- Moon sidereal longitude $\lambda_{\text{Moon}}$ is directly harvested from the Navagraha calculation without duplication.

### 3.11 Multi-Tenant Isolation & Unknown Birth-Time Rejection (Requirement 11)
- **Tenant Isolation**: `BirthProfileService.get_profile(db, profile_id, user_id=current_user.id)` verifies profile ownership. Cross-user requests return HTTP 404 (`RESOURCE_NOT_FOUND`), preventing ID enumeration (`test_api_multi_tenant_isolation`).
- **Unknown Time Rejection**: Profiles with `birth_time_accuracy == "unknown"` or `time_of_birth is None` are rejected upfront with HTTP 422 (`UNKNOWN_BIRTH_TIME`), preventing spurious timelines (`test_api_unknown_birth_time_rejected`).

---

## 4. Benchmark Reference Case (Varanasi Native)

To ensure astrological fidelity independent of test suites, the engine was cross-checked against our canonical benchmark birth event:
- **Birth Details**: October 14, 1994, 06:45:00 IST (01:15:00 UTC) at Varanasi, India ($25.3176^\circ\text{ N}, 82.9739^\circ\text{ E}$).
- **Lahiri Ayanamsha**: $23^\circ 47' 13.97''$.

### Astronomical Calculations:
1. **Moon Sidereal Longitude**: $294.388712^\circ$ (Capricorn $24^\circ 23' 19.36''$).
2. **Nakshatra**: 23 (**Dhanishta**), Pada 1 (Dhanishta spans $293^\circ 20' - 306^\circ 40'$).
3. **Birth Mahadasha Lord**: **Mars** (Mangala), duration = 7.0 years.
4. **Distance in Nakshatra**:
   $$294.388712^\circ - 293.333333^\circ = 1.055379^\circ = 63.32274'$$
   $$\text{Elapsed Fraction} = \frac{63.32274'}{800.0'} = 0.0791534 \quad (7.9153\%)$$
   $$\text{Remaining Fraction} = 1.0 - 0.0791534 = 0.9208466 \quad (92.0847\%)$$
5. **Birth Balance**:
   $$\text{Balance} = 0.9208466 \times 7.0 = 6.445926 \text{ years} \rightarrow \mathbf{6\text{ years}, 5\text{ months}, 11\text{ days}}$$
   $$\text{Elapsed Prior to Birth} = 0.0791534 \times 7.0 = 0.554074 \text{ years}$$
6. **Active Periods as of Today (2026-11-24 UTC)**:
   - **Mahadasha**: **Jupiter** ($2019-03-25 \rightarrow 2035-03-25$)
   - **Antardasha**: **Ketu** ($2026-03-01 \rightarrow 2027-02-05$)
   - **Pratyantardasha**: **Saturn** ($2026-10-25 \rightarrow 2026-12-18$)

All calculations were confirmed by executing the underlying service against the live ephemeris.

---

## 5. Critical Audit Findings & Observations

### Finding 1: Illustrative Sample vs. Live Execution Mismatch in Batch 6E Report
- **Location**: `docs/audits/VIMSHOTTARI_DASHA_BATCH_6E_REPORT.md` (Section 5).
- **Observation**:
  In Section 5 of the completion report, the representative JSON response for a native born October 24, 1995 IST with Moon in Swati displayed:
  - `current_antardasha.start_date: "2025-08-14T02:30:00Z"`
  - `current_pratyantardasha.planet: "Moon"` (`start_date: 2026-10-18`)
  However, executing the actual mathematical engine with those parameters reveals:
  - In Saturn Mahadasha, Venus Antardasha began on `2024-10-19` (not August 2025).
  - On `2026-11-24`, the active Pratyantardasha is **Saturn** (running `2026-10-31` to `2027-05-02`), not Moon.
- **Root Cause**: The JSON snippet was drafted as an illustrative mock template during early documentation rather than piped verbatim from test execution.
- **Impact**: Zero runtime impact (the Python code and tests calculate exact timestamps); however, documentation must accurately reflect real serializations to prevent developer confusion.

### Finding 2: Edge Case Behavior for Query Dates Beyond 120 Years
- **Location**: `app/astrology/utils/dasha_utils.py` (lines 320–368).
- **Observation**:
  If a client submits `as_of` set to an instant before $T_0$ (e.g. 50 years prior to birth) or beyond 120 years (e.g. age 125):
  - In `timeline`, all periods have `is_current = False`. (Correct: the date falls outside the 120-year cycle).
  - However, `current_md` falls back to `timeline[-1]` (the 9th Mahadasha), and `current_ad` and `current_pd` fall back to the **first** Antardasha/Pratyantardasha of that Mahadasha (`seq[0]`).
- **Impact**: While it prevents HTTP 500 crashes and `NoneType` attribute errors, returning the *first* Antardasha of the *last* Mahadasha for an instant past year 120 is logically inconsistent.
- **Recommendation**: For dates strictly outside $[T_0, T_0 + 120\text{y}]$, either:
  1. Return `null` for `current_mahadasha`, `current_antardasha`, and `current_pratyantardasha` with a descriptive message; or
  2. Implement an optional multi-cycle modulo generator for lifespans exceeding 120 years.

### Finding 3: Clamping of Sub-periods on the 9th Iteration
- **Location**: `app/astrology/utils/dasha_utils.py` (lines 241, 266).
- **Observation**:
  `ad_end = md_end if a_idx == 8 else ad_start + timedelta(days=ad_days)`.
  This clamps the 9th Antardasha's end date directly to the Mahadasha's end date.
- **Assessment**: This is **good engineering practice**. Our analysis confirmed that the IEEE 754 float discrepancy across 9 subdivisions is less than $10^{-8}$ seconds (sub-microsecond), ensuring cumulative stability across century-long timelines.

### Finding 4: External Software Reference Claim Distinction
- **Observation**:
  The report mentions alignment with *Jagannatha Hora* regarding the default $365.25$-day solar year.
- **Clarification**:
  This indicates alignment with the **mathematical conventions** standard in *Jagannatha Hora* and BPHS literature (solar calendar year vs. 360-day Savana year). It does **not** signify an automated binary comparison against a Jagannatha Hora GUI export, as Jagannatha Hora is a proprietary Windows application without an official headless Linux/CI API.

---

## 6. Security & Multi-Tenancy Review

- **Authentication**: All astrology endpoints are gated by `get_current_user`, verifying Bearer JWTs and ensuring `is_active=True`.
- **Tenant Scoping**: All database profile accesses go through `BirthProfileService.get_profile(db, profile_id, user_id=current_user.id)` which enforces `WHERE id = :profile_id AND user_id = :user_id`.
- **Enumeration Resistance**: Attempting to access another tenant's birth profile returns HTTP 404 (`RESOURCE_NOT_FOUND`) rather than HTTP 403, preventing attackers from probing for valid UUIDs.
- **Parameter Injection**: Pydantic v2 schemas and FastAPI Query parameter typing strictly enforce constraints (e.g. `year_length > 0`, `level in ('mahadasha', 'antardasha', 'pratyantardasha')`).

---

## 7. Test Suite Health & Coverage

The test suite was executed in an isolated async SQLite environment:
- Total tests executed: **123 passed in 59.21s**
- Batch 6E suite: **18 tests in `tests/test_vimshottari_dasha.py`**, 100% passing.
- Regressions on Batches 6A–6D-3: **0 regressions** across 105 prior tests.

### Recommended Test Suite Additions (for future hardening):
1. **Centenarian & Boundary Test**: Explicit test verifying behavior when `as_of` is 125 years after birth.
2. **Pre-Natal Query Test**: Test querying `as_of` 10 years before the birth date.
3. **Leap Second & Millisecond Resolution**: Test that microsecond increments around boundary timestamps transition cleanly without exceptions.

---

## 8. Production Readiness Assessment & Conclusion

### Production Readiness: **HIGH (APPROVED WITH CONDITIONS)**

The core calculation engine is robust, fast, mathematically correct, and cleanly decoupled from persistence. It does not introduce database migrations, third-party API dependencies, or security regressions.

### Conditions for Final Production Deployment:
1. **Doc Correction**: Update the illustrative JSON response in `docs/audits/VIMSHOTTARI_DASHA_BATCH_6E_REPORT.md` with the verified programmatic output from the live calculation service.
2. **Out-of-Bounds Documentation**: Document in the API documentation that timeline generation covers the classical 120-year cycle, and that queries with `as_of` beyond 120 years from $T_0$ will return boundary-clamped values.
