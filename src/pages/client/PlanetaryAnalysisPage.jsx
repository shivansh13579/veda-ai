import { useState, useMemo } from 'react';
import {
  Compass,
  Orbit,
  ArrowLeft,
  Search,
  Sparkles,
  Sun,
  Activity,
  X,
  BookOpen,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context';
import {
  MOCK_PLANETARY_POSITIONS,
  BHAVAS_INFO,
  GRAHA_DIGNITY_MATRIX,
  ASCENDANT_DATA,
} from '../../data/kundliMockData';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const PlanetaryAnalysisPage = () => {
  const { user } = useAuth();

  // Search & Filter States for Planetary Placements
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignFilter, setSelectedSignFilter] = useState('all');
  const [motionFilter, setMotionFilter] = useState('all'); // 'all' | 'direct' | 'retrograde'

  // Selected Planet for Modal Inspector
  const [inspectedPlanet, setInspectedPlanet] = useState(null);

  // Selected Bhava for House Inspector
  const [selectedBhavaNumber, setSelectedBhavaNumber] = useState(1);

  // Active Tab for Main Sections
  const [activeAnalysisSection, setActiveAnalysisSection] = useState('planets'); // 'planets' | 'ascendant' | 'bhavas' | 'dignities'

  // Filter planets based on search, sign, and motion
  const filteredPlanets = useMemo(() => {
    return MOCK_PLANETARY_POSITIONS.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.planet.toLowerCase().includes(q) ||
        p.sanskritName.toLowerCase().includes(q) ||
        p.rashi.toLowerCase().includes(q) ||
        p.nakshatra.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedSignFilter !== 'all' && !p.rashi.toLowerCase().includes(selectedSignFilter.toLowerCase())) {
        return false;
      }

      if (motionFilter === 'direct' && p.isRetrograde) return false;
      if (motionFilter === 'retrograde' && !p.isRetrograde) return false;

      return true;
    });
  }, [searchQuery, selectedSignFilter, motionFilter]);

  // Selected Bhava Data
  const selectedBhavaData = useMemo(() => {
    return BHAVAS_INFO.find((b) => b.number === selectedBhavaNumber) || BHAVAS_INFO[0];
  }, [selectedBhavaNumber]);

  return (
    <ClientLayout pageTitle="Planetary & Bhava Analysis">
      <div className="space-y-8 animate-fadeIn">
        {/* ========================================================= */}
        {/* TOP HEADER & KUNDLI NAVIGATION STRIP                     */}
        {/* ========================================================= */}
        <section aria-label="Page Header and Kundli Navigation">
          <div className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#120d28]/95 via-[#0b0817]/95 to-[#160b24]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple/15">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                {/* Back to My Kundli Action */}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_KUNDLI)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gold/25 bg-white/5 hover:bg-white/10 hover:border-gold/45 text-xs text-lightgold transition-all mb-3.5 group focus:outline-none"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  <span>Return to Kundli Chart</span>
                </button>

                <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-wide">
                  Planetary Positions &amp; Bhava Analysis
                </h1>
                <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext leading-relaxed max-w-2xl">
                  Explore the 9 Grahas, Ascendant (Lagna) dynamics, and the Twelve Bhavas synthesized under the {user?.ayanamsa || 'Lahiri (Chitra Paksha)'} sidereal system.
                </p>
              </div>

              {/* Profile Context Chip */}
              <div className="w-full lg:w-auto min-w-[260px] rounded-2xl border border-gold/20 bg-white/5 p-4 backdrop-blur-sm">
                <span className="text-[10px] font-mono uppercase text-mutedtext/70 block mb-1">
                  Active Natal Parameters
                </span>
                <div className="text-sm font-semibold text-white">{user?.name || 'Aarav Sharma'}</div>
                <div className="text-xs text-lightgold/90 font-serif mt-0.5">
                  {user?.birthLocation || 'Varanasi, Uttar Pradesh, India'}
                </div>
                <div className="mt-2 pt-2 border-t border-gold/10 flex items-center justify-between text-[11px] font-mono text-mutedtext">
                  <span>DOB: {user?.dateOfBirth || '14 Oct 1994'}</span>
                  <span className="text-emerald-400">{user?.isTimeUnknown ? 'Approx.' : 'Exact Time'}</span>
                </div>
              </div>
            </div>

            {/* Quick Section Navigation Tabs */}
            <div className="mt-6 pt-5 border-t border-gold/15 flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'planets', label: '9 Planetary Positions', icon: Orbit },
                { id: 'ascendant', label: 'Ascendant (Lagna)', icon: Sun },
                { id: 'bhavas', label: '12 Bhava (House) Inspector', icon: Compass },
                { id: 'dignities', label: 'Planetary Dignities & Matrix', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeAnalysisSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAnalysisSection(tab.id)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-bold shadow-md shadow-gold/20'
                        : 'border border-gold/15 bg-white/5 text-mutedtext hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: ASCENDANT (LAGNA) IN-DEPTH ANALYSIS            */}
        {/* ========================================================= */}
        {(activeAnalysisSection === 'ascendant' || activeAnalysisSection === 'planets') && (
          <section aria-label="Ascendant Analysis">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15">
                <div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                      Ascendant (Lagna) Analysis &bull; {ASCENDANT_DATA.sign}
                    </h2>
                  </div>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    The rising sign anchored on the eastern horizon at birth
                  </p>
                </div>

                <span className="text-xs font-mono text-lightgold px-3 py-1 rounded-full bg-gold/10 border border-gold/25">
                  Degree: {ASCENDANT_DATA.degree}
                </span>
              </div>

              {/* Ascendant Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Lagna Sign</span>
                  <span className="font-semibold text-white text-sm block">{ASCENDANT_DATA.sign}</span>
                  <span className="text-[10px] text-lightgold font-serif block">{ASCENDANT_DATA.symbol}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Ruling Lord</span>
                  <span className="font-semibold text-white text-sm block">{ASCENDANT_DATA.lord}</span>
                  <span className="text-[10px] text-emerald-400 font-serif block">{ASCENDANT_DATA.lordHouse}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Nakshatra</span>
                  <span className="font-semibold text-white text-sm block">{ASCENDANT_DATA.nakshatra}</span>
                  <span className="text-[10px] text-mutedtext font-serif block">Pada {ASCENDANT_DATA.pada} (Rahu Ruled)</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Element &amp; Quality</span>
                  <span className="font-semibold text-white text-sm block">{ASCENDANT_DATA.element}</span>
                  <span className="text-[10px] text-mutedtext font-serif block">{ASCENDANT_DATA.modality}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Governing Anatomy</span>
                  <span className="font-medium text-white text-xs block truncate">{ASCENDANT_DATA.bodyPart}</span>
                  <span className="text-[10px] text-mutedtext font-serif block">Equilibrium</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Archetype</span>
                  <span className="font-serif text-lightgold text-xs block leading-tight">The Arbiter of Harmony</span>
                </div>
              </div>

              {/* Behavioral Overview & Vedic Significance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="p-4 rounded-2xl border border-gold/15 bg-white/5">
                  <h3 className="text-xs font-semibold text-lightgold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    Core Temperament &amp; Behavioral Expression
                  </h3>
                  <p className="text-xs sm:text-sm font-serif text-mutedtext leading-relaxed">
                    {ASCENDANT_DATA.overview}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-gold/15 bg-white/5">
                  <h3 className="text-xs font-semibold text-lightgold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                    <BookOpen className="h-3.5 w-3.5 text-gold" />
                    Why the Ascendant Anchors the Entire Horoscope
                  </h3>
                  <p className="text-xs sm:text-sm font-serif text-mutedtext leading-relaxed">
                    {ASCENDANT_DATA.significance}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: 9 PLANETARY POSITIONS (GRAHA ANALYSIS)         */}
        {/* ========================================================= */}
        {(activeAnalysisSection === 'planets' || activeAnalysisSection === 'dignities') && (
          <section aria-label="Nine Planetary Positions and Inspector">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gold/15">
                <div>
                  <div className="flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                      The Nine Planetary Bodies (Nava Grahas)
                    </h2>
                  </div>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Click any Graha card to inspect its significations, dignity, and classical Vedic interpretations
                  </p>
                </div>

                {/* Illustrative dataset tag */}
                <span className="text-[11px] font-serif text-lightgold px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                  Illustrative Ephemeris Placements
                </span>
              </div>

              {/* Filter Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search Box */}
                <div className="sm:col-span-5 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mutedtext pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search planet (e.g. Jupiter, Guru, Mars)..."
                    className="w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-mutedtext/40 border border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all focus:outline-none"
                  />
                </div>

                {/* Sign Filter Dropdown */}
                <div className="sm:col-span-4">
                  <select
                    value={selectedSignFilter}
                    onChange={(e) => setSelectedSignFilter(e.target.value)}
                    className="w-full rounded-xl bg-[#0b0817] px-3.5 py-2.5 text-xs text-white border border-gold/25 focus:border-gold transition-all focus:outline-none"
                  >
                    <option value="all">All Zodiac Signs (Rashis)</option>
                    <option value="Aries">Aries (Mesha)</option>
                    <option value="Taurus">Taurus (Vrishabha)</option>
                    <option value="Cancer">Cancer (Karka)</option>
                    <option value="Leo">Leo (Simha)</option>
                    <option value="Virgo">Virgo (Kanya)</option>
                    <option value="Libra">Libra (Tula)</option>
                    <option value="Scorpio">Scorpio (Vrishchika)</option>
                    <option value="Capricorn">Capricorn (Makara)</option>
                    <option value="Aquarius">Aquarius (Kumbha)</option>
                    <option value="Pisces">Pisces (Meena)</option>
                  </select>
                </div>

                {/* Motion Filter Pills */}
                <div className="sm:col-span-3 flex items-center gap-1 p-1 rounded-xl border border-gold/20 bg-white/5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'direct', label: 'Direct' },
                    { id: 'retrograde', label: 'Vakra (R)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMotionFilter(m.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                        motionFilter === m.id
                          ? 'bg-gold/25 text-lightgold border border-gold/40 font-semibold'
                          : 'text-mutedtext hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Planetary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlanets.map((planet) => (
                  <div
                    key={planet.id}
                    onClick={() => setInspectedPlanet(planet)}
                    className="group rounded-2xl border border-gold/20 bg-white/5 hover:bg-gold/5 hover:border-gold/45 p-5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-purple/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="h-9 w-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg text-gold font-bold">
                            {planet.glyph}
                          </span>
                          <div>
                            <h3 className="font-display text-sm font-semibold text-white group-hover:text-lightgold transition-colors">
                              {planet.planet}
                            </h3>
                            <span className="text-[11px] font-serif text-mutedtext block">
                              {planet.sanskritName}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            planet.isRetrograde
                              ? 'bg-purple/20 text-purple-200 border-purple/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {planet.motion}
                        </span>
                      </div>

                      {/* Sign and Degree */}
                      <div className="space-y-1 text-xs pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-mutedtext/70">Sign:</span>
                          <span className="font-medium text-white">{planet.rashi}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mutedtext/70">Degree:</span>
                          <span className="font-mono text-lightgold">{planet.degree}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mutedtext/70">Placement:</span>
                          <span className="font-mono text-white text-[11px]">{planet.houseName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mutedtext/70">Nakshatra:</span>
                          <span className="text-mutedtext">
                            {planet.nakshatra} (Pada {planet.pada})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Dignity Tag & Inspect Trigger */}
                    <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-lightgold/80 px-2 py-0.5 rounded bg-gold/10 border border-gold/20 truncate max-w-[170px]">
                        {planet.status}
                      </span>
                      <span className="text-xs text-lightgold group-hover:text-white underline underline-offset-2 font-serif transition-colors">
                        Inspect &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: TWELVE BHAVA (HOUSE) INSPECTOR                 */}
        {/* ========================================================= */}
        {(activeAnalysisSection === 'bhavas' || activeAnalysisSection === 'planets') && (
          <section aria-label="Twelve Bhava Analysis">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                      Twelve Bhava Analysis &amp; Cusp Inspector
                    </h2>
                  </div>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Select a house to inspect its significations, governing anatomy, and resident planetary energy
                  </p>
                </div>

                <div className="text-xs font-mono text-lightgold bg-gold/10 px-3 py-1 rounded-full border border-gold/25">
                  Active: House {selectedBhavaNumber} ({selectedBhavaData.sanskritName})
                </div>
              </div>

              {/* 12 House Selector Tabs */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                {BHAVAS_INFO.map((b) => (
                  <button
                    key={b.number}
                    type="button"
                    onClick={() => setSelectedBhavaNumber(b.number)}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      selectedBhavaNumber === b.number
                        ? 'bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-bold shadow-md shadow-gold/20 scale-105'
                        : 'border border-gold/15 bg-white/5 text-mutedtext hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="block font-display text-sm leading-tight">{b.number}</span>
                    <span className="block text-[9px] font-serif truncate mt-0.5">{b.sanskritName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Detailed Inspector Panel for Selected Bhava */}
              <div className="rounded-2xl border border-gold/25 bg-white/5 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center font-display font-bold text-lg text-gold">
                      {selectedBhavaData.number}
                    </span>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-white">
                        {selectedBhavaData.sanskritName} (House {selectedBhavaData.number})
                      </h3>
                      <span className="text-xs font-serif text-lightgold">
                        Classification: {selectedBhavaData.classification} &bull; Sign: {selectedBhavaData.signPlaced}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-3 py-1 rounded-md bg-gold/15 text-lightgold border border-gold/30">
                    Karaka: {selectedBhavaData.karaka}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0b0817]/80 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-1">
                      Primary Life Domain
                    </span>
                    <span className="font-semibold text-white text-sm block mb-1">
                      {selectedBhavaData.primaryTheme}
                    </span>
                    <p className="font-serif text-mutedtext text-xs leading-relaxed">
                      {selectedBhavaData.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b0817]/80 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-1">
                      Physiological &amp; Health Correlation
                    </span>
                    <span className="font-semibold text-white text-sm block mb-1">
                      {selectedBhavaData.bodyPart}
                    </span>
                    <p className="font-serif text-mutedtext text-xs leading-relaxed">
                      In medical astrology, this house maps physical vulnerabilities and energetic centers in the human bodily constitution.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b0817]/80 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-1">
                      Planetary Occupants in Chart
                    </span>
                    {selectedBhavaData.planetsHere.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedBhavaData.planetsHere.map((p) => (
                          <span
                            key={p}
                            className="text-xs font-semibold px-2 py-1 rounded bg-gold/20 text-lightgold border border-gold/30"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-mutedtext font-serif italic block mt-1">
                        Unoccupied. Governed solely by house lord {selectedBhavaData.rulingPlanet}.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: PLANETARY DIGNITY & RELATIONSHIPS MATRIX       */}
        {/* ========================================================= */}
        {(activeAnalysisSection === 'dignities' || activeAnalysisSection === 'planets') && (
          <section aria-label="Planetary Dignity and Relationship Matrix">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                      Planetary Dignity &amp; Natural Relationships Matrix
                    </h2>
                  </div>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Classical strengths: Exaltation (Ucha), Debilitation (Neecha), Moolatrikona, and Natural Alliances
                  </p>
                </div>

                <span className="text-xs font-mono text-lightgold px-3 py-1 rounded-full bg-gold/10 border border-gold/25">
                  Parashara Principles
                </span>
              </div>

              {/* Dignity Key Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-amber-400/30">
                  <span className="text-amber-300 font-bold block mb-0.5">Exaltation (Ucha)</span>
                  <span className="text-[11px] font-serif text-mutedtext">Highest radiant manifestation of planetary energy</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-gold/30">
                  <span className="text-lightgold font-bold block mb-0.5">Moolatrikona</span>
                  <span className="text-[11px] font-serif text-mutedtext">Primary operational strength and legislative power</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-emerald-400/30">
                  <span className="text-emerald-300 font-bold block mb-0.5">Own Sign (Swa Rashi)</span>
                  <span className="text-[11px] font-serif text-mutedtext">Comfortable self-reliance in sovereign zodiac sign</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-blue-400/30">
                  <span className="text-blue-300 font-bold block mb-0.5">Friendly (Mitra)</span>
                  <span className="text-[11px] font-serif text-mutedtext">Harmonious host support fostering mutual growth</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-red-400/30">
                  <span className="text-red-300 font-bold block mb-0.5">Debilitation (Neecha)</span>
                  <span className="text-[11px] font-serif text-mutedtext">Challenged expression requiring conscious remediation</span>
                </div>
              </div>

              {/* Dignity Reference Table */}
              <div className="overflow-x-auto rounded-2xl border border-gold/15">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gold/15 bg-white/5 text-[11px] font-mono uppercase text-mutedtext/80">
                      <th className="py-3 px-4">Planet</th>
                      <th className="py-3 px-4">Own Signs</th>
                      <th className="py-3 px-4">Exaltation (Ucha)</th>
                      <th className="py-3 px-4">Debilitation (Neecha)</th>
                      <th className="py-3 px-4">Moolatrikona</th>
                      <th className="py-3 px-4">Natural Friends</th>
                      <th className="py-3 px-4">Natural Enemies</th>
                      <th className="py-3 px-4">Sample Dignity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10 font-serif">
                    {GRAHA_DIGNITY_MATRIX.map((row) => (
                      <tr key={row.planet} className="hover:bg-gold/5 transition-colors">
                        <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-gold font-bold">{row.symbol}</span>
                          <span>{row.planet}</span>
                        </td>
                        <td className="py-3 px-4 text-white whitespace-nowrap">{row.ownSigns}</td>
                        <td className="py-3 px-4 text-amber-300 font-medium whitespace-nowrap">{row.exaltation}</td>
                        <td className="py-3 px-4 text-red-300 font-medium whitespace-nowrap">{row.debilitation}</td>
                        <td className="py-3 px-4 text-lightgold whitespace-nowrap">{row.moolatrikona}</td>
                        <td className="py-3 px-4 text-emerald-300 whitespace-nowrap">{row.friends}</td>
                        <td className="py-3 px-4 text-red-400 whitespace-nowrap">{row.enemies}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-gold/15 text-lightgold font-mono text-[10px] border border-gold/25">
                            {row.currentDignity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* PLANETARY DETAIL INSPECTOR MODAL                          */}
        {/* ========================================================= */}
        {inspectedPlanet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-xl rounded-3xl border border-gold/40 bg-[#0b0817] p-6 sm:p-8 shadow-2xl shadow-purple/30 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setInspectedPlanet(null)}
                aria-label="Close inspector"
                className="absolute top-5 right-5 p-2 rounded-xl text-mutedtext hover:text-white hover:bg-white/5 border border-gold/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gold/15 mb-5">
                <span className="h-12 w-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-2xl text-gold font-bold">
                  {inspectedPlanet.glyph}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {inspectedPlanet.planet}
                  </h3>
                  <span className="text-xs font-serif text-lightgold">
                    {inspectedPlanet.sanskritName} &bull; {inspectedPlanet.rashi} at {inspectedPlanet.degree}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 text-xs">
                {/* Placement Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">House</span>
                    <span className="font-medium text-white">{inspectedPlanet.houseName}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Nakshatra</span>
                    <span className="font-medium text-white">{inspectedPlanet.nakshatra} (Pada {inspectedPlanet.pada})</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Motion</span>
                    <span className="font-medium text-lightgold">{inspectedPlanet.motion}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Ruler</span>
                    <span className="font-medium text-white">{inspectedPlanet.ruler}</span>
                  </div>
                </div>

                {/* Natural Karakatvas */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-gold/15">
                  <span className="text-[10px] font-mono text-lightgold uppercase tracking-wider block mb-1">
                    Natural Significations (Karakatvas)
                  </span>
                  <p className="font-serif text-sm text-white leading-relaxed">
                    {inspectedPlanet.karakatva}
                  </p>
                </div>

                {/* Classical Interpretation */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-gold/15">
                  <span className="text-[10px] font-mono text-lightgold uppercase tracking-wider block mb-1">
                    Classical Vedic Interpretation
                  </span>
                  <p className="font-serif text-sm text-mutedtext leading-relaxed">
                    {inspectedPlanet.classicalInterpretation}
                  </p>
                </div>

                {/* Classical Remedy */}
                <div className="p-3.5 rounded-xl bg-gold/10 border border-gold/25">
                  <span className="text-[10px] font-mono text-gold uppercase tracking-wider block mb-1">
                    Recommended Classical Practice
                  </span>
                  <p className="font-serif text-sm text-lightgold leading-relaxed">
                    {inspectedPlanet.remedy}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-gold/15 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedPlanet(null)}
                  className="px-5 py-2 rounded-xl border border-gold/30 bg-gold/10 text-xs font-semibold text-lightgold hover:bg-gold/20 transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default PlanetaryAnalysisPage;
