import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { navigate } from '../router';

const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', textColor: '', barColor: '' };

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', textColor: 'text-red-400', barColor: 'bg-red-400' };
  }
  if (score <= 3) {
    return { score: 2, label: 'Fair', textColor: 'text-amber-400', barColor: 'bg-amber-400' };
  }
  return { score: 3, label: 'Strong', textColor: 'text-emerald-400', barColor: 'bg-emerald-400' };
};

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const strength = calculatePasswordStrength(password);

  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must accept the Terms of Service and Privacy Policy';
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

    // Simulate registration processing
    setTimeout(() => {
      setIsLoading(false);
      setFeedback({
        type: 'success',
        message: 'Registration details validated successfully! Backend account creation will be connected when backend authentication is implemented.',
      });
    }, 1200);
  };

  const handleGoogleSignUp = () => {
    setFeedback({
      type: 'info',
      message: 'Google OAuth registration will be integrated in an upcoming backend phase.',
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
            Begin Your Journey
          </h1>
          <p className="mt-1.5 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
            Create your Veda AI account to save birth charts and explore personalized Vedic guidance.
          </p>
        </div>

        {/* Feedback Alert Banner */}
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

        {/* Social Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gold/25 bg-white/5 hover:bg-white/10 hover:border-gold/40 text-sm font-medium text-white transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
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
            Or create account with email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-medium text-lightgold/90 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <User className="h-4 w-4" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                }}
                placeholder="Aarav Sharma"
                className={`w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                  errors.fullName
                    ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                    : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address Field */}
          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-medium text-lightgold/90 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="reg-email"
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
            <label
              htmlFor="reg-password"
              className="block text-xs font-medium text-lightgold/90 mb-1.5"
            >
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  if (confirmPassword && e.target.value === confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }
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

            {/* Dynamic Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mutedtext">Password strength:</span>
                  <span className={`font-semibold ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 1 ? strength.barColor : 'bg-white/10'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 2 ? strength.barColor : 'bg-white/10'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength.score >= 3 ? strength.barColor : 'bg-white/10'
                    }`}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="reg-confirm-password"
              className="block text-xs font-medium text-lightgold/90 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }
                }}
                placeholder="••••••••"
                className={`w-full rounded-xl bg-white/5 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                    : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                }`}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-mutedtext hover:text-lightgold transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Terms & Privacy Agreement Checkbox */}
          <div className="pt-1">
            <div className="flex items-start gap-2.5">
              <input
                id="agree-terms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                }}
                className="h-4 w-4 mt-0.5 rounded border-gold/30 bg-white/5 text-gold focus:ring-gold/40 focus:ring-offset-vedabg accent-[#F5B82E]"
              />
              <label htmlFor="agree-terms" className="text-xs text-mutedtext select-none leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="text-lightgold hover:text-gold underline underline-offset-2 decoration-gold/40 hover:decoration-gold transition-colors focus:outline-none"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="text-lightgold hover:text-gold underline underline-offset-2 decoration-gold/40 hover:decoration-gold transition-colors focus:outline-none"
                >
                  Privacy Policy
                </button>
                .
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{errors.agreeTerms}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                <span>Creating your account...</span>
              </>
            ) : (
              <span>Create Veda AI Account</span>
            )}
          </button>
        </form>

        {/* Bottom Login Prompt */}
        <div className="mt-6 pt-5 border-t border-gold/10 text-center text-xs text-mutedtext">
          <p>
            Already have a Veda AI account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-lightgold font-medium hover:text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold transition-colors focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Terms & Privacy Information Modal */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLegalModal(null)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-gold/30 bg-[#0b0817]/95 p-6 shadow-2xl shadow-purple/30 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gold/15">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h3 id="legal-modal-title" className="font-display text-lg font-semibold text-white">
                  {legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded-full p-1 text-mutedtext hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-mutedtext leading-relaxed space-y-3">
              <p>
                {legalModal === 'terms'
                  ? 'Veda AI provides astrological insights, birth chart calculations, and guidance based on classical Vedic Jyotish principles. The platform is designed for personal self-exploration and spiritual guidance.'
                  : 'Your birth details (date, time, and location) are treated with the highest degree of confidentiality. Veda AI never sells or shares your personal chart data with third-party advertisers.'}
              </p>
              <p className="text-lightgold font-medium">
                Official legal documentation is currently being finalized prior to platform general availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="mt-5 w-full rounded-xl py-2.5 px-4 font-semibold text-xs sm:text-sm text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:shadow-gold/40 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
