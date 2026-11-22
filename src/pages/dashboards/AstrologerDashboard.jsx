import { Users, FileCheck, FileText, Sparkles, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context';
import { ROLES, ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const AstrologerDashboard = () => {
  const { user, role, logout, switchRole } = useAuth();

  const astrologerModules = [
    {
      title: 'Client Directory',
      route: ROUTES.ASTROLOGER_CLIENTS,
      icon: Users,
      description: 'Access seeker birth profiles, active Vimshottari Dasha periods, and prior consultation records.',
      tag: 'Seeker Records',
    },
    {
      title: 'Verification Queue',
      route: ROUTES.ASTROLOGER_VERIFICATIONS,
      icon: FileCheck,
      description: 'Audit AI-synthesized astrological readings, planetary strength computations (Shadbala), and certify remedy protocols.',
      tag: '5 Pending',
    },
    {
      title: 'Astrological Reports',
      route: ROUTES.ASTROLOGER_REPORTS,
      icon: FileText,
      description: 'Compile in-depth natal dossiers, yearly Varshaphala forecasts, and marriage compatibility (Kundli Milan) reports.',
      tag: 'Dossiers',
    },
  ];

  return (
    <div className="min-h-screen bg-vedabg text-white flex flex-col justify-between selection:bg-gold/30 selection:text-lightgold relative overflow-hidden">
      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[550px] h-[550px] rounded-full bg-purple/15 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-gold/10 blur-[150px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gold/15 bg-[#05040B]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
              <span className="font-display text-base font-bold text-vedabg">V</span>
            </div>
            <div className="text-left">
              <span className="font-display text-lg font-semibold text-white tracking-wide group-hover:text-lightgold transition-colors block leading-tight">
                Veda AI
              </span>
              <span className="text-[10px] font-serif text-lightgold uppercase tracking-wider block">
                Astrologer Portal
              </span>
            </div>
          </button>

          {/* User profile & action controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gold/20 bg-white/5 text-xs">
              <span className="text-base">{user?.avatarSymbol || '🔮'}</span>
              <div className="text-left">
                <span className="block font-medium text-white leading-tight">{user?.name}</span>
                <span className="block text-[10px] text-lightgold uppercase font-mono tracking-wider">
                  {user?.title || 'Astrologer'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 hover:border-gold/40 text-xs text-mutedtext hover:text-white transition-all inline-flex items-center gap-1.5 focus:outline-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Greeting Banner */}
        <div className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#180d28]/95 via-[#0b0817]/95 to-[#1c0e2a]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple/15 mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Practitioner Credentials &bull; {user?.experienceYears ?? 18}+ Years Jyotish Experience</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-wide">
                Pranam, {user?.name || 'Acharya'}
              </h1>
              <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext max-w-2xl leading-relaxed">
                Review automated planetary ephemeris calculations, inspect Shadbala strengths, and certify astrological readings for seekers.
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-initial rounded-2xl border border-gold/20 bg-white/5 p-3.5 text-center min-w-[110px]">
                <div className="font-display text-xl font-bold text-lightgold">{user?.activeReviews ?? 5}</div>
                <div className="text-[11px] text-mutedtext font-serif">Pending Reviews</div>
              </div>
              <div className="flex-1 md:flex-initial rounded-2xl border border-gold/20 bg-white/5 p-3.5 text-center min-w-[110px]">
                <div className="font-display text-xl font-bold text-emerald-400">4.9 / 5</div>
                <div className="text-[11px] text-mutedtext font-serif">Rating</div>
              </div>
              <div className="flex-1 md:flex-initial rounded-2xl border border-gold/20 bg-white/5 p-3.5 text-center min-w-[110px]">
                <div className="font-display text-xl font-bold text-lightgold">142</div>
                <div className="text-[11px] text-mutedtext font-serif">Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Astrologer Modules Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
              Practitioner Workstation
            </h2>
            <span className="text-xs text-mutedtext">3 Modules Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {astrologerModules.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className="group relative cursor-pointer rounded-2xl border border-gold/20 bg-[#0b0817]/80 hover:bg-[#120d28]/90 p-5 sm:p-6 transition-all duration-300 hover:border-gold/45 hover:shadow-xl hover:shadow-purple/20 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-gold/25 flex items-center justify-center text-lightgold group-hover:scale-105 group-hover:border-gold transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-lightgold/80 px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-lightgold transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-mutedtext group-hover:text-lightgold group-hover:translate-x-0.5 transition-all" />
                  </h3>

                  <p className="mt-2.5 font-serif text-xs text-mutedtext leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Role Switcher Matrix for Fast Review */}
        <div className="rounded-2xl border border-gold/15 bg-white/5 p-5 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-semibold text-lightgold uppercase tracking-wider block mb-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                Frontend Authentication & Role Matrix (Batch 4D Demo)
              </span>
              <p className="text-xs text-mutedtext">
                Current active role: <strong className="text-white capitalize">{role}</strong>. Switch roles to test client, astrologer, or admin view guards.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => switchRole(ROLES.CLIENT)}
                className="px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/10 hover:bg-gold/20 text-xs font-medium text-lightgold transition-all"
              >
                Switch to Client
              </button>
              <button
                type="button"
                onClick={() => switchRole(ROLES.ADMIN)}
                className="px-3 py-1.5 rounded-lg border border-purple/40 bg-purple/10 hover:bg-purple/20 text-xs font-medium text-purple-200 transition-all"
              >
                Switch to Admin
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-gold/10 py-5 text-center text-xs text-mutedtext/70">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Veda AI &bull; Astrologer Portal</p>
          <p className="text-lightgold/70">Authenticated as {user?.email}</p>
        </div>
      </footer>
    </div>
  );
};

export default AstrologerDashboard;
