import { useState, useRef, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { navigate } from '../router';

const DEMO_OTP = '123456';

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

const ForgotPasswordPage = () => {
  // Step state: 'email' | 'otp' | 'reset' | 'success'
  const [step, setStep] = useState('email');

  // Step 1: Email Form State
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Step 2: OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendNotice, setResendNotice] = useState('');
  const otpInputRefs = useRef([]);

  // Step 3: Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetErrors, setResetErrors] = useState({});
  const [isResetting, setIsResetting] = useState(false);

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  // Focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // ==========================================
  // Step 1 Handlers: Email
  // ==========================================
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSendingCode(true);

    // Simulate network dispatch
    setTimeout(() => {
      setIsSendingCode(false);
      setStep('otp');
      setTimeLeft(60);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
    }, 900);
  };

  // ==========================================
  // Step 2 Handlers: OTP
  // ==========================================
  const handleOtpChange = (index, value) => {
    setOtpError('');
    // Allow only single digits
    const cleanChar = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = cleanChar;
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Navigate backwards on Backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    setOtpError('');
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData) {
      const digits = pastedData.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Focus last filled digit or final box
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setOtpError('');

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code');
      return;
    }

    if (fullCode !== DEMO_OTP) {
      setOtpError(`Invalid code. For this prototype demo, please enter ${DEMO_OTP}`);
      return;
    }

    setIsVerifyingOtp(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setStep('reset');
      setNewPassword('');
      setConfirmPassword('');
      setResetErrors({});
    }, 800);
  };

  const handleResendOtp = () => {
    if (timeLeft > 0) return;

    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendNotice(`A new simulated code has been sent. Use demo code ${DEMO_OTP}.`);
    setTimeout(() => setResendNotice(''), 4000);
    otpInputRefs.current[0]?.focus();
  };

  const handleUseDemoOtp = () => {
    const demoDigits = DEMO_OTP.split('');
    setOtp(demoDigits);
    setOtpError('');
    otpInputRefs.current[5]?.focus();
  };

  // ==========================================
  // Step 3 Handlers: Reset Password
  // ==========================================
  const handleResetSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setResetErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsResetting(true);

    // Simulate password update
    setTimeout(() => {
      setIsResetting(false);
      setStep('success');
    }, 1100);
  };

  return (
    <AuthLayout>
      <div className="w-full rounded-3xl border border-gold/30 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-purple/20 animate-fadeIn">
        {/* ========================================================= */}
        {/* STEP 1: FORGOT PASSWORD (EMAIL INPUT)                    */}
        {/* ========================================================= */}
        {step === 'email' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lightgold to-gold shadow-lg shadow-gold/25 mb-3 border border-lightgold/30">
                <KeyRound className="h-6 w-6 text-vedabg" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Forgot Your Password?
              </h1>
              <p className="mt-1.5 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
                Enter your registered email address and we&apos;ll send a 6-digit verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-medium text-lightgold/90 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSendingCode}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                      emailError
                        ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                        : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingCode}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gold/10 text-center text-xs text-mutedtext">
              <p>
                Remember your password?{' '}
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
        )}

        {/* ========================================================= */}
        {/* STEP 2: 6-DIGIT OTP VERIFICATION                         */}
        {/* ========================================================= */}
        {step === 'otp' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lightgold to-gold shadow-lg shadow-gold/25 mb-3 border border-lightgold/30">
                <Sparkles className="h-6 w-6 text-vedabg" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Verify Your Email
              </h1>
              <p className="mt-1.5 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
                Enter the 6-digit verification code sent to{' '}
                <span className="text-white font-sans font-medium">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="mt-1 text-xs text-lightgold hover:text-gold underline underline-offset-2 transition-colors focus:outline-none"
              >
                Change email address
              </button>
            </div>

            {/* Prototype Demo Code Notice */}
            <div className="mb-5 p-3 rounded-xl border border-gold/30 bg-gold/10 text-xs text-lightgold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gold font-bold">✦</span>
                <span>
                  Demo Prototype: Use code <strong className="text-white font-mono tracking-widest">{DEMO_OTP}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseDemoOtp}
                className="px-2 py-1 rounded bg-gold/20 hover:bg-gold/30 text-white font-semibold text-[11px] transition-colors"
              >
                Auto-fill
              </button>
            </div>

            {resendNotice && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>{resendNotice}</span>
              </div>
            )}

            {/* 6-Digit Inputs Grid */}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-center text-xs font-medium text-lightgold/90 mb-3">
                  Verification Code
                </label>
                <div
                  className="flex items-center justify-center gap-1.5 sm:gap-2.5"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      disabled={isVerifyingOtp}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      aria-label={`Digit ${index + 1} of 6`}
                      className={`w-9 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl bg-white/5 border text-white transition-all focus:outline-none ${
                        otpError
                          ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                          : digit
                          ? 'border-gold text-lightgold bg-gold/5'
                          : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                      }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="mt-2 text-center text-xs text-red-300 flex items-center justify-center gap-1 animate-fadeIn">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              {/* Resend Code Section */}
              <div className="flex items-center justify-center text-xs text-mutedtext">
                {timeLeft > 0 ? (
                  <span>
                    Resend code in <strong className="text-lightgold font-mono">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1.5 text-lightgold hover:text-gold font-medium transition-colors focus:outline-none"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Resend verification code</span>
                  </button>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isVerifyingOtp || otp.join('').length < 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gold/10 text-center text-xs text-mutedtext">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1.5 text-mutedtext hover:text-white transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to email entry</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: RESET PASSWORD                                   */}
        {/* ========================================================= */}
        {step === 'reset' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lightgold to-gold shadow-lg shadow-gold/25 mb-3 border border-lightgold/30">
                <Lock className="h-6 w-6 text-vedabg" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Create New Password
              </h1>
              <p className="mt-1.5 font-serif text-sm sm:text-base text-mutedtext leading-relaxed">
                Your email has been verified. Choose a strong new password for your Veda AI account.
              </p>
            </div>

            {/* Simulated demonstration notice */}
            <div className="mb-5 p-3 rounded-xl border border-gold/30 bg-gold/10 text-xs text-lightgold flex items-center gap-2">
              <span className="text-gold font-bold">✦</span>
              <span>Frontend Demo: No actual account password on a remote server will be modified.</span>
            </div>

            <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-xs font-medium text-lightgold/90 mb-1.5">
                  New Password (min. 8 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isResetting}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (resetErrors.newPassword) {
                        setResetErrors((prev) => ({ ...prev, newPassword: null }));
                      }
                      if (confirmPassword && e.target.value === confirmPassword) {
                        setResetErrors((prev) => ({ ...prev, confirmPassword: null }));
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-white/5 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                      resetErrors.newPassword
                        ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                        : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-mutedtext hover:text-lightgold transition-colors focus:outline-none"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-mutedtext">Password strength:</span>
                      <span className={`font-semibold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.barColor : 'bg-white/10'
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.barColor : 'bg-white/10'
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.barColor : 'bg-white/10'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {resetErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{resetErrors.newPassword}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-medium text-lightgold/90 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mutedtext">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isResetting}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (resetErrors.confirmPassword) {
                        setResetErrors((prev) => ({ ...prev, confirmPassword: null }));
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-white/5 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                      resetErrors.confirmPassword
                        ? 'border-red-400/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                        : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isResetting}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-mutedtext hover:text-lightgold transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-300 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{resetErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: PASSWORD RESET SUCCESS                           */}
        {/* ========================================================= */}
        {step === 'success' && (
          <div className="text-center py-2 animate-fadeIn">
            {/* Success Graphic */}
            <div className="relative mx-auto mb-5 h-16 w-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9 text-vedabg" />
              </div>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-wide mb-2.5">
              Password Reset Flow Completed
            </h1>

            <p className="font-serif text-sm sm:text-base text-mutedtext leading-relaxed max-w-sm mx-auto mb-6">
              Your password recovery verification and reset flow has been successfully demonstrated. You can now return to the login screen.
            </p>

            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 mb-6 text-xs sm:text-sm text-emerald-200 text-left leading-relaxed">
              ✦ <strong className="text-white">Frontend Demo Note:</strong> In production, your new credentials will be encrypted and committed to the secure authentication service.
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <span>Return to Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-mutedtext hover:text-white border border-gold/20 hover:border-gold/40 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
