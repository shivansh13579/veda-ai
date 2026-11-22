import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, User, LayoutDashboard, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../context';
import { ROLE_DEFAULT_DASHBOARDS } from '../router/routes';
import { navigate } from '../router';

const navLinks = [
  { label: 'Home', target: 'hero' },
  { label: 'Explore Kundli', target: 'kundli' },
  { label: 'Features', target: 'features' },
  { label: 'FAQs', target: 'faq' },
];

const Navbar = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToTarget = (targetId) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    scrollToTarget(targetId);
  };

  const handleMobileNavClick = (targetId) => {
    setIsMobileMenuOpen(false);
    scrollToTarget(targetId);
  };

  const handleCtaClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (isAuthenticated) {
      navigate(ROLE_DEFAULT_DASHBOARDS[role] || '/dashboard');
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/login');
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    navigate('/login');
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    navigate(ROLE_DEFAULT_DASHBOARDS[role] || '/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold/15 bg-[#05040B]/85 backdrop-blur-md transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (window.location.pathname !== '/') {
              navigate('/');
            } else {
              scrollToTarget('hero');
            }
          }}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg py-1 px-1.5 -ml-1.5"
        >
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-gold/30 blur-sm group-hover:bg-gold/50 transition-all" />
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
              <span className="font-display text-base sm:text-lg font-bold text-vedabg">V</span>
            </div>
          </div>
          <span className="font-display text-lg sm:text-xl font-semibold text-white tracking-wide group-hover:text-lightgold transition-colors">
            Veda AI
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.target}
              href={`#${link.target}`}
              onClick={(e) => handleNavClick(e, link.target)}
              className="px-3.5 py-2 text-sm font-medium text-mutedtext hover:text-lightgold hover:bg-white/5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <a
                href={ROLE_DEFAULT_DASHBOARDS[role] || '/dashboard'}
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold rounded-xl shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard ({role})</span>
              </a>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 text-mutedtext hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <a
                href="/login"
                onClick={handleLoginClick}
                className="px-3 py-2 text-sm font-medium text-lightgold hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Sign In
              </a>

              <button
                type="button"
                onClick={handleCtaClick}
                className="group relative inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:shadow-gold/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <Sparkles className="h-4 w-4" />
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className="p-2 rounded-xl text-lightgold hover:text-white hover:bg-white/5 border border-gold/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-gold/15 bg-[#0b0817]/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl animate-fadeIn"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.target}
                href={`#${link.target}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleMobileNavClick(link.target);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-mutedtext hover:text-lightgold hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-gold/10 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-xs text-mutedtext flex items-center justify-between">
                  <span>Signed in as: <strong className="text-white">{user?.name}</strong></span>
                  <span className="capitalize text-lightgold font-mono">({role})</span>
                </div>
                <a
                  href={ROLE_DEFAULT_DASHBOARDS[role] || '/dashboard'}
                  onClick={handleDashboardClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Open {role} Dashboard
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-medium text-red-300 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={handleLoginClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-lightgold border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In to Your Account
                </a>

                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
