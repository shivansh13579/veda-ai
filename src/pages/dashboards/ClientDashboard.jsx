import {
  Compass,
  Sparkles,
  MessageSquare,
  User,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  History,
  Orbit,
  Star,
  Activity,
  FileText,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const ClientDashboard = () => {
  const { user } = useAuth();

  // Quick Access Cards Configuration
  const quickAccessCards = [
    {
      title: 'My Kundli',
      route: ROUTES.CLIENT_KUNDLI,
      icon: Compass,
      badge: 'D1 Lagna Chart',
      description: 'Inspect your mathematically calculated North Indian birth chart, 12 Bhavas, and planetary degrees.',
      actionText: 'View Kundli Chart',
      gradient: 'from-amber-500/15 via-gold/10 to-transparent',
      borderColor: 'border-gold/30',
      iconColor: 'text-gold',
    },
    {
      title: 'Ask Veda AI',
      route: ROUTES.CLIENT_CHAT,
      icon: MessageSquare,
      badge: 'Instant AI Advice',
      description: 'Consult your personal Vedic AI astrologer on career, relationships, transits, or classical remedies.',
      actionText: 'Start Consultation',
      gradient: 'from-purple/20 via-purple/10 to-transparent',
      borderColor: 'border-purple/40',
      iconColor: 'text-purple-300',
    },
    {
      title: 'Predictions',
      route: ROUTES.CLIENT_PREDICTIONS,
      icon: Sparkles,
      badge: 'Dasha & Transits',
      description: 'Explore personalized forecasts across Career, Finance, and Health computed from your active dasha.',
      actionText: 'Explore Forecasts',
      gradient: 'from-blue-500/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-blue-400/30',
      iconColor: 'text-blue-300',
    },
    {
      title: 'Birth Profile',
      route: ROUTES.CLIENT_PROFILE,
      icon: User,
      badge: 'Ephemeris Data',
      description: 'Maintain precise birth time, geographic coordinates, and Ayanamsha parameters for exact calculations.',
      actionText: 'Manage Profile',
      gradient: 'from-emerald-500/15 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  // Astrological Overview Parameters
  const astrologyOverview = [
    {
      title: 'Moon Sign (Chandra Rashi)',
      value: user?.moonSign || 'Capricorn (Makara)',
      subtitle: `Nakshatra: ${user?.moonNakshatra || 'Shravana (Pada 2)'}`,
      detail: 'Lord: Saturn (Shani) • Earth (Prithvi)',
      icon: Moon,
      color: 'text-lightgold',
      bgGlow: 'bg-gold/10',
    },
    {
      title: 'Ascendant (Lagna)',
      value: user?.ascendant || 'Libra (Tula)',
      subtitle: `Lagna Lord: ${user?.ascendantLord || 'Venus (Shukra)'}`,
      detail: 'Degree: 14° 22\' • Air (Vayu)',
      icon: Sun,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10',
    },
    {
      title: 'Current Mahadasha',
      value: user?.currentMahadasha || 'Jupiter (Guru)',
      subtitle: '16-Year Planetary Period (2015 – 2031)',
      detail: 'Focus: Wisdom, Expansion & Career Growth',
      icon: Orbit,
      color: 'text-purple-300',
      bgGlow: 'bg-purple/10',
    },
    {
      title: 'Current Antardasha',
      value: user?.currentAntardasha || 'Saturn (Shani)',
      subtitle: `Active: ${user?.dashaPeriod || 'Nov 2024 – May 2027'}`,
      detail: 'Focus: Discipline, Karmic Focus & Resilience',
      icon: Activity,
      color: 'text-blue-300',
      bgGlow: 'bg-blue-500/10',
    },
  ];

  // Recent Activity Items
  const recentActivities = [
    {
      id: 1,
      type: 'chat',
      title: 'Career Transit Inquiry',
      query: '“How does Jupiter’s transit into my 10th house impact leadership opportunities this year?”',
      time: '2 hours ago',
      category: 'Veda AI Consultation',
      icon: MessageSquare,
      iconColor: 'text-purple-400',
    },
    {
      id: 2,
      type: 'prediction',
      title: 'Quarterly Career Forecast (Q4 2026)',
      query: 'Favorable alignment detected for strategic career transition during Mercury direct phase.',
      time: '3 days ago',
      category: 'Saved Prediction',
      icon: Sparkles,
      iconColor: 'text-gold',
    },
    {
      id: 3,
      type: 'kundli',
      title: 'Lagna D1 Chart Rectification',
      query: 'Coordinates locked to Varanasi (25.3176° N, 82.9739° E) at 06:45 AM IST.',
      time: '4 days ago',
      category: 'Chart Inspection',
      icon: Compass,
      iconColor: 'text-emerald-400',
    },
    {
      id: 4,
      type: 'chat',
      title: 'Remedy Guidance for Saturn Dasha',
      query: '“What are the recommended classical mantras and charity protocols for Shani-Guru subperiod?”',
      time: '1 week ago',
      category: 'Veda AI Consultation',
      icon: MessageSquare,
      iconColor: 'text-purple-400',
    },
  ];

  // Upcoming Planetary Events (Transit Timelines)
  const upcomingTransits = [
    {
      id: 'transit-1',
      planet: 'Saturn (Shani)',
      sign: 'Direct in Pisces (Meena)',
      date: '28 Nov 2026',
      tag: 'Major Transit',
      description: 'Stabilizing planetary movement over 6th house affairs. Brings structured focus to health regimens and workplace commitments.',
      isHighlighted: true,
    },
    {
      id: 'transit-2',
      planet: 'Full Moon (Purnima)',
      sign: 'Rohini Nakshatra (Taurus)',
      date: '04 Dec 2026',
      tag: 'Lunar Window',
      description: 'Chandra reaches peak exaltation in Rohini. Auspicious period for peace of mind, family harmony, and devotional contemplation.',
      isHighlighted: false,
    },
    {
      id: 'transit-3',
      planet: 'Jupiter (Guru)',
      sign: 'Station in Taurus (Vrishabha)',
      date: '12 Dec 2026',
      tag: 'Planetary Shift',
      description: 'Guru pauses forward motion in the 8th house. Excellent for philosophical reflection, research, and long-term financial planning.',
      isHighlighted: false,
    },
    {
      id: 'transit-4',
      planet: 'Sun (Surya)',
      sign: 'Sagittarius Ingress (Dhanu Sankranti)',
      date: '16 Dec 2026',
      tag: 'Solar Ingress',
      description: 'Solar transition into the 9th house of Dharma and higher learning. Promotes clarity in moral purpose and mentor guidance.',
      isHighlighted: false,
    },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const completionMetrics = calculateProfileCompletion({
    fullName: user?.name,
    displayName: user?.displayName,
    dateOfBirth: user?.dateOfBirth,
    birthTime: user?.birthTime,
    isTimeUnknown: user?.isTimeUnknown,
    country: user?.country || 'India',
    state: user?.state || 'Uttar Pradesh',
    city: user?.city || 'Varanasi',
    latitude: user?.coordinates?.split(',')[0],
    longitude: user?.coordinates?.split(',')[1],
    timezone: user?.timezone || user?.ayanamsa,
    isCoordinatesVerified: user?.isCoordinatesVerified ?? true,
  });

  return (
    <ClientLayout pageTitle="Dashboard">
      <div className="space-y-8 animate-fadeIn">
        {/* ========================================================= */}
        {/* SECTION 1: DASHBOARD WELCOME & PROFILE STATUS             */}
        {/* ========================================================= */}
        <section
          aria-label="Welcome and Profile Overview"
          className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#120d28]/95 via-[#0b0817]/95 to-[#160b24]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple/15 relative overflow-hidden"
        >
          {/* Subtle celestial orb background */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              {/* Ephemeris Date & Tithi Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-3">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                <span>{currentDateFormatted} &bull; Shukla Paksha Dashami</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-wide">
                Namaste, {user?.name || 'Aarav Sharma'}
              </h1>

              <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
                Welcome to your personal astrological sanctuary. Your natal chart coordinates, Vimshottari Dasha cycles, and transit planetary timelines are synchronized for today.
              </p>
            </div>

            {/* Profile Completion & CTA Card */}
            <div className="w-full lg:w-auto min-w-[280px] rounded-2xl border border-gold/20 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Profile Completion
                </span>
                <span className="text-xs font-mono font-semibold text-lightgold">
                  {completionMetrics.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-lightgold to-gold rounded-full transition-all duration-500"
                  style={{ width: `${completionMetrics.percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-mutedtext/80 font-serif mb-3 leading-relaxed">
                {completionMetrics.percentage === 100
                  ? 'All essential birth ephemeris fields verified and calibrated.'
                  : `Status: ${completionMetrics.status}. Complete all fields for 100% chart accuracy.`}
              </p>

              <button
                type="button"
                onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Complete Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: QUICK ACCESS CARDS                             */}
        {/* ========================================================= */}
        <section aria-label="Quick Access Modules">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-white tracking-wide">
                Quick Access Portals
              </h2>
              <p className="text-xs font-serif text-mutedtext mt-0.5">
                Direct pathways into your astrological tools and consultations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {quickAccessCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.route}
                  onClick={() => navigate(card.route)}
                  className={`group relative cursor-pointer rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} bg-[#0b0817]/90 p-5 transition-all duration-300 hover:border-gold/50 hover:shadow-xl hover:shadow-purple/20 hover:-translate-y-1 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="h-11 w-11 rounded-xl bg-white/5 border border-gold/25 flex items-center justify-center text-lightgold group-hover:scale-105 group-hover:border-gold transition-all">
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-lightgold/90 px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-white group-hover:text-lightgold transition-colors">
                      {card.title}
                    </h3>

                    <p className="mt-2 font-serif text-xs text-mutedtext leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between text-xs font-medium text-lightgold group-hover:text-white transition-colors">
                    <span>{card.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: BIRTH PROFILE SUMMARY                          */}
        {/* ========================================================= */}
        <section aria-label="Birth Profile Summary">
          <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-purple/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gold/15 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
                    Birth Profile Summary
                  </h2>
                </div>
                <p className="text-xs font-serif text-mutedtext mt-1">
                  Verified natal ephemeris coordinates used for all astrological calculations
                </p>
              </div>

              {/* Demo Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/25 bg-gold/10 text-[11px] font-serif text-lightgold">
                <Star className="h-3 w-3 text-gold" />
                <span>Sample Astrological Profile (Demo)</span>
              </div>
            </div>

            {/* Profile Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Full Name */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5">
                <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1">
                  Full Name
                </span>
                <span className="font-medium text-sm text-white block">
                  {user?.name || 'Aarav Sharma'}
                </span>
                <span className="text-[10px] text-lightgold/80 font-serif block mt-0.5">
                  Client ID: {user?.id || 'usr-client-01'}
                </span>
              </div>

              {/* Date of Birth */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5">
                <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gold" />
                  Date of Birth
                </span>
                <span className="font-medium text-sm text-white block">
                  {user?.dateOfBirth || '14 October 1994'}
                </span>
                <span className="text-[10px] text-lightgold/80 font-serif block mt-0.5">
                  Vedic Solar Tithi: Dashami
                </span>
              </div>

              {/* Birth Time */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5">
                <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gold" />
                  Exact Birth Time
                </span>
                <span className="font-medium text-sm text-white block">
                  {user?.birthTime || '06:45 AM (IST)'}
                </span>
                <span className="text-[10px] text-emerald-400 font-serif block mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Rectified & Confirmed
                </span>
              </div>

              {/* Birth Location */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5">
                <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gold" />
                  Birth Location
                </span>
                <span className="font-medium text-sm text-white block truncate">
                  {user?.birthLocation || 'Varanasi, Uttar Pradesh, India'}
                </span>
                <span className="text-[10px] text-lightgold/80 font-mono block mt-0.5">
                  {user?.coordinates || '25.3176° N, 82.9739° E'}
                </span>
              </div>

              {/* Ayanamsha & Ephemeris System */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5">
                <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1 flex items-center gap-1">
                  <Orbit className="h-3 w-3 text-gold" />
                  Ayanamsha Calculation
                </span>
                <span className="font-medium text-sm text-white block">
                  {user?.ayanamsa || 'Lahiri (Chitra Paksha)'}
                </span>
                <span className="text-[10px] text-mutedtext font-serif block mt-0.5">
                  Standard Vedic Sidereal System
                </span>
              </div>

              {/* Profile Completion Status */}
              <div className="p-3.5 rounded-xl border border-gold/15 bg-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-mutedtext/70 block mb-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Verification Level
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-emerald-300">
                      {completionMetrics.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {completionMetrics.percentage}%
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                  className="mt-2 text-xs text-lightgold hover:text-white underline underline-offset-2 transition-colors text-left font-serif"
                >
                  Edit Birth Coordinates &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: ASTROLOGY OVERVIEW (ILLUSTRATIVE EPHEMERIS)   */}
        {/* ========================================================= */}
        <section aria-label="Astrology Overview">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-white tracking-wide">
                Astrological Overview
              </h2>
              <p className="text-xs font-serif text-mutedtext mt-0.5">
                Sample core parameters derived from your birth chart
              </p>
            </div>

            {/* Clear Illustrative Note */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/20 bg-white/5 text-[11px] font-serif text-mutedtext">
              <AlertTriangle className="h-3 w-3 text-gold" />
              <span>Illustrative sample calculation &bull; Not predictive prophecy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {astrologyOverview.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gold/20 bg-[#0b0817]/90 p-5 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-purple/10"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-mono uppercase text-mutedtext/70">
                      {item.title}
                    </span>
                    <div className={`p-2 rounded-xl ${item.bgGlow} border border-gold/20`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>

                  <div className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                    {item.value}
                  </div>

                  <div className="text-xs text-lightgold/90 font-serif mb-1">
                    {item.subtitle}
                  </div>

                  <div className="text-[11px] text-mutedtext/80 font-mono mt-2 pt-2 border-t border-gold/10">
                    {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5 & 6: RECENT ACTIVITY & UPCOMING TRANSITS         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Activity List (7 cols) */}
          <section aria-label="Recent Activity" className="lg:col-span-7">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 shadow-xl shadow-purple/10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-4">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                      Recent Consultations & Saved Insights
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-mutedtext uppercase">
                    Sample Activity
                  </span>
                </div>

                <div className="space-y-3">
                  {recentActivities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl border border-gold/15 bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-3.5"
                      >
                        <div className="h-9 w-9 rounded-lg bg-white/5 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className={`h-4 w-4 ${act.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-xs sm:text-sm text-white truncate">
                              {act.title}
                            </span>
                            <span className="text-[10px] font-mono text-mutedtext/70 whitespace-nowrap">
                              {act.time}
                            </span>
                          </div>
                          <p className="font-serif text-xs text-mutedtext leading-relaxed line-clamp-2">
                            {act.query}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-lightgold/80 px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                              {act.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 mt-4 border-t border-gold/10 flex items-center justify-between">
                <span className="text-xs text-mutedtext font-serif">
                  Have an astrological query about your chart?
                </span>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_CHAT)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-lightgold hover:text-white transition-colors"
                >
                  <span>Ask Veda AI</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </section>

          {/* Upcoming Planetary Events (5 cols) */}
          <section aria-label="Upcoming Planetary Events" className="lg:col-span-5">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 shadow-xl shadow-purple/10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-4">
                  <div className="flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                      Planetary Transits
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-lightgold uppercase px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                    Gochara 2026
                  </span>
                </div>

                <div className="space-y-3">
                  {upcomingTransits.map((transit) => (
                    <div
                      key={transit.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        transit.isHighlighted
                          ? 'border-gold/40 bg-gold/10 shadow-md shadow-gold/5'
                          : 'border-gold/15 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-medium text-xs sm:text-sm text-white block">
                            {transit.planet}
                          </span>
                          <span className="text-[11px] text-lightgold/90 font-serif">
                            {transit.sign}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono font-semibold text-lightgold block">
                            {transit.date}
                          </span>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-mutedtext/70 block mt-0.5">
                            {transit.tag}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 font-serif text-xs text-mutedtext leading-relaxed">
                        {transit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 mt-4 border-t border-gold/10 flex items-center justify-between">
                <span className="text-[11px] text-mutedtext font-serif">
                  Calculated against your 12 Bhavas
                </span>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_PREDICTIONS)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-lightgold hover:text-white transition-colors"
                >
                  <span>All Predictions</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* DISCLAIMER & FOOTER NOTES                                 */}
        {/* ========================================================= */}
        <section aria-label="Astrological Compliance & Methodology Note">
          <div className="rounded-2xl border border-gold/15 bg-white/5 p-4 sm:p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gold flex-shrink-0 mt-0.5 hidden sm:block" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Veda AI Astrological Methodology & Guidance Principle
                </span>
                <p className="text-xs font-serif text-mutedtext mt-0.5 leading-relaxed">
                  All astrological calculations are synthesized using standard Lahiri Ephemeris and classical Parashara principles. Astrological interpretations serve as reflective spiritual guidance and must never replace medical, financial, or legal counsel.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.CLIENT_KUNDLI)}
              className="whitespace-nowrap px-4 py-2 rounded-xl border border-gold/25 bg-white/5 hover:bg-white/10 hover:border-gold/45 text-xs font-medium text-lightgold transition-all"
            >
              Explore Full Kundli
            </button>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
