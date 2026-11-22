import { ShieldAlert, ArrowLeft, LayoutDashboard, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context';
import { ROLES, ROLE_DEFAULT_DASHBOARDS } from '../../router/routes';
import { navigate } from '../../router';

const AccessDeniedPage = ({ attemptedPath = '', allowedRoles = [] }) => {
  const { user, role, switchRole } = useAuth();

  const handleReturnToDashboard = () => {
    const dashboard = role ? ROLE_DEFAULT_DASHBOARDS[role] : '/dashboard';
    navigate(dashboard);
  };

  const handleQuickSwitch = (newRole) => {
    switchRole(newRole, false);
    // Reload same URL to re-evaluate permissions with new role
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-vedabg text-white flex flex-col justify-between selection:bg-gold/30 selection:text-lightgold relative overflow-hidden">
      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-950/20 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-purple/15 blur-[140px]" />
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
            onClick={handleReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-mutedtext hover:text-lightgold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My Dashboard
          </button>
        </div>
      </header>

      {/* Main 403 Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full rounded-3xl border border-red-500/30 bg-[#0b0817]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-red-950/30 text-center animate-fadeIn">
          {/* Restricted Shield Icon */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md" />
            <div className="relative h-16 w-16 rounded-full border border-red-500/40 bg-red-950/40 flex items-center justify-center shadow-lg">
              <ShieldAlert className="h-8 w-8 text-red-400" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-serif text-red-300 uppercase tracking-wider mb-3">
            <span>403 &bull; Cosmic Clearance Restricted</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide mb-2">
            Access Denied
          </h1>

          <p className="font-serif text-sm text-mutedtext leading-relaxed mb-6">
            Your current astrological credential level does not grant access to the requested astral chamber:{' '}
            <code className="text-lightgold bg-white/5 px-2 py-0.5 rounded text-xs font-mono">{attemptedPath}</code>
          </p>

          {/* Credential Status Box */}
          <div className="rounded-2xl border border-gold/15 bg-white/5 p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-mutedtext">Authenticated User:</span>
              <span className="font-medium text-white">{user?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mutedtext">Current Role:</span>
              <span className="capitalize font-semibold text-lightgold px-2 py-0.5 rounded bg-gold/15 border border-gold/30">
                {role || 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mutedtext">Required Role(s):</span>
              <span className="capitalize font-medium text-red-300">
                {allowedRoles.length > 0 ? allowedRoles.join(', ') : 'Restricted'}
              </span>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Return to Authorized Dashboard
            </button>
          </div>

          {/* Demo Quick Role Switcher for seamless testing */}
          <div className="pt-5 border-t border-gold/15 text-center">
            <p className="text-xs text-mutedtext mb-3 flex items-center justify-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-gold" />
              <span>Demo Testing: Switch role to access this route</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.values(ROLES).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickSwitch(r)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    role === r
                      ? 'border-gold bg-gold/20 text-lightgold font-semibold'
                      : 'border-gold/20 bg-white/5 text-mutedtext hover:text-white hover:border-gold/40'
                  }`}
                >
                  Switch to {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-gold/10 py-4 text-center text-xs text-mutedtext/70">
        <p>&copy; {new Date().getFullYear()} Veda AI &bull; Role-Based Security Matrix</p>
      </footer>
    </div>
  );
};

export default AccessDeniedPage;
