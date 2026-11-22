# Veda AI Backend Engine (`veda-ai-backend`)

The backend engine for **Veda AI** — an enterprise-grade Vedic astrology platform synthesizing high-precision classical Parashara and Jaimini calculations with modern asynchronous architecture.

---

## 1. Technology Stack

- **Runtime**: Python 3.12+ (Tested on Python 3.12 & 3.13)
- **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous, High-performance)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (with uvloop)
- **Database Engine**: [PostgreSQL 16](https://www.postgresql.org/)
- **ORM & Core**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with full async/await support
- **Database Driver**: [asyncpg](https://github.com/MagicStack/asyncpg) (Fastest PostgreSQL driver for Python)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) (Async-compatible schema manager)
- **Settings & Validation**: [Pydantic v2](https://docs.pydantic.dev/latest/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Testing**: [Pytest](https://docs.pytest.org/), [pytest-asyncio](https://pytest-asyncio.readthedocs.io/), [HTTPX](https://www.python-httpx.org/)
- **Containerization**: Docker & Docker Compose

---

## 2. Repository Structure

```
veda-ai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application factory & lifecycle management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                 # get_current_user & require_roles dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py           # Unified v1 API router
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── astrology.py    # Astrology engine diagnostic endpoint
│   │           ├── auth.py         # Authentication & token endpoints
│   │           ├── birth_profiles.py # Birth Profile management endpoints
│   │           ├── health.py       # Health check with active database probe
│   │           └── root.py         # Versioned root metadata
│   ├── astrology/                  # Astrology Calculation Engine (Batch 6D-1 & 6D-2)
│   │   ├── __init__.py
│   │   ├── config.py               # Astrology engine configuration
│   │   ├── constants.py            # Navagraha, zodiac signs, ayanamshas, nakshatras, lords
│   │   ├── exceptions.py           # Domain calculation exceptions
│   │   ├── ephemeris/
│   │   │   ├── __init__.py
│   │   │   └── swiss_ephemeris.py  # Thread-safe Swiss Ephemeris wrapper
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ascendant_service.py # Sidereal Ascendant (Lagna) service
│   │   │   ├── bhava_service.py     # 12 Whole Sign Bhavas service
│   │   │   ├── house_placement_service.py # Navagraha house placement service
│   │   │   ├── lagna_chart_service.py # Unified D1 Lagna Chart service
│   │   │   └── planetary_service.py # Planetary positions service
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── ascendant.py        # Ascendant & Nakshatra schemas
│   │   │   ├── bhava.py            # Bhava & Lagna chart schemas
│   │   │   └── planetary.py        # Planetary position & metadata schemas
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── coordinate_utils.py # Degree normalization & DMS formatting
│   │       ├── datetime_utils.py   # Timezone localization & Julian Day UT
│   │       ├── house_utils.py      # Whole Sign houses & planet house mapping
│   │       └── nakshatra_utils.py  # 27 Nakshatras, 4 Padas & Vimshottari lords
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic Settings & environment validation
│   │   ├── exceptions.py           # Standardized error hierarchy
│   │   ├── security.py             # Password hashing & JWT management
│   │   └── timezones.py            # Standard IANA timezone reference set
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                 # DeclarativeBase & TimestampMixin
│   │   ├── session.py              # Async engine, sessionmaker & connection probe
│   │   └── models/
│   │       ├── __init__.py
│   │       ├── user.py             # User model with role constraints
│   │       ├── refresh_session.py  # RefreshSession with lineage tracking
│   │       ├── password_reset_token.py # PasswordResetToken model
│   │       └── birth_profile.py    # BirthProfile model with coordinate constraints
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py               # ErrorResponse & shared schemas
│   │   ├── health.py               # HealthResponse & RootResponse
│   │   ├── user.py                 # User & authentication schemas
│   │   └── birth_profile.py        # BirthProfile create, update & response schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py         # Auth workflows & token rotation
│   │   ├── birth_profile_service.py # Birth profile lifecycle & default management
│   │   └── email_service.py        # Transactional email dispatcher
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py      # User queries
│   │   ├── session_repository.py   # Refresh session queries & atomic CAS
│   │   ├── password_reset_repository.py # Password reset token queries
│   │   └── birth_profile_repository.py # User-scoped birth profile queries
│   └── utils/                      # Astrological helpers & math utilities
├── alembic/
│   ├── env.py                      # Async migration runner connected to Base.metadata
│   ├── script.py.mako              # Revision file template
│   └── versions/
│       ├── 0001_create_auth_and_user_tables.py
│       └── 0002_create_birth_profiles.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures and async test client
│   ├── test_astrology_engine.py    # Astrology engine & reference tests (18 tests)
│   ├── test_auth.py                # Authentication endpoint tests
│   ├── test_birth_profiles.py      # Birth profile CRUD & default tests
│   ├── test_config.py              # Configuration & exception tests
│   ├── test_health.py              # Health endpoint & probe tests
│   ├── test_root.py                # Root endpoint tests
│   └── test_security_audit.py      # Security audit test suite (16 tests)
├── .env.example                    # Environment template with development defaults
├── .gitignore                      # Git exclusion rules
├── alembic.ini                     # Alembic configuration
├── Dockerfile                      # Production-ready multi-stage Python container
├── docker-compose.yml              # PostgreSQL 16 + FastAPI local orchestration
├── requirements.txt                # Pinned production and test dependencies
└── README.md                       # Comprehensive engineering documentation
```

---

## 3. Prerequisites

- **Python**: 3.12 or higher installed locally (`python --version`)
- **Git**: Installed
- **Docker & Docker Compose**: (Optional for containerized workflow)

---

## 4. Local Environment Setup (Python Virtual Environment)

### Step 1: Create a Virtual Environment
Navigate to the `veda-ai-backend` directory and create an isolated virtual environment:

```bash
cd veda-ai-backend
python -m venv .venv
```

### Step 2: Activate the Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt)**:
  ```cmd
  .\.venv\Scripts\activate.bat
  ```
- **macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```

### Step 3: Upgrade pip and Install Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Adjust `.env` variables if your local PostgreSQL credentials differ from the defaults:
```ini
APP_NAME="Veda AI Backend API"
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=veda_ai_db
POSTGRES_USER=veda_user
POSTGRES_PASSWORD=veda_password
DATABASE_URL=postgresql+asyncpg://veda_user:veda_password@localhost:5432/veda_ai_db
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]
```

---

## 5. Running with Docker Compose (Recommended for Full Stack)

To run both the **PostgreSQL 16** database and the **FastAPI** application simultaneously:

```bash
# Build images and start services in the background
docker compose up --build -d

# Check service status and health
docker compose ps

# View live application logs
docker compose logs -f backend

# Stop services
docker compose down
```

The database includes a container healthcheck (`pg_isready`) ensuring the backend only starts once PostgreSQL is fully accepting connections.

---

## 6. Running FastAPI Locally

With your virtual environment active and PostgreSQL running locally:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server endpoints will be accessible at:
- **Root**: `http://localhost:8000/`
- **API v1**: `http://localhost:8000/api/v1/`
- **Health Check**: `http://localhost:8000/api/v1/health`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc API Documentation**: `http://localhost:8000/redoc`

---

## 7. Database Migrations (Alembic)

Alembic is pre-configured to execute migrations asynchronously using `asyncpg`.

```bash
# Create a new migration revision (autogenerating from app.db.base models)
alembic revision --autogenerate -m "initial_migration"

# Apply pending migrations to the database
alembic upgrade head

# Roll back the most recent migration
alembic downgrade -1

# Show current migration revision
alembic current
```

---

## 8. Health Check Verification Behavior

The health check endpoint at `GET /api/v1/health` probes the database before reporting status:

- **When Database is Connected**:
  - HTTP Status: `200 OK`
  - Body:
    ```json
    {
      "status": "healthy",
      "app_name": "Veda AI Backend API",
      "version": "0.1.0",
      "environment": "development",
      "database": "connected",
      "database_latency_ms": 1.25,
      "timestamp": "2026-11-19T14:30:00.000000Z",
      "detail": null
    }
    ```

- **When Database is Disconnected / Unreachable**:
  - HTTP Status: `503 Service Unavailable`
  - Body:
    ```json
    {
      "status": "unhealthy",
      "app_name": "Veda AI Backend API",
      "version": "0.1.0",
      "environment": "development",
      "database": "disconnected",
      "database_latency_ms": 15.4,
      "timestamp": "2026-11-19T14:30:00.000000Z",
      "detail": "Database unreachable: Connection refused..."
    }
    ```

---

## 9. Running Automated Tests

Run the full Pytest test suite:

```bash
pytest
```

Run with verbose output and coverage:

```bash
pytest -v -s
```

The test suite validates:
1. Root application metadata (`GET /`).
2. API v1 index (`GET /api/v1/`).
3. Health check with healthy database connection (`200 OK`).
4. Health check with degraded / unreachable database (`503 Service Unavailable`).
5. Live graceful probe handling when database is offline.
6. Pydantic Settings configuration, CORS parsing, and URL assembly.
7. Custom exception response mapping.

---

## 10. Authentication & Security (Batch 6B)

The authentication system implements token-based authentication using short-lived JWT access tokens and cryptographically hashed, rotating refresh tokens.

### Endpoints
- `POST /api/v1/auth/register` — Public client account registration.
- `POST /api/v1/auth/login` — Authenticates credentials; returns access token and sets HTTP-only `refresh_token` cookie.
- `POST /api/v1/auth/refresh` — Rotates refresh token (CAS atomic); returns new access token and updates cookie.
- `POST /api/v1/auth/logout` — Revokes active refresh session and clears cookie.
- `GET /api/v1/auth/me` — Retrieves current database user profile.
- `POST /api/v1/auth/forgot-password` — Issues single-use, hashed password reset token (silent 200).
- `POST /api/v1/auth/reset-password` — Consumes reset token and invalidates all active sessions for the user.

---

## 11. Birth Profile Management (Batch 6C)

The Birth Profile module allows authenticated users to create, view, update, and manage multiple Vedic birth charts with strict ownership isolation.

### Features & Business Rules
1. **Strict User Scoping**: All operations (`GET`, `POST`, `PATCH`, `DELETE`) are scoped strictly to the authenticated user's ID derived from their JWT. Cross-user access attempts return `404 Not Found` to prevent data leakage.
2. **Atomic Default Profile Mechanics**:
   - The first birth profile created by a user is automatically marked as default (`is_default = True`).
   - Only one profile per user can be default, enforced by a database partial unique index (`WHERE is_default = true`).
   - Changing the default profile atomically unsets any prior default profile.
   - Deleting the current default profile automatically promotes another remaining profile to default if one exists.
   - Deleting the only profile leaves no default profile.
3. **Birth-Time Accuracy Precision Rules**:
   - `exact`: `time_of_birth` is strictly **required** (user knows their birth time).
   - `approximate`: `time_of_birth` is **optional** (retains approximate precision).
   - `unknown`: `time_of_birth` must be **null** (avoids synthetic 00:00 precision).
4. **Geographic Coordinates & Timezones**:
   - `latitude` must be between -90.0 and 90.0 degrees.
   - `longitude` must be between -180.0 and 180.0 degrees.
   - `timezone` must be a valid IANA identifier (e.g. `Asia/Kolkata`, `America/New_York`, `UTC`).
   - If coordinates or timezone are unavailable (e.g. historical/rural births), nullable fields are permitted.
5. **Ayanamsha Preference**:
   - Supports `lahiri` (default), `raman`, and `kp`.
   - Persisted for consumption by the astrological calculation engine in Batch 6D.

### Supported Enums
- **Birth Time Accuracy**:
  - `exact`
  - `approximate`
  - `unknown`
- **Ayanamsha**:
  - `lahiri` (Default Vedic / Chitra Paksha)
  - `raman` (B.V. Raman classical South Indian)
  - `kp` (Krishnamurti Paddhati stellar astrological)

### Birth Profile Endpoints

| Method | Path | Summary | Description |
|---|---|---|---|
| `POST` | `/api/v1/birth-profiles` | Create Profile | Create new birth profile. First profile is auto-default. |
| `GET` | `/api/v1/birth-profiles` | List Profiles | List all profiles owned by user (default profile first). |
| `GET` | `/api/v1/birth-profiles/default` | Get Default | Retrieve the user's primary default profile (404 if none). |
| `GET` | `/api/v1/birth-profiles/{id}` | Get By ID | Retrieve a specific owned profile (404 if not owned). |
| `PATCH` | `/api/v1/birth-profiles/{id}` | Update Profile | Update owned profile fields with rule re-validation. |
| `DELETE` | `/api/v1/birth-profiles/{id}` | Delete Profile | Delete owned profile; auto-elects new default if needed. |
| `PATCH` | `/api/v1/birth-profiles/{id}/default` | Set Default | Atomically designate profile as the user's default. |

### Request & Response Examples

#### 1. Create Birth Profile (`POST /api/v1/birth-profiles`)
**Request Body:**
```json
{
  "profile_name": "My Natal Kundli",
  "full_name": "Aarav Sharma",
  "date_of_birth": "1994-10-14",
  "time_of_birth": "06:45:00",
  "birth_time_accuracy": "exact",
  "birth_place": "Varanasi, Uttar Pradesh, India",
  "latitude": 25.3176,
  "longitude": 82.9739,
  "timezone": "Asia/Kolkata",
  "ayanamsha": "lahiri",
  "is_default": false
}
```

**Response (`201 Created`):**
```json
{
  "id": "c71a3e82-e3d1-4191-9257-2fc8c6340277",
  "user_id": "4b68434f-f06b-4899-b1ba-10e527f62e84",
  "profile_name": "My Natal Kundli",
  "full_name": "Aarav Sharma",
  "date_of_birth": "1994-10-14",
  "time_of_birth": "06:45:00",
  "birth_time_accuracy": "exact",
  "birth_place": "Varanasi, Uttar Pradesh, India",
  "latitude": 25.3176000,
  "longitude": 82.9739000,
  "timezone": "Asia/Kolkata",
  "ayanamsha": "lahiri",
  "is_default": true,
  "created_at": "2026-11-21T06:25:00.000000Z",
  "updated_at": "2026-11-21T06:25:00.000000Z"
}
```

#### 2. Set Default Profile (`PATCH /api/v1/birth-profiles/{id}/default`)
**Response (`200 OK`):**
```json
{
  "id": "e29cbfd0-f135-430c-8067-27b0b9cf69da",
  "user_id": "4b68434f-f06b-4899-b1ba-10e527f62e84",
  "profile_name": "Spouse Kundli",
  "full_name": "Priya Sharma",
  "date_of_birth": "1996-03-22",
  "time_of_birth": "11:20:00",
  "birth_time_accuracy": "exact",
  "birth_place": "Ujjain, Madhya Pradesh, India",
  "latitude": 23.1765000,
  "longitude": 75.7885000,
  "timezone": "Asia/Kolkata",
  "ayanamsha": "lahiri",
  "is_default": true,
  "created_at": "2026-11-21T06:26:00.000000Z",
  "updated_at": "2026-11-21T06:27:00.000000Z"
}
```

#### 3. Delete Profile (`DELETE /api/v1/birth-profiles/{id}`)
**Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Birth profile deleted successfully."
}
```

---

## 12. Database Migrations

### Run Migrations to Head
```bash
alembic upgrade head
```

### Roll Back One Revision
```bash
alembic downgrade -1
```

### Static SQL Generation (Offline Testing)
```bash
alembic upgrade head --sql
alembic downgrade 0002_create_birth_profiles:0001_initial_auth --sql
```

---

## 13. Astrology Engine Foundation (Batch 6D-1)

The Astrology Engine provides high-precision astronomical calculations built on the **Swiss Ephemeris** C library (via the `pysweph` Python binding). It adheres strictly to classical **Vedic Jyotish** principles with geocentric sidereal calculations.

### Core Astronomical Standards
- **Astrology System**: Vedic Jyotish.
- **Zodiac Reference**: Sidereal (Nirayana).
- **Default Ayanamsha**: Lahiri (Chitrapaksha / `SE_SIDM_LAHIRI`).
- **Additional Supported Ayanamshas**: B.V. Raman (`SE_SIDM_RAMAN`), Krishnamurti Paddhati (`SE_SIDM_KRISHNAMURTI`).
- **Default House System**: Whole Sign (metadata in Batch 6D-1; calculation in 6D-2).
- **Coordinate System**: Geocentric ecliptic longitude and latitude.
- **Node Convention**: True Node (`SE_TRUE_NODE`, default) or Mean Node (`SE_MEAN_NODE`), configurable via `ASTROLOGY_NODE_TYPE`.
- **Rahu & Ketu**: Ketu is calculated as the exact 180° opposite point of Rahu (`(rahu_lon + 180.0) % 360.0`), preserving longitudinal speed and retrograde status.
- **Modern Planets**: Uranus, Neptune, and Pluto are strictly excluded from the classical Navagraha set.

### Supported Celestial Bodies (Navagraha)
1. **Sun** (*Surya*) — `sun`
2. **Moon** (*Chandra*) — `moon`
3. **Mars** (*Mangala*) — `mars`
4. **Mercury** (*Budha*) — `mercury`
5. **Jupiter** (*Guru / Brihaspati*) — `jupiter`
6. **Venus** (*Shukra*) — `venus`
7. **Saturn** (*Shani*) — `saturn`
8. **Rahu** (*North Lunar Node*) — `rahu`
9. **Ketu** (*South Lunar Node*) — `ketu`

### Architecture & Precision Modes
The engine operates in `app/astrology/` with clean separation of astronomical calculations, domain exceptions, schemas, and utility functions:
- **High-Precision Swiss Ephemeris Files (`.se1`)**: When `SWISS_EPHEMERIS_PATH` is configured with `.se1` files (`sepl_18.se1`, `semo_18.se1`), Swiss Ephemeris achieves 0.001 arcsecond precision.
- **Built-in Moshier Ephemeris**: When `.se1` files are not mounted, the C library automatically utilizes the Moshier analytical ephemeris (precision 0.1 arcsecond for planets, 1-3 arcseconds for Moon), eliminating deployment hurdles while remaining astronomically accurate.
- **Strict File Requirement**: If `ASTROLOGY_REQUIRE_EPHEMERIS_FILES=true` is set and `.se1` files are missing, the engine raises `EphemerisUnavailableError` with clear download instructions rather than silently falling back.

### Swiss Ephemeris Licensing
Swiss Ephemeris is dual-licensed by Astrodienst AG:
1. **GNU AGPLv3**: Open-source license requiring all network-distributed callers to open-source their application under AGPLv3.
2. **Commercial License**: Proprietary commercial license purchased directly from Astrodienst AG for closed-source commercial deployments.

### Date, Time & Timezone Conversion
- Local birth date and time are localized in the user's specific IANA timezone (e.g. `Asia/Kolkata`, `America/New_York`, `Europe/London`) and converted to UTC, accounting for daylight-saving transitions without using server-local time.
- Universal Time Julian Day is computed using the Gregorian calendar convention.
- **Unknown Birth Time**: Calculations that require exact planetary degrees reject unknown birth times with `422 UNKNOWN_BIRTH_TIME`.
- **Approximate Birth Time**: Calculations include an explicit metadata warning and preserve approximate accuracy metadata without falsifying precision.

### Diagnostic Engine Endpoint
- `GET /api/v1/astrology/engine/status` (Authenticated)
  Returns engine name, version, availability, active settings, and supported bodies without exposing local file paths or environment secrets.

---

## 14. Ascendant (Lagna), Planetary House Placement & 12 Bhavas (Batch 6D-2)

Batch 6D-2 builds on top of the Batch 6D-1 astronomical foundation, providing sidereal Ascendant (Lagna) computation, 12 Whole Sign Bhavas, planetary house assignments, and full 27-Nakshatra / 4-Pada mappings.

### Core Calculation Architecture
1. **Sidereal Ascendant (Lagna)**:
   - Computed via Swiss Ephemeris `swe.houses_ex(julian_day_ut, lat, lon, b'W', swe.FLG_SIDEREAL)` ensuring true obliquity, nutation, and ayanamsha corrections are applied rigorously.
   - Decomposed into 360° ecliptic longitude, zodiac sign (1 to 12), decimal degrees within sign `[0.0, 30.0)`, integer DMS components, and human-readable DMS strings.
2. **27 Nakshatras & 4 Padas**:
   - Each Nakshatra spans exactly $13^\circ 20'$ (800 arcminutes).
   - Each Pada spans exactly $3^\circ 20'$ (200 arcminutes), quartering each Nakshatra (Padas 1 to 4).
   - Cyclic 9-lord Vimshottari ruler sequence: *Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury*.
3. **12 Whole Sign Bhavas (Houses)**:
   - The entire zodiac sign containing the Ascendant degree is designated as **Bhava 1** (House 1 / Lagna).
   - The subsequent sign is House 2, continuing cyclically to House 12.
   - Classical Vedic sign lords are assigned directly: Aries/Scorpio (Mars), Taurus/Libra (Venus), Gemini/Virgo (Mercury), Cancer (Moon), Leo (Sun), Sagittarius/Pisces (Jupiter), Capricorn/Aquarius (Saturn). Modern outer planets are strictly excluded.
4. **Planetary House Placement (Whole Sign Rule)**:
   - A planet's house number is calculated as:
     $$\text{House} = ((\text{Planet Sign} - \text{Ascendant Sign}) \pmod{12}) + 1$$
   - All 9 classical Navagraha (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) are mapped to their respective Bhavas.
5. **Birth Profile Scoping & Validation**:
   - Endpoints require valid geographic coordinates (`latitude` and `longitude`). Missing or out-of-range coordinates return `400 INVALID_COORDINATES`.
   - Missing timezone returns `400 INVALID_TIMEZONE`.
   - Unknown birth time returns `422 UNKNOWN_BIRTH_TIME`.
   - Approximate birth time calculations proceed with explicit operational warnings in `metadata.warnings`.
   - Profile ownership is strictly enforced: requests for profiles owned by other users return `404 RESOURCE_NOT_FOUND`.

### Astrology API Endpoints

| Method | Endpoint | Summary | Response Model |
|---|---|---|---|
| `GET` | `/api/v1/astrology/engine/status` | Engine Diagnostics | `AstrologyEngineStatusResponse` |
| `GET` | `/api/v1/astrology/birth-profiles/{id}/lagna` | Ascendant (Lagna) | `AscendantResponse` |
| `GET` | `/api/v1/astrology/birth-profiles/{id}/houses` | 12 Whole Sign Bhavas | `HouseChartResponse` |
| `GET` | `/api/v1/astrology/birth-profiles/{id}/planetary-placements` | Planetary Placements | `PlanetaryPlacementsResponse` |
| `GET` | `/api/v1/astrology/birth-profiles/{id}/lagna-chart` | Unified D1 Chart | `LagnaChartResponse` |

All birth profile endpoints accept optional query parameter overrides:
- `?ayanamsha=lahiri|raman|kp`
- `?node_type=true|mean`

### Benchmark Reference Verification
- **Birth Event**: October 14, 1994, 06:45:00 IST (01:15:00 UTC) at Varanasi, India ($25.3176^\circ\text{ N}, 82.9739^\circ\text{ E}$).
- **Calculated Ascendant**: Sidereal Lahiri Ascendant at $186.804^\circ$ ($\text{Libra } 6^\circ 48' 14''$), Nakshatra 15 **Swati**, Pada 1, Lord **Rahu**.
- **House Mapping**:
  - House 1 (Libra, Lord Venus): Mercury, Jupiter, Rahu
  - House 4 (Capricorn, Lord Saturn): Moon
  - House 5 (Aquarius, Lord Saturn): Saturn
  - House 7 (Aries, Lord Mars): Ketu
  - House 10 (Cancer, Lord Moon): Mars
  - House 12 (Virgo, Lord Mercury): Sun


