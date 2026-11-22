import { Compass, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context';
import { ROLE_DEFAULT_DASHBOARDS } from '../../router/routes';
import { navigate } from '../../router';

const NotFoundPage = () => {
  const { isAuthenticated, role } = useAuth();

  const handleDashboardRedirect = () => {
    const dashboard = role ? ROLE_DEFAULT_DASHBOARDS[role] : '/dashboard';
    navigate(dashboard);
  };

  return (
    <div className="min-h-screen bg-vedabg text-white flex flex-col justify-between selection:bg-gold/30 selection:text-lightgold relative overflow-hidden">
      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-purple/15 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full bg-gold/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-gold/15 bg-[#05040B]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
              <span className="font-display text-base font-bold text-vedabg">V</span>
            </div>
            <span className="font-display text-lg font-semibold text-white tracking-wide group-hover:text-lightgold transition-colors">
              Veda AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs text-mutedtext hover:text-lightgold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Celestial Compass Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse blur-md" />
            <div className="relative h-20 w-20 rounded-full border border-gold/40 bg-[#0b0817]/90 flex items-center justify-center shadow-xl shadow-purple/30">
              <Compass className="h-10 w-10 text-gold animate-spin-slow" />
            </div>
          </div>

          {/* Error Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/25 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-4">
            <span>Astral Coordinate Not Found</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-wide mb-3">
            404
          </h1>

          <h2 className="font-display text-xl sm:text-2xl font-semibold text-lightgold mb-3">
            Lost in the Celestial Void
          </h2>

          <p className="font-serif text-sm sm:text-base text-mutedtext leading-relaxed mb-8">
            The heavenly coordinates you sought do not exist or have drifted beyond the reach of our astrological charts.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Home className="h-4 w-4" />
              Return Home
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleDashboardRedirect}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-medium text-lightgold border border-gold/30 bg-gold/10 hover:bg-gold/20 hover:border-gold/50 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 w-full border-t border-gold/10 py-4 text-center text-xs text-mutedtext/70">
        <p>&copy; {new Date().getFullYear()} Veda AI &bull; Ancient Wisdom &bull; Intelligent Insights</p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
