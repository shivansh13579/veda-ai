import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  Search,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Coins,
  Heart,
  Activity,
  GraduationCap,
  AlertCircle,
  AlertTriangle,
  Orbit,
  X,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context';
import {
  VIMSHOTTARI_DASHA_DATA,
  GOCHARA_TRANSITS_DATA,
  PREDICTIONS_DATA,
  UPCOMING_EVENTS_TIMELINE,
} from '../../data/predictionsMockData';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const SAVED_PREDICTIONS_STORAGE_KEY = 'veda_saved_predictions';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Predictions', icon: Sparkles },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'finance', label: 'Finance', icon: Coins },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'health', label: 'Health', icon: Activity },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'saved', label: 'Saved Bookmarks', icon: BookmarkCheck },
];

const PredictionsPage = () => {
  const { user } = useAuth();

  // Navigation / Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTransitPlanetFilter, setActiveTransitPlanetFilter] = useState('all');

  // Interactive View States
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isDashaDetailsExpanded, setIsDashaDetailsExpanded] = useState(false);

  // Saved Bookmarks state (synced with sessionStorage)
  const [savedPredictionIds, setSavedPredictionIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SAVED_PREDICTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    // Default initial bookmarked items from mock data
    return PREDICTIONS_DATA.filter((p) => p.saved).map((p) => p.id);
  });

  // Sync saved bookmarks to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SAVED_PREDICTIONS_STORAGE_KEY, JSON.stringify(savedPredictionIds));
    } catch {
      // ignore
    }
  }, [savedPredictionIds]);

  const toggleSavePrediction = (id, e) => {
    if (e) e.stopPropagation();
    setSavedPredictionIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  // Check if profile is configured
  const hasBirthProfile = Boolean(user?.dateOfBirth && user?.birthLocation);

  // Filtered Predictions list
  const filteredPredictions = useMemo(() => {
    return PREDICTIONS_DATA.filter((p) => {
      // Category filter
      if (activeCategory === 'saved') {
        if (!savedPredictionIds.includes(p.id)) return false;
      } else if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesPlanet = p.relevantPlanets.some((planet) => planet.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesPlanet) return false;
      }

      return true;
    });
  }, [activeCategory, searchQuery, savedPredictionIds]);

  // Filtered Gochara Transits
  const filteredTransits = useMemo(() => {
    if (activeTransitPlanetFilter === 'all') return GOCHARA_TRANSITS_DATA;
    return GOCHARA_TRANSITS_DATA.filter((t) => t.id === activeTransitPlanetFilter);
  }, [activeTransitPlanetFilter]);

  return (
    <ClientLayout pageTitle="Personalized Predictions">
      <div className="space-y-8 animate-fadeIn">
        {/* ========================================================= */}
        {/* HEADER & BIRTH PROFILE CONTEXT STRIP                      */}
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
                Configure Your Birth Profile for Predictions
              </h1>

              <p className="font-serif text-sm text-mutedtext leading-relaxed">
                Vimshottari Dasha calculations and Gochara transit aspects require a verified birth date and geographic coordinates. Displaying uncalibrated forecasts would produce inaccurate planetary timelines.
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
            aria-label="Personalized Welcome & Natal Context"
            className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#120d28]/95 via-[#0b0817]/95 to-[#160b24]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple/15 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-3">
                  <Orbit className="h-3.5 w-3.5 text-gold" />
                  <span>Vimshottari Dasha &bull; Transit Timeline Synchronized</span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-wide">
                  Personalized Predictions &amp; Transits
                </h1>

                <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
                  Welcome, {user?.name || 'Aarav Sharma'}. Your astrological forecasts across career, wealth, and life domains are synthesized against your active{' '}
                  <strong className="text-lightgold">Jupiter-Saturn Dasha</strong> and real-time sidereal transits.
                </p>
              </div>

              {/* Natal Parameters Context Card */}
              <div className="w-full lg:w-auto min-w-[270px] rounded-2xl border border-gold/20 bg-white/5 p-4 backdrop-blur-sm text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-mutedtext/70 font-mono uppercase text-[10px]">Active Mahadasha:</span>
                  <span className="font-semibold text-lightgold">Jupiter (Guru)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedtext/70 font-mono uppercase text-[10px]">Active Antardasha:</span>
                  <span className="font-semibold text-white">Saturn (Shani)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedtext/70 font-mono uppercase text-[10px]">Current Gochara Node:</span>
                  <span className="font-mono text-emerald-400">Pisces &bull; 6th House</span>
                </div>
                <div className="pt-2 border-t border-gold/10 flex items-center justify-between text-[11px] font-serif text-mutedtext">
                  <span>DOB: {user?.dateOfBirth || '14 Oct 1994'}</span>
                  <span className="text-lightgold">{user?.birthLocation?.split(',')[0] || 'Varanasi'}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: VIMSHOTTARI DASHA TIMELINE                     */}
        {/* ========================================================= */}
        <section aria-label="Vimshottari Dasha Timeline">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Vimshottari Dasha Progression
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  The classical 120-year planetary life-cycle governing your karmic unfolding
                </p>
              </div>

              <span className="text-xs font-mono text-lightgold px-3 py-1 rounded-full bg-gold/10 border border-gold/25">
                Active Cycle: {VIMSHOTTARI_DASHA_DATA.activeMahadasha.planet}
              </span>
            </div>

            {/* Active Period Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Active Mahadasha Card */}
              <div className="p-5 rounded-2xl border border-gold/25 bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center text-xl text-gold font-bold">
                      {VIMSHOTTARI_DASHA_DATA.activeMahadasha.glyph}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-lightgold/80 block">
                        Major 16-Year Cycle
                      </span>
                      <h3 className="font-display text-base font-bold text-white">
                        {VIMSHOTTARI_DASHA_DATA.activeMahadasha.planet} Mahadasha
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-lightgold px-2 py-0.5 rounded bg-gold/15 border border-gold/30">
                    {VIMSHOTTARI_DASHA_DATA.activeMahadasha.startDate.split(' ')[2]} – {VIMSHOTTARI_DASHA_DATA.activeMahadasha.endDate.split(' ')[2]}
                  </span>
                </div>

                <p className="text-xs font-serif text-mutedtext leading-relaxed mb-3">
                  {VIMSHOTTARI_DASHA_DATA.activeMahadasha.overview}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-mutedtext/70">
                    <span>Cycle Progress:</span>
                    <span className="text-lightgold font-bold">{VIMSHOTTARI_DASHA_DATA.activeMahadasha.progressPercentage}% Completed</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lightgold to-gold rounded-full"
                      style={{ width: `${VIMSHOTTARI_DASHA_DATA.activeMahadasha.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Antardasha Card */}
              <div className="p-5 rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/15 via-white/5 to-transparent">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-10 w-10 rounded-xl bg-purple/20 border border-purple/40 flex items-center justify-center text-xl text-purple-200 font-bold">
                      {VIMSHOTTARI_DASHA_DATA.activeAntardasha.glyph}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-purple-200/80 block">
                        Active Sub-Period
                      </span>
                      <h3 className="font-display text-base font-bold text-white">
                        Guru - {VIMSHOTTARI_DASHA_DATA.activeAntardasha.planet} Antardasha
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-purple-200 px-2 py-0.5 rounded bg-purple/20 border border-purple/30">
                    {VIMSHOTTARI_DASHA_DATA.activeAntardasha.startDate} – {VIMSHOTTARI_DASHA_DATA.activeAntardasha.endDate}
                  </span>
                </div>

                <p className="text-xs font-serif text-mutedtext leading-relaxed mb-3">
                  {VIMSHOTTARI_DASHA_DATA.activeAntardasha.overview}
                </p>

                {/* Guidance Snippet */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-purple/20 text-[11px] font-serif text-lightgold/90 space-y-1">
                  <span className="font-sans font-semibold text-[10px] uppercase text-white block">
                    Strategic Mandate:
                  </span>
                  <span>{VIMSHOTTARI_DASHA_DATA.activeAntardasha.keyGuidance[0]}</span>
                </div>
              </div>
            </div>

            {/* Antardasha Sequence Stepper */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-lightgold uppercase tracking-wider font-sans">
                  Jupiter Mahadasha Sub-Period Sequence (Antardashas)
                </span>
                <button
                  type="button"
                  onClick={() => setIsDashaDetailsExpanded((prev) => !prev)}
                  className="text-xs text-lightgold hover:text-white flex items-center gap-1 font-serif underline underline-offset-2"
                >
                  <span>{isDashaDetailsExpanded ? 'Hide Full 120-Year Timeline' : 'View Full 120-Year Timeline'}</span>
                  {isDashaDetailsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {VIMSHOTTARI_DASHA_DATA.antardashaSequence.map((sub) => (
                  <div
                    key={sub.planet}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      sub.isCurrent
                        ? 'border-gold bg-gold/20 shadow-md shadow-gold/15'
                        : sub.status === 'completed'
                        ? 'border-white/10 bg-white/5 opacity-60'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] font-mono block text-mutedtext/70 mb-0.5">
                      {sub.startYear} – {sub.endYear}
                    </span>
                    <span className="font-semibold text-white block text-xs">{sub.planet}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                        sub.isCurrent
                          ? 'bg-gold text-vedabg font-bold'
                          : sub.status === 'completed'
                          ? 'bg-white/10 text-mutedtext'
                          : 'bg-white/5 text-lightgold/80'
                      }`}
                    >
                      {sub.badge}
                    </span>
                  </div>
                ))}
              </div>

              {/* Expandable 120-Year Mahadasha Overview */}
              {isDashaDetailsExpanded && (
                <div className="mt-4 p-4 rounded-2xl border border-gold/15 bg-white/5 space-y-3 animate-fadeIn">
                  <span className="text-xs font-semibold text-white block font-sans">
                    Complete 120-Year Vimshottari Mahadasha Lifespan Cycle:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {VIMSHOTTARI_DASHA_DATA.mahadashaTimeline.map((m) => (
                      <div
                        key={m.planet}
                        className={`p-2.5 rounded-xl border text-center ${
                          m.isCurrent
                            ? 'border-gold bg-gold/15 text-lightgold font-semibold'
                            : 'border-gold/10 bg-black/20 text-mutedtext'
                        }`}
                      >
                        <span className="block font-medium text-xs text-white">{m.planet}</span>
                        <span className="text-[10px] font-mono text-mutedtext block">{m.years} Years &bull; {m.span}</span>
                        {m.isCurrent && (
                          <span className="text-[9px] font-mono text-gold block mt-0.5 font-bold">Active Now</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: GOCHARA (PLANETARY TRANSIT) ANALYSIS           */}
        {/* ========================================================= */}
        <section aria-label="Gochara Transit Analysis">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15">
              <div>
                <div className="flex items-center gap-2">
                  <Orbit className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Gochara (Transit) Dynamics &bull; Active Movements
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  Planetary transits across your natal Bhavas interacting with your active Dasha period
                </p>
              </div>

              {/* Transit Filter Controls */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-gold/20 bg-white/5">
                {[
                  { id: 'all', label: 'All Transits' },
                  { id: 'transit-saturn', label: 'Saturn' },
                  { id: 'transit-jupiter', label: 'Jupiter' },
                  { id: 'transit-sun', label: 'Sun' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setActiveTransitPlanetFilter(tf.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeTransitPlanetFilter === tf.id
                        ? 'bg-gold/25 text-lightgold border border-gold/40 font-semibold'
                        : 'text-mutedtext hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTransits.map((transit) => (
                <div
                  key={transit.id}
                  className="p-5 rounded-2xl border border-gold/20 bg-white/5 hover:border-gold/40 hover:bg-gold/5 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-9 w-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg text-gold font-bold">
                        {transit.glyph}
                      </span>
                      <div>
                        <h3 className="font-display text-sm font-bold text-white">
                          {transit.planet} in {transit.currentSign}
                        </h3>
                        <span className="text-[11px] font-mono text-lightgold/80 block">
                          Degree: {transit.degree} &bull; {transit.motion}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/10 text-lightgold border border-gold/20">
                      {transit.natalHouse}
                    </span>
                  </div>

                  <p className="text-xs font-serif text-mutedtext leading-relaxed">
                    {transit.summary}
                  </p>

                  <div className="pt-2 border-t border-gold/10 flex items-center justify-between text-[11px] font-serif text-mutedtext">
                    <span>
                      <strong className="text-white font-sans text-[10px] uppercase">Focus: </strong>
                      {transit.keyFocus}
                    </span>
                    <span className="font-mono text-lightgold text-[10px]">{transit.effectiveRange}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: PREDICTION CATEGORIES & CARD EXPLORER          */}
        {/* ========================================================= */}
        <section aria-label="Prediction Categories and Forecast Cards">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gold/15">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Personalized Predictions &amp; Life Domains
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  Synthesized forecast dossiers across Career, Finance, Relationships, Health, and Education
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mutedtext pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter predictions..."
                  className="w-full rounded-xl bg-white/5 pl-10 pr-4 py-2 text-xs text-white placeholder:text-mutedtext/40 border border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORY_TABS.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const isSavedTab = cat.id === 'saved';

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-bold shadow-md shadow-gold/20'
                        : 'border border-gold/15 bg-white/5 text-mutedtext hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                    {isSavedTab && savedPredictionIds.length > 0 && (
                      <span className="h-4 w-4 rounded-full bg-gold/30 text-lightgold text-[10px] flex items-center justify-center font-mono">
                        {savedPredictionIds.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Predictions Grid */}
            {filteredPredictions.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl border border-gold/15 bg-white/5 p-8 text-center space-y-3">
                <div className="h-12 w-12 mx-auto rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">
                  {activeCategory === 'saved' ? 'No Saved Bookmarks Yet' : 'No Matching Predictions Found'}
                </h3>
                <p className="text-xs font-serif text-mutedtext max-w-md mx-auto leading-relaxed">
                  {activeCategory === 'saved'
                    ? 'Bookmark predictions using the bookmark ribbon icon on any forecast card to save them to your private study roster.'
                    : 'Adjust your search query or select another category tab to view astrological forecasts.'}
                </p>
                {activeCategory === 'saved' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className="mt-2 px-4 py-2 rounded-xl bg-gold text-vedabg font-semibold text-xs hover:bg-lightgold transition-all"
                  >
                    Explore All Predictions
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPredictions.map((pred) => {
                  const isSaved = savedPredictionIds.includes(pred.id);

                  return (
                    <div
                      key={pred.id}
                      onClick={() => setSelectedPrediction(pred)}
                      className="group rounded-2xl border border-gold/20 bg-white/5 hover:bg-gold/5 hover:border-gold/45 p-5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple/10 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-lightgold/80 px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                            {pred.categoryLabel}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-mutedtext">
                              {pred.timeframe}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleSavePrediction(pred.id, e)}
                              className="p-1 rounded-lg text-mutedtext hover:text-gold transition-colors focus:outline-none"
                              title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="h-4 w-4 text-gold fill-gold/20" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title & Summary */}
                        <h3 className="font-display text-base font-semibold text-white group-hover:text-lightgold transition-colors leading-snug mb-2">
                          {pred.title}
                        </h3>

                        <p className="text-xs font-serif text-mutedtext leading-relaxed line-clamp-3 mb-4">
                          {pred.summary}
                        </p>
                      </div>

                      <div>
                        {/* Astrological Indicators Pills */}
                        <div className="pt-3 border-t border-gold/10 flex items-center justify-between gap-2 text-[11px] font-serif">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {pred.relevantPlanets.slice(0, 2).map((pl) => (
                              <span
                                key={pl}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-gold/15 text-white/90"
                              >
                                {pl.split(' ')[0]}
                              </span>
                            ))}
                          </div>

                          <span className="text-xs font-semibold text-lightgold group-hover:text-white flex items-center gap-1 font-sans">
                            <span>Inspect Dossier</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: UPCOMING ASTROLOGICAL EVENTS TIMELINE          */}
        {/* ========================================================= */}
        <section aria-label="Upcoming Events Timeline">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gold/15">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Celestial Timeline &bull; Upcoming Transit Gateways
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-0.5">
                  Key astronomical ingresses and planetary stations across Q4 2026 – Q1 2027
                </p>
              </div>

              <span className="text-xs font-mono text-lightgold bg-gold/10 px-3 py-1 rounded-full border border-gold/25">
                5 Gateways
              </span>
            </div>

            <div className="space-y-3">
              {UPCOMING_EVENTS_TIMELINE.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl border border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-lightgold">
                        {event.date}
                      </span>
                      <span className="text-gold/40">&bull;</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold/10 text-lightgold border border-gold/20">
                        {event.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-sm font-semibold text-white">
                      {event.title}
                    </h3>

                    <p className="text-xs font-serif text-mutedtext leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PREDICTION DETAIL MODAL (REUSABLE DOSSIER INSPECTOR)      */}
        {/* ========================================================= */}
        {selectedPrediction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-2xl rounded-3xl border border-gold/40 bg-[#0b0817] p-6 sm:p-8 shadow-2xl shadow-purple/30 max-h-[90vh] overflow-y-auto space-y-5">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPrediction(null)}
                aria-label="Close prediction dossier"
                className="absolute top-5 right-5 p-2 rounded-xl text-mutedtext hover:text-white hover:bg-white/5 border border-gold/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="pb-4 border-b border-gold/15 pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-lightgold px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                    {selectedPrediction.categoryLabel}
                  </span>
                  <span className="text-xs font-mono text-mutedtext">
                    {selectedPrediction.timeframe}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {selectedPrediction.title}
                </h3>
              </div>

              {/* Astrological Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-gold/15">
                  <span className="text-[10px] font-mono uppercase text-lightgold block mb-1.5">
                    Governing Planets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrediction.relevantPlanets.map((pl) => (
                      <span
                        key={pl}
                        className="px-2 py-0.5 rounded bg-gold/15 text-lightgold font-semibold text-xs border border-gold/30"
                      >
                        {pl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-gold/15">
                  <span className="text-[10px] font-mono uppercase text-lightgold block mb-1.5">
                    Relevant Natal Bhavas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrediction.relevantHouses.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs border border-white/20"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supporting Astrological Factors */}
              <div className="p-4 rounded-2xl border border-gold/15 bg-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-lightgold block">
                  Supporting Ephemeris Factors:
                </span>
                <ul className="space-y-1 text-xs font-serif text-mutedtext">
                  {selectedPrediction.supportingFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Interpretation */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-lightgold block">
                  Classical Vedic Synthesis:
                </span>
                <p className="text-xs sm:text-sm font-serif text-mutedtext leading-relaxed p-4 rounded-2xl bg-black/40 border border-gold/10">
                  {selectedPrediction.detailedInterpretation}
                </p>
              </div>

              {/* Remedial Action */}
              <div className="p-4 rounded-2xl border border-gold/30 bg-gold/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-gold font-bold block">
                  Recommended Classical Upaya (Remedy):
                </span>
                <p className="text-xs font-serif text-lightgold leading-relaxed">
                  {selectedPrediction.remedialAction}
                </p>
              </div>

              {/* Ethical Limitation Disclaimer */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-[11px] font-serif text-mutedtext/80 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                <span>{selectedPrediction.disclaimer}</span>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-gold/15 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleSavePrediction(selectedPrediction.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gold/25 bg-white/5 hover:bg-white/10 text-xs font-medium text-lightgold transition-all"
                >
                  {savedPredictionIds.includes(selectedPrediction.id) ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-gold" />
                      <span>Bookmarked in Sanctuary</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Bookmark Prediction</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPrediction(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-lightgold via-gold to-lightgold text-vedabg font-semibold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default PredictionsPage;
