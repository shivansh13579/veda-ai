import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Sparkles, User, ShieldCheck, ArrowRight } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth, DEMO_PROFILES } from '../context';
import { ROLES, ROLE_DEFAULT_DASHBOARDS } from '../router/routes';
import { navigate } from '../router';

const LoginPage = () => {
  const { login, isAuthenticated, user, role: currentRole, authNotice } = useAuth();

  const [selectedDemoRole, setSelectedDemoRole] = useState(ROLES.CLIENT);
  const [email, setEmail] = useState('aarav@veda.ai');
  const [password, setPassword] = useState('veda1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSelectRole = (targetRole) => {
    setSelectedDemoRole(targetRole);
    const profile = DEMO_PROFILES[targetRole];
    if (profile) {
      setEmail(profile.email);
      setPassword('veda1234');
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate authenticating and login via AuthContext
    setTimeout(() => {
      setIsLoading(false);
      login(selectedDemoRole, { email: email.trim() });
    }, 600);
  };

  const handleQuickDemoLogin = (targetRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(targetRole);
    }, 350);
  };

  const handleGoogleSignIn = () => {
    setFeedback({
      type: 'info',
      message: 'Google OAuth integration will be available in an upcoming phase. Please use the demo credentials below.',
    });
  };

  return (
    <AuthLayout>
      <div className="w-full rounded-3xl border border-gold/30 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-purple/20 animate-fadeIn">
        {/* Header Branding & Greetings */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lightgold to-gold shadow-lg shadow-gold/25 mb-3 border border-lightgold/30">
            <span className="font-display text-xl font-bold text-vedabg">V</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
            Welcome Back
          </h1>
          <p className="mt-1.5 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
            Sign in to access your saved Kundli, transit timelines, and personalized readings.
          </p>
        </div>

        {/* Existing Session Alert (if already logged in) */}
        {isAuthenticated && (
          <div className="mb-5 p-3.5 rounded-xl border border-gold/40 bg-gold/10 text-xs sm:text-sm text-lightgold flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0" />
              <span>
                Already signed in as <strong className="text-white">{user?.name}</strong> ({currentRole}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROLE_DEFAULT_DASHBOARDS[currentRole] || '/dashboard')}
              className="px-2.5 py-1 rounded-lg bg-gold text-vedabg font-semibold text-xs hover:bg-lightgold transition-all whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Auth Notice (e.g. redirected from protected route) */}
        {authNotice && (
          <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{authNotice}</span>
          </div>
        )}

        {/* Feedback Alert Banners */}
        {feedback && (
          <div
            className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-gold/40 bg-gold/10 text-lightgold'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* DEMO QUICK-ACCESS ROLE SELECTOR (Batch 4D Feature) */}
        <div className="mb-6 rounded-2xl border border-gold/25 bg-white/5 p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-lightgold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Demo Role Quick-Login
            </span>
            <span className="text-[10px] text-mutedtext">Select to auto-fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Client Role Option */}
            <button
              type="button"
              onClick={() => handleSelectRole(ROLES.CLIENT)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedDemoRole === ROLES.CLIENT
                  ? 'border-gold bg-gold/20 shadow-md shadow-gold/10'
                  : 'border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-white/10'
              }`}
            >
              <div className="text-base mb-1">🕉️</div>
              <div className="text-xs font-semibold text-white truncate">Client</div>
              <div className="text-[10px] text-mutedtext truncate">Aarav S.</div>
            </button>

            {/* Astrologer Role Option */}
            <button
              type="button"
              onClick={() => handleSelectRole(ROLES.ASTROLOGER)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedDemoRole === ROLES.ASTROLOGER
                  ? 'border-gold bg-gold/20 shadow-md shadow-gold/10'
                  : 'border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-white/10'
              }`}
            >
              <div className="text-base mb-1">🔮</div>
              <div className="text-xs font-semibold text-white truncate">Astrologer</div>
              <div className="text-[10px] text-mutedtext truncate">Dr. Vasudev</div>
            </button>

            {/* Admin Role Option */}
            <button
              type="button"
              onClick={() => handleSelectRole(ROLES.ADMIN)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedDemoRole === ROLES.ADMIN
                  ? 'border-gold bg-gold/20 shadow-md shadow-gold/10'
                  : 'border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-white/10'
              }`}
            >
              <div className="text-base mb-1">🛡️</div>
              <div className="text-xs font-semibold text-white truncate">Admin</div>
              <div className="text-[10px] text-mutedtext truncate">Devika R.</div>
            </button>
          </div>

          {/* Quick One-Click Login Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDemoLogin(selectedDemoRole)}
            className="w-full mt-3 py-2 px-3 rounded-lg border border-gold/30 bg-gold/10 hover:bg-gold/20 text-xs font-medium text-lightgold transition-all flex items-center justify-center gap-1.5"
          >
            <User className="h-3.5 w-3.5" />
            <span>Instant Demo Login as {selectedDemoRole.charAt(0).toUpperCase() + selectedDemoRole.slice(1)}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Social Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gold/25 bg-white/5 hover:bg-white/10 hover:border-gold/40 text-xs sm:text-sm font-medium text-white transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          {/* Authentic Google 'G' Icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Separator Divider */}
        <div className="relative flex items-center justify-center my-5">
          <div className="w-full border-t border-gold/15" />
          <span className="absolute bg-[#0b0817] px-3 text-[11px] font-medium tracking-wider text-mutedtext/70 uppercase">
            Or standard sign in
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-lightgold/90 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="name@example.com"
                className={`w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                  errors.email
                    ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                    : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-lightgold/90"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-lightgold/80 hover:text-gold transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="••••••••"
                className={`w-full rounded-xl bg-white/5 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                  errors.password
                    ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                    : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                }`}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-mutedtext hover:text-lightgold transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gold/30 bg-white/5 text-gold focus:ring-gold/40 focus:ring-offset-vedabg accent-[#F5B82E]"
            />
            <label htmlFor="remember-me" className="text-xs text-mutedtext select-none cursor-pointer">
              Remember me on this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                <span>Validating Credentials...</span>
              </>
            ) : (
              <span>Sign In to Veda AI</span>
            )}
          </button>
        </form>

        {/* Bottom Registration Prompt */}
        <div className="mt-6 pt-5 border-t border-gold/10 text-center text-xs text-mutedtext">
          <p>
            Don&apos;t have a Veda AI account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-lightgold font-medium hover:text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold transition-colors focus:outline-none"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
