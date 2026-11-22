import { ArrowLeft, Sparkles, LayoutDashboard, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context';
import { navigate } from '../../router';
import ClientLayout from '../../layouts/ClientLayout';

const DashboardSubroute = ({
  title,
  category,
  description,
  parentDashboard,
  children,
}) => {
  const { user, role, logout } = useAuth();

  const subrouteContent = (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/25 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-3">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>{category} Portal Module</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-wide">
          {title}
        </h1>
        {description && (
          <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Dynamic or Default Placeholder Section */}
      {children ? (
        children
      ) : (
        <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-8 sm:p-12 text-center shadow-xl shadow-purple/10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-lightgold/20 to-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
              <LayoutDashboard className="h-8 w-8" />
            </div>

            <h2 className="font-display text-xl font-semibold text-white">
              {title} Module Interface
            </h2>

            <p className="font-serif text-sm text-mutedtext leading-relaxed">
              The route security, navigation state, and role authorization for this module are active and verified. The full interactive workspace and calculation engines will connect in upcoming implementation batches.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Authorized as {role} ({user?.name})</span>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => navigate(parentDashboard || '/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl py-2.5 px-5 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If this is a Client portal subroute, render within the cohesive ClientLayout
  if (category === 'Client') {
    return <ClientLayout pageTitle={title}>{subrouteContent}</ClientLayout>;
  }

  // Standalone shell for Astrologer/Admin categories
  return (
    <div className="min-h-screen bg-vedabg text-white flex flex-col justify-between selection:bg-gold/30 selection:text-lightgold relative overflow-hidden">
      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-purple/15 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/10 blur-[130px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-gold/15 bg-[#05040B]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(parentDashboard || '/dashboard')}
              className="flex items-center gap-2 group text-xs sm:text-sm font-medium text-mutedtext hover:text-lightgold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </button>

            <span className="text-gold/30 hidden sm:inline">&bull;</span>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-mutedtext/70">
              <span className="uppercase">{category}</span>
              <span>/</span>
              <span className="text-lightgold">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Identity Chip */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gold/20 bg-white/5 text-xs">
              <span className="text-base">{user?.avatarSymbol || '🕉️'}</span>
              <div className="text-left">
                <span className="block font-medium text-white leading-tight">{user?.name}</span>
                <span className="block text-[10px] text-lightgold/80 capitalize">{role}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 hover:border-gold/40 text-xs text-mutedtext hover:text-white transition-all inline-flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {subrouteContent}
      </main>

      {/* Footer minimal */}
      <footer className="relative z-10 w-full border-t border-gold/10 py-5 text-center text-xs text-mutedtext/70">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Veda AI &bull; Role-Based Architecture</p>
          <p className="text-lightgold/70">Current Session: {user?.email} ({role})</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardSubroute;
