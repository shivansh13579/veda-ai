import { useState, useMemo } from 'react';
import {
  Compass,
  Orbit,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  Info,
  Layers,
  Edit3,
  Globe,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import KundliChart from '../../components/KundliChart';
import { useAuth } from '../../context';
import { MOCK_PLANETARY_POSITIONS, BHAVAS_INFO } from '../../data/kundliMockData';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const MyKundliPage = () => {
  const { user } = useAuth();

  // Active Chart Tab ('D1' for Lagna Chart, 'D9' for Navamsha)
  const [activeChartTab, setActiveChartTab] = useState('D1');
  const [selectedBhava, setSelectedBhava] = useState(1);
  const [planetSearchQuery, setPlanetSearchQuery] = useState('');
  const [motionFilter, setMotionFilter] = useState('all'); // 'all' | 'direct' | 'retrograde'

  // Check if user has sufficient birth profile to synthesize a Kundli
  const hasBirthProfile = Boolean(user?.dateOfBirth && user?.birthLocation);

  // Filter planetary table
  const filteredPlanets = useMemo(() => {
    return MOCK_PLANETARY_POSITIONS.filter((p) => {
      const matchesSearch =
        p.planet.toLowerCase().includes(planetSearchQuery.toLowerCase()) ||
        p.rashi.toLowerCase().includes(planetSearchQuery.toLowerCase()) ||
        p.nakshatra.toLowerCase().includes(planetSearchQuery.toLowerCase()) ||
        p.sanskritName.toLowerCase().includes(planetSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (motionFilter === 'direct') return !p.isRetrograde;
      if (motionFilter === 'retrograde') return p.isRetrograde;
      return true;
    });
  }, [planetSearchQuery, motionFilter]);

  // Selected Bhava Information
  const activeBhavaData = useMemo(() => {
    return BHAVAS_INFO.find((b) => b.number === selectedBhava) || BHAVAS_INFO[0];
  }, [selectedBhava]);

  return (
    <ClientLayout pageTitle="My Kundli">
      <div className="space-y-8 animate-fadeIn">
        {/* ========================================================= */}
        {/* PROFILE INTEGRATION / MISSING PROFILE NOTICE              */}
        {/* ========================================================= */}
        {!hasBirthProfile ? (
          <section
            aria-label="Profile Required Warning"
            className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-[#0b0817]/95 to-amber-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center animate-fadeIn"
          >
            <div className="max-w-lg mx-auto space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <Compass className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-serif text-amber-300 uppercase tracking-wider">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Birth Parameters Required</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Configure Your Birth Profile
              </h1>

              <p className="font-serif text-sm text-mutedtext leading-relaxed">
                In accordance with classical Vedic sidereal principles, personal Kundli synthesis requires verified date of birth, minute-exact time, and geographical coordinates. Displaying an uncalibrated chart would produce inaccurate Ascendants and Bhava boundaries.
              </p>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                  className="inline-flex items-center gap-2 rounded-xl py-3 px-6 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Complete Birth Profile Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section
            aria-label="Birth Profile Integration Summary"
            className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#120d28]/95 via-[#0b0817]/95 to-[#160b24]/95 p-5 sm:p-7 backdrop-blur-xl shadow-2xl shadow-purple/15"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-2.5">
                  <Orbit className="h-3.5 w-3.5 text-gold" />
                  <span>Sidereal Natal Coordinates Linked</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {user?.name}&apos;s Vedic Kundli
                </h1>
                <p className="text-xs sm:text-sm font-serif text-mutedtext mt-1 max-w-2xl leading-relaxed">
                  Birth chart synthesized under the {user?.ayanamsa || 'Lahiri (Chitra Paksha)'} sidereal system.
                </p>
              </div>

              {/* Action Buttons: Planetary Analysis Deep Dive & Edit Profile */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_PLANETARY_ANALYSIS)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/40 bg-gold/15 hover:bg-gold/25 text-xs font-semibold text-lightgold transition-all shadow-sm shadow-gold/10"
                >
                  <Orbit className="h-3.5 w-3.5 text-gold" />
                  <span>Planetary &amp; Bhava Analysis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/30 bg-white/5 hover:bg-white/10 hover:border-gold/50 text-xs font-medium text-lightgold transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5 text-gold" />
                  <span>Edit Birth Details</span>
                </button>
              </div>
            </div>

            {/* Profile Ephemeris Parameters Strip */}
            <div className="mt-5 pt-4 border-t border-gold/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-white truncate block">{user?.dateOfBirth}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Birth Time</span>
                <span className="font-semibold text-white truncate block">{user?.birthTime}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Time Precision</span>
                <span className="font-mono text-emerald-400 text-[11px] truncate block">
                  {user?.isTimeUnknown ? 'Approximate' : 'Exact to Minute'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Location</span>
                <span className="font-medium text-white truncate block">{user?.city || 'Varanasi'}, {user?.country || 'India'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Coordinates</span>
                <span className="font-mono text-lightgold text-[11px] truncate block">{user?.coordinates || '25.3176° N, 82.9739° E'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-gold/10">
                <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-0.5">Ayanamsha</span>
                <span className="font-serif text-lightgold text-xs truncate block">{user?.ayanamsa || 'Lahiri'}</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* CHART TABS (D-1 Rashi vs. D-9 Navamsha)                  */}
        {/* ========================================================= */}
        <section aria-label="Chart Selection & North Indian SVG Display">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-gold" />
                <span>Divisional Chart Workspace</span>
              </h2>
              <p className="text-xs font-serif text-mutedtext mt-0.5">
                Switch between primary natal Lagna and harmonic harmonic divisional charts
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveChartTab('D1')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeChartTab === 'D1'
                    ? 'bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-bold shadow-md shadow-gold/20'
                    : 'text-mutedtext hover:text-white hover:bg-white/5'
                }`}
              >
                D-1 Rashi / Lagna
              </button>

              <button
                type="button"
                onClick={() => setActiveChartTab('D9')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'D9'
                    ? 'bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-bold shadow-md shadow-gold/20'
                    : 'text-mutedtext hover:text-white hover:bg-white/5'
                }`}
              >
                <span>D-9 Navamsha</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple/30 text-purple-200 border border-purple/40">
                  Preview
                </span>
              </button>
            </div>
          </div>

          {/* D-9 Illustrative Disclaimer Banner */}
          {activeChartTab === 'D9' && (
            <div className="p-4 rounded-2xl border border-purple/40 bg-purple/10 text-xs text-purple-200 leading-relaxed font-serif mb-6 animate-fadeIn flex items-start gap-3">
              <Info className="h-4 w-4 text-purple-300 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-sans block text-xs mb-0.5">
                  Illustrative Navamsha (D-9) Harmonic Layout:
                </strong>
                The D-9 Navamsha divides each 30° zodiac sign into nine 3° 20&apos; padas to reveal inner spiritual potential, marital compatibility, and planetary strength in the second half of life. Precise mathematical harmonic calculations will connect in the upcoming ephemeris engine release. Placements displayed here are for illustrative architectural reference only.
              </div>
            </div>
          )}

          {/* Grid Layout: Left Chart SVG, Right House Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* SVG Chart Container (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <KundliChart
                chartType={activeChartTab}
                activeBhava={selectedBhava}
                onSelectBhava={setSelectedBhava}
              />

              {/* Chart Controls & Helper Note */}
              <div className="mt-4 text-center">
                <p className="text-[11px] font-serif text-mutedtext">
                  Tip: Tap any diamond or triangle to inspect the corresponding Bhava.
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-gold/15 text-lightgold">
                    North Indian Diamond Layout
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-gold/15 text-lightgold">
                    Anti-Clockwise Zodiac Sequence
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Bhava Details Card (7 cols on lg) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-gold/25 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-purple/10 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gold/15">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-lg">
                      {activeBhavaData.number}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">
                        {activeBhavaData.sanskritName}
                      </h3>
                      <span className="text-xs font-serif text-lightgold">
                        House {activeBhavaData.number} &bull; {activeBhavaData.classification}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-gold/10 text-lightgold border border-gold/20">
                    Sign: {activeBhavaData.signPlaced}
                  </span>
                </div>

                {/* Primary Theme & Description */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1">
                    Primary Life Sphere
                  </span>
                  <div className="text-sm font-semibold text-white mb-1.5">
                    {activeBhavaData.primaryTheme}
                  </div>
                  <p className="text-xs sm:text-sm font-serif text-mutedtext leading-relaxed">
                    {activeBhavaData.description}
                  </p>
                </div>

                {/* Planetary Occupants & Significators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono uppercase text-mutedtext/70 block mb-1">
                      Resident Grahas in Chart
                    </span>
                    {activeBhavaData.planetsHere.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeBhavaData.planetsHere.map((p) => (
                          <span
                            key={p}
                            className="text-xs font-semibold px-2 py-0.5 rounded bg-gold/15 text-lightgold border border-gold/30"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-mutedtext font-serif italic">
                        No major planetary bodies occupying this house
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-gold/10">
                    <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-1">
                      Karaka (Natural Significator)
                    </span>
                    <span className="text-xs font-semibold text-white block">
                      {activeBhavaData.karaka}
                    </span>
                  </div>
                </div>

                {/* Quick 12 House Selector Buttons */}
                <div className="pt-3 border-t border-gold/10">
                  <span className="text-[10px] font-mono text-mutedtext/70 uppercase block mb-2">
                    Quick Select House (Bhava)
                  </span>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {BHAVAS_INFO.map((b) => (
                      <button
                        key={b.number}
                        type="button"
                        onClick={() => setSelectedBhava(b.number)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          selectedBhava === b.number
                            ? 'bg-gold text-vedabg font-bold shadow-md shadow-gold/20'
                            : 'bg-white/5 border border-gold/15 text-mutedtext hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {b.number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PLANETARY PLACEMENTS PREVIEW TABLE                        */}
        {/* ========================================================= */}
        <section aria-label="Planetary Positions Table">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-purple/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gold/15 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Orbit className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Planetary Placements Preview
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  Calibrated sample ephemeris dataset &bull; 9 Grahas & Ascendant
                </p>
              </div>

              {/* Informative Disclaimer Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/25 bg-gold/10 text-[11px] font-serif text-lightgold">
                <AlertTriangle className="h-3.5 w-3.5 text-gold" />
                <span>Illustrative Sample Dataset &bull; Non-Predictive</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mutedtext pointer-events-none" />
                <input
                  type="text"
                  value={planetSearchQuery}
                  onChange={(e) => setPlanetSearchQuery(e.target.value)}
                  placeholder="Filter by Graha, Sign, or Nakshatra..."
                  className="w-full rounded-xl bg-white/5 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-mutedtext/40 border border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all focus:outline-none"
                />
              </div>

              {/* Motion Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-gold/20 bg-white/5 self-start sm:self-auto">
                {[
                  { id: 'all', label: 'All Grahas' },
                  { id: 'direct', label: 'Direct' },
                  { id: 'retrograde', label: 'Retrograde (Vakra)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMotionFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      motionFilter === f.id
                        ? 'bg-gold/25 text-lightgold border border-gold/40 font-semibold'
                        : 'text-mutedtext hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-gold/15">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gold/15 bg-white/5 text-[11px] font-mono uppercase text-mutedtext/80">
                    <th className="py-3 px-4">Planet (Graha)</th>
                    <th className="py-3 px-4">Sign (Rashi)</th>
                    <th className="py-3 px-4">Degree</th>
                    <th className="py-3 px-4">House (Bhava)</th>
                    <th className="py-3 px-4">Nakshatra &amp; Pada</th>
                    <th className="py-3 px-4">Motion &amp; Dignity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10 font-serif">
                  {filteredPlanets.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedBhava(p.house)}
                      className="hover:bg-gold/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-sans font-medium text-white group-hover:text-lightgold transition-colors flex items-center gap-2">
                        <span className="text-base text-gold w-5 text-center">{p.glyph}</span>
                        <div>
                          <span>{p.planet}</span>
                          <span className="text-[10px] text-mutedtext/70 block font-serif">{p.sanskritName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-white font-medium">
                        {p.rashi}
                      </td>

                      <td className="py-3 px-4 font-mono text-lightgold text-xs">
                        {p.degree}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gold/10 text-lightgold font-mono text-[11px] border border-gold/20">
                          {p.houseName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-mutedtext">
                        <span className="text-white font-medium">{p.nakshatra}</span>{' '}
                        <span className="text-[10px] font-mono text-lightgold/80">(Pada {p.pada})</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.isRetrograde ? (
                            <span className="px-2 py-0.5 rounded bg-purple/20 text-purple-200 border border-purple/40 text-[10px] font-mono">
                              Retrograde (Vakra)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                              Direct
                            </span>
                          )}
                          <span className="text-[10px] text-mutedtext font-mono">
                            {p.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-mutedtext font-serif">
              <span>Showing {filteredPlanets.length} of {MOCK_PLANETARY_POSITIONS.length} placements</span>
              <span>Click any planet row to inspect its resident Bhava</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TWELVE BHAVA OVERVIEW MATRIX                              */}
        {/* ========================================================= */}
        <section aria-label="Twelve Bhavas Matrix">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-purple/10">
            <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-6">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-gold" />
                  <span>Twelve Bhava (House) Matrix</span>
                </h2>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  Comprehensive breakdown of the twelve fields of human experience
                </p>
              </div>

              <span className="text-xs font-mono text-lightgold/80 bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                12 Houses
              </span>
            </div>

            {/* 12 House Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BHAVAS_INFO.map((bhava) => {
                const isSelected = selectedBhava === bhava.number;
                return (
                  <div
                    key={bhava.number}
                    onClick={() => setSelectedBhava(bhava.number)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/15 shadow-md shadow-gold/10 -translate-y-0.5'
                        : 'border-gold/15 bg-white/5 hover:border-gold/35 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-gold/20 text-gold font-display font-bold text-xs flex items-center justify-center">
                          {bhava.number}
                        </span>
                        <span className="font-display text-sm font-semibold text-white">
                          {bhava.sanskritName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-lightgold/90 px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20">
                        {bhava.signPlaced.split(' ')[0]}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-lightgold mb-1">
                      {bhava.primaryTheme}
                    </div>

                    <p className="text-xs font-serif text-mutedtext leading-relaxed line-clamp-2">
                      {bhava.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-gold/10 flex items-center justify-between text-[10px] font-mono text-mutedtext/80">
                      <span>Karaka: {bhava.karaka}</span>
                      {bhava.planetsHere.length > 0 && (
                        <span className="text-lightgold">
                          {bhava.planetsHere.length} Planet(s)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CALCULATION & EPHEMERIS METADATA BAR                      */}
        {/* ========================================================= */}
        <section aria-label="Calculation Metadata and Disclaimers">
          <div className="rounded-2xl border border-gold/15 bg-white/5 p-5 text-xs text-mutedtext space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold/10">
              <div className="flex items-center gap-2 text-white font-medium">
                <Globe className="h-4 w-4 text-gold" />
                <span>Ephemeris Calculation Parameters &amp; Verification Protocol</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Lahiri Sidereal Calibrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-serif">
              <div>
                <strong className="text-lightgold font-sans block text-[11px]">Ayanamsha:</strong>
                <span>{user?.ayanamsa || 'Lahiri (Chitra Paksha)'} &bull; 24° 08&apos; 12&quot;</span>
              </div>
              <div>
                <strong className="text-lightgold font-sans block text-[11px]">Time Basis:</strong>
                <span>Local Sidereal Time (LST) &bull; Apparent Solar Transit</span>
              </div>
              <div>
                <strong className="text-lightgold font-sans block text-[11px]">Geodetic Reference:</strong>
                <span>{user?.coordinates || '25.3176° N, 82.9739° E'}</span>
              </div>
              <div>
                <strong className="text-lightgold font-sans block text-[11px]">Calculation Engine:</strong>
                <span>Standard Vedic Astronomical Ephemeris</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] leading-relaxed border-t border-gold/10 font-serif">
              <span className="text-white font-sans font-medium">Spiritual Consultation Note: </span>
              Vedic Kundli charts serve as reflective spiritual maps illustrating classical archetypes and karmic tendencies. In accordance with authentic Jyotish traditions, charts are tools for ethical reflection and meditative alignment, not fatalistic or definitive life predictions.
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
};

export default MyKundliPage;
