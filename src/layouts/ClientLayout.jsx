import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  CheckCheck,
  Calendar,
  Home,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context';
import { ROUTES, ROLES } from '../router/routes';
import { navigate, useCurrentPath } from '../router';

const navItems = [
  {
    label: 'Dashboard',
    path: ROUTES.CLIENT_DASHBOARD,
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'My Kundli',
    path: ROUTES.CLIENT_KUNDLI,
    icon: Compass,
    badge: 'D1 Chart',
  },
  {
    label: 'Predictions',
    path: ROUTES.CLIENT_PREDICTIONS,
    icon: Sparkles,
    badge: 'Transits',
  },
  {
    label: 'Veda AI Chat',
    path: ROUTES.CLIENT_CHAT,
    icon: MessageSquare,
    badge: 'AI Assistant',
  },
  {
    label: 'My Profile',
    path: ROUTES.CLIENT_PROFILE,
    icon: User,
    badge: null,
  },
];

const sampleNotifications = [
  {
    id: 1,
    title: 'Saturn Transit Station',
    message: 'Shani stations direct in Pisces (Meena) on 28 Nov 2026. Review your transit timeline.',
    time: '15m ago',
    unread: true,
    category: 'Transit',
  },
  {
    id: 2,
    title: 'Weekly Forecast Ready',
    message: 'Your personal Jupiter Mahadasha forecast across Career & Growth has been updated.',
    time: '2h ago',
    unread: true,
    category: 'Prediction',
  },
  {
    id: 3,
    title: 'Kundli Rectification Note',
    message: 'Birth time coordinates locked to Varanasi (25.3176° N, 82.9739° E). Accuracy rating: 98%.',
    time: '1d ago',
    unread: false,
    category: 'Profile',
  },
];

const ClientLayout = ({ children, pageTitle = 'Dashboard' }) => {
  const [currentPath] = useCurrentPath();
  const { user, role, logout, switchRole } = useAuth();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsNotificationOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const handleNavClick = (path) => {
    setIsMobileDrawerOpen(false);
    navigate(path);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen bg-vedabg text-white flex flex-col selection:bg-gold/30 selection:text-lightgold relative overflow-x-hidden">
      {/* Background Cosmic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple/10 blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[160px]" />
      </div>

      <div className="flex-1 flex relative z-10 w-full">
        {/* ========================================================= */}
        {/* DESKTOP SIDEBAR NAVIGATION                                */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-gold/15 bg-[#070510]/95 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
          {/* Brand Logo Header */}
          <div className="h-20 px-6 border-b border-gold/15 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleNavClick(ROUTES.CLIENT_DASHBOARD)}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gold/30 blur-sm group-hover:bg-gold/50 transition-all" />
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
                  <span className="font-display text-lg font-bold text-vedabg">V</span>
                </div>
              </div>
              <div className="text-left">
                <span className="font-display text-lg font-semibold text-white tracking-wide group-hover:text-lightgold transition-colors block leading-tight">
                  Veda AI
                </span>
                <span className="text-[10px] font-serif text-lightgold uppercase tracking-wider block">
                  Client Sanctuary
                </span>
              </div>
            </button>
          </div>

          {/* User Quick Identity Pill */}
          <div className="p-4 mx-4 my-4 rounded-2xl border border-gold/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-xl flex-shrink-0">
                {user?.avatarSymbol || '🕉️'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-white truncate">{user?.name || 'Aarav Sharma'}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-lightgold/80 font-mono uppercase tracking-wider truncate">
                    {user?.membershipTier || 'Verified Explorer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Client Sidebar" className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-mutedtext/60">
              Astrological Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.path === ROUTES.CLIENT_KUNDLI && currentPath === ROUTES.CLIENT_PLANETARY_ANALYSIS);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'border border-gold/40 bg-gold/15 text-lightgold shadow-md shadow-gold/10 font-semibold'
                      : 'border border-transparent text-mutedtext hover:text-white hover:bg-white/5 hover:border-gold/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-gold' : 'text-mutedtext group-hover:text-lightgold'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-gold/25 text-lightgold border border-gold/40'
                          : 'bg-white/5 text-mutedtext/80 border border-gold/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Public Home Link */}
            <div className="pt-4 mt-4 border-t border-gold/10">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-mutedtext/60">
                General Portals
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-mutedtext hover:text-white hover:bg-white/5 border border-transparent hover:border-gold/15 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-mutedtext group-hover:text-lightgold" />
                  <span>Main Landing Page</span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-lightgold" />
              </button>
            </div>
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="p-4 border-t border-gold/15 bg-black/20">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-mutedtext/70">
                <span className="block text-white font-medium">Lahiri Ayanamsha</span>
                <span className="block text-[10px] text-lightgold/80 font-mono">24° 08&apos; 12&quot;</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-300 hover:text-red-200 transition-all flex items-center gap-1.5 text-xs focus:outline-none"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN APPLICATION VIEWPORT                                 */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col lg:pl-64 xl:pl-72 min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-20 w-full border-b border-gold/15 bg-[#05040B]/85 backdrop-blur-md h-16 sm:h-20">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              {/* Left Side: Mobile Menu Button & Breadcrumb */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(true)}
                  aria-label="Open mobile navigation"
                  className="lg:hidden p-2 rounded-xl text-lightgold hover:text-white hover:bg-white/5 border border-gold/20 transition-colors focus:outline-none"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs font-serif text-mutedtext">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
                    className="hover:text-lightgold transition-colors"
                  >
                    Client Sanctuary
                  </button>
                  <span className="text-gold/40">/</span>
                  <span className="text-white font-semibold capitalize font-sans">{pageTitle}</span>
                </div>

                <div className="sm:hidden font-display text-base font-semibold text-white tracking-wide">
                  {pageTitle}
                </div>
              </div>

              {/* Right Side: Ephemeris Date, Notifications, Profile Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Celestial Date Chip (Desktop) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-white/5 text-xs text-mutedtext">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  <span className="font-serif">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-gold/30">&bull;</span>
                  <span className="text-lightgold text-[11px] font-mono">Shukla Dashami</span>
                </div>

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationOpen((prev) => !prev);
                      setIsProfileMenuOpen(false);
                    }}
                    aria-label="View notifications"
                    className="relative p-2.5 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 text-lightgold hover:text-white transition-all focus:outline-none"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold shadow-sm shadow-gold" />
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gold/25 bg-[#0b0817]/98 backdrop-blur-xl shadow-2xl shadow-purple/20 p-4 z-50 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-gold/15 mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-gold" />
                          <span className="font-display text-sm font-semibold text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-lightgold text-[10px] font-mono">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[11px] text-lightgold/80 hover:text-gold flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="h-3 w-3" />
                            Mark read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all text-left ${
                              item.unread
                                ? 'border-gold/30 bg-gold/5'
                                : 'border-gold/10 bg-white/5 opacity-80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-medium text-xs text-white">{item.title}</span>
                              <span className="text-[10px] text-mutedtext/70 whitespace-nowrap">{item.time}</span>
                            </div>
                            <p className="text-xs text-mutedtext leading-relaxed font-serif">{item.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-wider font-mono text-lightgold/70 px-1.5 py-0.5 rounded bg-white/5 border border-gold/15">
                                {item.category}
                              </span>
                              {item.unread && (
                                <span className="h-1.5 w-1.5 rounded-full bg-gold inline-block" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 mt-3 border-t border-gold/10 text-center">
                        <span className="text-[11px] text-mutedtext/70 font-serif">
                          Illustrative planetary alerts & Vedic transit notifications
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen((prev) => !prev);
                      setIsNotificationOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 hover:border-gold/35 transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-sm">
                      {user?.avatarSymbol || '🕉️'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="block font-medium text-xs text-white leading-tight">
                        {user?.name?.split(' ')[0] || 'Seeker'}
                      </span>
                      <span className="block text-[10px] text-lightgold/80 font-mono capitalize">
                        {role || 'Client'}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-mutedtext hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gold/25 bg-[#0b0817]/98 backdrop-blur-xl shadow-2xl shadow-purple/20 p-4 z-50 animate-fadeIn">
                      <div className="flex items-center gap-3 pb-3 border-b border-gold/15 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-xl">
                          {user?.avatarSymbol || '🕉️'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-white truncate">{user?.name}</div>
                          <div className="text-xs text-mutedtext truncate">{user?.email}</div>
                          <div className="text-[10px] font-mono text-lightgold uppercase mt-0.5">
                            {user?.membershipTier || 'Verified Seeker'}
                          </div>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            navigate(ROUTES.CLIENT_PROFILE);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-mutedtext hover:text-white hover:bg-white/5 transition-all text-left"
                        >
                          <User className="h-4 w-4 text-lightgold" />
                          <span>My Birth Profile & Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            navigate(ROUTES.CLIENT_KUNDLI);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-mutedtext hover:text-white hover:bg-white/5 transition-all text-left"
                        >
                          <Compass className="h-4 w-4 text-lightgold" />
                          <span>View Birth Kundli Chart</span>
                        </button>
                      </div>

                      {/* Quick Role Switcher for Developer Testing */}
                      <div className="mt-3 pt-3 border-t border-gold/15">
                        <span className="block text-[10px] font-mono uppercase text-mutedtext/70 mb-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-gold" />
                          Demo Role Switcher
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              switchRole(ROLES.ASTROLOGER);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-gold/20 bg-white/5 hover:bg-white/10 text-[11px] text-lightgold text-center transition-all"
                          >
                            🔮 Astrologer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              switchRole(ROLES.ADMIN);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-purple/30 bg-white/5 hover:bg-white/10 text-[11px] text-purple-200 text-center transition-all"
                          >
                            🛡️ Admin
                          </button>
                        </div>
                      </div>

                      {/* Logout Action */}
                      <div className="mt-3 pt-3 border-t border-gold/15">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-300 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-all"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Body Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Client Sanctuary Minimal Footer */}
          <footer className="w-full border-t border-gold/10 py-5 text-center text-xs text-mutedtext/70 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>&copy; {new Date().getFullYear()} Veda AI &bull; Ancient Wisdom &bull; Intelligent Insights</p>
              <p className="text-lightgold/70 font-mono text-[11px]">
                Session ID: {user?.id || 'usr-client-01'} &bull; Role: Client
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE SIDEBAR DRAWER OVERLAY                              */}
      {/* ========================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#070510] border-r border-gold/20 shadow-2xl p-5 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
                    <span className="font-display text-base font-bold text-vedabg">V</span>
                  </div>
                  <div>
                    <span className="font-display text-base font-semibold text-white block leading-tight">
                      Veda AI
                    </span>
                    <span className="text-[10px] font-serif text-lightgold uppercase">
                      Client Sanctuary
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-gold/20 text-mutedtext hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile Snippet in Drawer */}
              <div className="p-3.5 rounded-xl border border-gold/20 bg-white/5 mb-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">
                  {user?.avatarSymbol || '🕉️'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-white truncate">{user?.name}</div>
                  <div className="text-[10px] text-lightgold font-mono uppercase">{user?.membershipTier}</div>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <nav aria-label="Mobile Client Navigation" className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.path ||
                    (item.path === ROUTES.CLIENT_KUNDLI && currentPath === ROUTES.CLIENT_PLANETARY_ANALYSIS);

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'border border-gold/40 bg-gold/20 text-lightgold font-semibold'
                          : 'border border-transparent text-mutedtext hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-gold' : 'text-mutedtext'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-lightgold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="pt-4 border-t border-gold/15 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gold/20 bg-white/5 text-xs text-mutedtext hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Return to Landing Page</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLayout;

