import { useState, useMemo } from 'react';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Compass,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Orbit,
  Globe,
  Edit3,
  Loader2,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { POPULAR_LOCATIONS, TIMEZONE_OPTIONS } from '../../data/locationPresets';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';

const STEPS = [
  { id: 1, title: 'Personal Details', description: 'Legal name & nomenclature' },
  { id: 2, title: 'Birth & Location', description: 'Time, place & coordinates' },
  { id: 3, title: 'Review & Verify', description: 'Audit astrological data' },
];

const AYANAMSHA_SYSTEMS = [
  {
    id: 'lahiri',
    label: 'Lahiri (Chitra Paksha)',
    badge: 'Standard Vedic / KP',
    description: 'Most widely endorsed by the Indian Calendar Reform Committee and classical Jyotish acharyas.',
  },
  {
    id: 'raman',
    label: 'B.V. Raman Ayanamsha',
    badge: 'Classical South Indian',
    description: 'Adopted in traditional Bangalore school texts and astrological research publications.',
  },
  {
    id: 'kp',
    label: 'Krishnamurti Paddhati (KP)',
    badge: 'Stellar Astrological',
    description: 'Calibrated for sub-lord planetary cusps and exact event timing techniques.',
  },
];

const BirthProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Active Wizard Step (1, 2, 3, or 'success')
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Form State initialized with existing user details or realistic fallbacks
  const [formData, setFormData] = useState(() => {
    const isUnknown = Boolean(user?.isTimeUnknown);

    // Parse lat/long
    let lat = '';
    let lng = '';
    if (user?.coordinates) {
      const parts = user.coordinates.split(',');
      if (parts.length === 2) {
        lat = parts[0].trim();
        lng = parts[1].trim();
      }
    }

    return {
      fullName: user?.name || 'Aarav Sharma',
      displayName: user?.displayName || 'Aarav',
      gender: user?.gender || 'male',
      dateOfBirth: user?.dateOfBirth ? '1994-10-14' : '1994-10-14',
      birthTime: isUnknown ? '' : (user?.birthTimeRaw || '06:45'),
      isTimeUnknown: isUnknown,
      timeAccuracyNote: user?.timeAccuracyNote || 'Verified from hospital birth certificate',
      country: user?.country || 'India',
      state: user?.state || 'Uttar Pradesh',
      city: user?.city || 'Varanasi',
      latitude: lat || '25.3176° N',
      longitude: lng || '82.9739° E',
      timezone: user?.timezone || 'Asia/Kolkata (IST • UTC +05:30)',
      ayanamsa: user?.ayanamsa || 'Lahiri (Chitra Paksha)',
      isCoordinatesVerified: user?.isCoordinatesVerified ?? true,
      selectedLocationPreset: user?.birthLocation || 'Varanasi, Uttar Pradesh, India',
    };
  });

  const [errors, setErrors] = useState({});

  // Dynamic Profile Completion Metrics
  const completionMetrics = useMemo(() => {
    return calculateProfileCompletion(formData);
  }, [formData]);

  // Filtered preset locations based on search query
  const filteredLocations = useMemo(() => {
    if (!locationSearchQuery.trim()) {
      return POPULAR_LOCATIONS.slice(0, 6);
    }
    const q = locationSearchQuery.toLowerCase();
    return POPULAR_LOCATIONS.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q)
    );
  }, [locationSearchQuery]);

  // Handle Preset Location Selection
  const handleSelectLocationPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      city: preset.city,
      state: preset.state,
      country: preset.country,
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
      ayanamsa: preset.ayanamsa,
      isCoordinatesVerified: true,
      selectedLocationPreset: preset.label,
    }));
    setLocationSearchQuery('');
    // Clear location errors if any
    setErrors((prev) => {
      const next = { ...prev };
      delete next.country;
      delete next.state;
      delete next.city;
      delete next.timezone;
      return next;
    });
  };

  // Validation Rules
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full legal name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }
    }

    if (stepNumber === 2) {
      // Date of birth validation
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const selectedDate = new Date(formData.dateOfBirth);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (isNaN(selectedDate.getTime())) {
          newErrors.dateOfBirth = 'Please enter a valid calendar date';
        } else if (selectedDate > today) {
          newErrors.dateOfBirth = 'Birth date cannot be in the future';
        } else if (selectedDate.getFullYear() < 1900) {
          newErrors.dateOfBirth = 'Birth year must be 1900 or later';
        }
      }

      // Birth time validation
      if (!formData.isTimeUnknown) {
        if (!formData.birthTime) {
          newErrors.birthTime = 'Exact birth time is required, or check "Birth time unknown"';
        } else {
          // Check HH:MM format
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(formData.birthTime)) {
            newErrors.birthTime = 'Please enter a valid time (HH:MM)';
          }
        }
      }

      // Location validation
      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State / Region is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.timezone.trim()) {
        newErrors.timezone = 'Timezone is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(3, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit & Save Demo Profile
  const handleSaveProfile = () => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setIsSaving(true);

    // Format human-friendly birth time
    let formattedTime = 'Unknown / Approximate';
    if (!formData.isTimeUnknown && formData.birthTime) {
      const [hStr, mStr] = formData.birthTime.split(':');
      const h = parseInt(hStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      formattedTime = `${String(formattedH).padStart(2, '0')}:${mStr} ${ampm} (${formData.timezone.split(' ')[1] || 'IST'})`;
    }

    // Format human-friendly date
    let formattedDate = formData.dateOfBirth;
    try {
      const [y, m, d] = formData.dateOfBirth.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      formattedDate = dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      // keep raw date
    }

    const birthLocationFormatted = `${formData.city}, ${formData.state}, ${formData.country}`;
    const coordinatesFormatted = formData.latitude && formData.longitude
      ? `${formData.latitude}, ${formData.longitude}`
      : 'Pending Verification';

    setTimeout(() => {
      // Update AuthContext state and persist in sessionStorage
      updateUser({
        name: formData.fullName.trim(),
        displayName: formData.displayName.trim() || formData.fullName.trim(),
        gender: formData.gender,
        dateOfBirth: formattedDate,
        dateOfBirthRaw: formData.dateOfBirth,
        birthTime: formattedTime,
        birthTimeRaw: formData.birthTime,
        isTimeUnknown: formData.isTimeUnknown,
        timeAccuracyNote: formData.timeAccuracyNote,
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        birthLocation: birthLocationFormatted,
        coordinates: coordinatesFormatted,
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone,
        ayanamsa: formData.ayanamsa,
        isCoordinatesVerified: formData.isCoordinatesVerified,
        profileCompletion: completionMetrics.percentage,
      });

      setIsSaving(false);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  };

  return (
    <ClientLayout pageTitle="Birth Profile">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* ========================================================= */}
        {/* PAGE HEADER & DYNAMIC COMPLETION STATUS                   */}
        {/* ========================================================= */}
        <section aria-label="Profile Setup Overview">
          <div className="rounded-3xl border border-gold/25 bg-gradient-to-r from-[#140d2a]/95 via-[#0b0817]/95 to-[#170c27]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple/15">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-lightgold uppercase tracking-wider mb-3">
                  <Orbit className="h-3.5 w-3.5 text-gold" />
                  <span>Vedic Natal Ephemeris Setup</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  Birth Profile Configuration
                </h1>
                <p className="mt-2 font-serif text-sm sm:text-base text-mutedtext leading-relaxed max-w-xl">
                  Configure your legal nomenclature, birth time accuracy, and geographic coordinates for high-precision sidereal calculations.
                </p>
              </div>

              {/* Dynamic Live Completion Meter */}
              <div className="w-full md:w-auto min-w-[260px] rounded-2xl border border-gold/20 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Dynamic Readiness
                  </span>
                  <span className="font-mono text-xs font-bold text-lightgold">
                    {completionMetrics.percentage}%
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-lightgold via-gold to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionMetrics.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-serif ${completionMetrics.statusColor}`}>
                    {completionMetrics.status}
                  </span>
                  <span className="text-mutedtext/70 font-mono">
                    {completionMetrics.missingFields.length === 0 ? 'All fields set' : `${completionMetrics.missingFields.length} field(s) pending`}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {currentStep !== 'success' && (
              <div className="mt-8 pt-6 border-t border-gold/15">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {STEPS.map((s) => {
                    const isCompleted = currentStep > s.id;
                    const isCurrent = currentStep === s.id;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (s.id < currentStep) {
                            setCurrentStep(s.id);
                          }
                        }}
                        disabled={s.id > currentStep}
                        className={`text-left p-3 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'border-gold bg-gold/15 shadow-md shadow-gold/10'
                            : isCompleted
                            ? 'border-gold/30 bg-white/5 hover:border-gold/50 cursor-pointer'
                            : 'border-white/5 bg-transparent opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                              isCompleted
                                ? 'bg-gold text-vedabg'
                                : isCurrent
                                ? 'border border-gold text-lightgold bg-gold/20'
                                : 'border border-mutedtext/40 text-mutedtext'
                            }`}
                          >
                            {isCompleted ? '✓' : s.id}
                          </span>
                          <span className="text-xs font-semibold text-white truncate hidden sm:inline">
                            Step {s.id}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-lightgold truncate">{s.title}</div>
                        <div className="text-[10px] text-mutedtext/70 truncate hidden md:block">
                          {s.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* STEP 1: PERSONAL DETAILS FORM                             */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <section aria-label="Step 1: Personal Details" className="animate-fadeIn">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10">
              <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-6">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-gold" />
                    <span>Personal Details</span>
                  </h2>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Step 1 of 3: Provide your civil nomenclature for astrological certification
                  </p>
                </div>
                <span className="text-xs font-mono text-lightgold/80 bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                  Required Fields
                </span>
              </div>

              <div className="space-y-5">
                {/* Full Legal Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-lightgold mb-1.5">
                    Full Legal Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                    }}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mutedtext/40 border transition-all focus:outline-none ${
                      errors.fullName
                        ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
                        : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                    }`}
                  />
                  {errors.fullName ? (
                    <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-mutedtext/70 font-serif">
                      Your legal name as it appears on birth documents. Used for formal chart title.
                    </p>
                  )}
                </div>

                {/* Display / Spiritual Name */}
                <div>
                  <label htmlFor="displayName" className="block text-xs font-medium text-lightgold mb-1.5">
                    Preferred Display Name <span className="text-mutedtext/60 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g. Aarav"
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mutedtext/40 border border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-mutedtext/70 font-serif">
                    How you prefer Veda AI to address you in conversational consultations.
                  </p>
                </div>

                {/* Gender / Vedic Category */}
                <div>
                  <label className="block text-xs font-medium text-lightgold mb-1.5">
                    Gender Alignment for Kundli Milan & Remedies <span className="text-mutedtext/60 font-normal">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'male', label: 'Male (Purusha)', icon: '♂' },
                      { id: 'female', label: 'Female (Stree)', icon: '♀' },
                      { id: 'other', label: 'Non-Binary / Private', icon: '✦' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g.id }))}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          formData.gender === g.id
                            ? 'border-gold bg-gold/20 text-white font-semibold shadow-sm shadow-gold/10'
                            : 'border-gold/15 bg-white/5 text-mutedtext hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base text-gold font-bold">{g.icon}</span>
                        <span className="text-xs">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="mt-8 pt-5 border-t border-gold/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
                  className="px-4 py-2.5 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 text-xs text-mutedtext hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Continue to Birth Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* STEP 2: BIRTH DETAILS & COORDINATES                       */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <section aria-label="Step 2: Birth Details" className="animate-fadeIn">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10">
              <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-6">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gold" />
                    <span>Birth Details & Astronomical Coordinates</span>
                  </h2>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Step 2 of 3: Enter date, time precision, and geographical coordinates
                  </p>
                </div>
                <span className="text-xs font-mono text-lightgold/80 bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                  Critical for Lagna
                </span>
              </div>

              <div className="space-y-6">
                {/* Date of Birth & Exact Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dob" className="block text-xs font-medium text-lightgold mb-1.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      <span>Date of Birth</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="dob"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }));
                        if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: null }));
                      }}
                      className={`w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border transition-all focus:outline-none ${
                        errors.dateOfBirth
                          ? 'border-red-400 focus:ring-1 focus:ring-red-400/50'
                          : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{errors.dateOfBirth}</span>
                      </p>
                    )}
                  </div>

                  {/* Exact Birth Time */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="birthTime" className="text-xs font-medium text-lightgold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gold" />
                        <span>Exact Birth Time</span>
                        {!formData.isTimeUnknown && <span className="text-red-400">*</span>}
                      </label>
                    </div>

                    <input
                      id="birthTime"
                      type="time"
                      disabled={formData.isTimeUnknown}
                      value={formData.birthTime}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, birthTime: e.target.value }));
                        if (errors.birthTime) setErrors((prev) => ({ ...prev, birthTime: null }));
                      }}
                      className={`w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                        errors.birthTime
                          ? 'border-red-400 focus:ring-1 focus:ring-red-400/50'
                          : 'border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50'
                      }`}
                    />
                    {errors.birthTime && (
                      <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{errors.birthTime}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Unknown Birth Time Checkbox & Astrological Notice */}
                <div className="rounded-2xl border border-gold/20 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      id="isTimeUnknown"
                      type="checkbox"
                      checked={formData.isTimeUnknown}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isTimeUnknown: checked,
                          birthTime: checked ? '' : prev.birthTime,
                        }));
                        if (checked && errors.birthTime) {
                          setErrors((prev) => ({ ...prev, birthTime: null }));
                        }
                      }}
                      className="h-4 w-4 rounded border-gold/30 bg-white/5 text-gold focus:ring-gold/40 accent-[#F5B82E]"
                    />
                    <label htmlFor="isTimeUnknown" className="text-xs font-medium text-white cursor-pointer select-none">
                      Birth time unknown or approximate (Within a few hours)
                    </label>
                  </div>

                  {formData.isTimeUnknown ? (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 leading-relaxed font-serif animate-fadeIn">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block font-sans text-xs mb-0.5">
                            Astrological Implication of Unknown Birth Time:
                          </strong>
                          Without minute-exact birth time, your <strong>Ascendant (Lagna)</strong>, 12 Bhava cusp boundaries, and divisional charts (such as <strong>D9 Navamsha</strong>) cannot be verified. However, your <strong>Moon Sign (Chandra Kundli)</strong>, planetary degrees, and major Gochara transits remain fully functional.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-mutedtext/70 font-serif">
                      Tip: Ascendant degrees shift every 4 minutes. A certified birth time unlocks exact D1 and D9 divisional accuracy.
                    </p>
                  )}
                </div>

                {/* Location Selection & Astronomical Preset Explorer */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-medium text-lightgold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gold" />
                        <span>Birth Place Selection</span>
                        <span className="text-red-400">*</span>
                      </label>
                      <p className="text-[11px] text-mutedtext font-serif">
                        Select a calibrated sidereal city preset or enter custom coordinates below.
                      </p>
                    </div>

                    {/* Calibrated verification chip */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      {formData.isCoordinatesVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          Calibrated Ephemeris Node
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <AlertTriangle className="h-3 w-3" />
                          Pending Astronomical Verification
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Search Box */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mutedtext pointer-events-none" />
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      placeholder="Search calibrated cities (e.g., Varanasi, Ujjain, London, New York)..."
                      className="w-full rounded-xl bg-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-mutedtext/40 border border-gold/25 focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all focus:outline-none"
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredLocations.map((loc) => {
                      const isSelected = formData.city === loc.city && formData.country === loc.country;
                      return (
                        <button
                          key={loc.label}
                          type="button"
                          onClick={() => handleSelectLocationPreset(loc)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-gold bg-gold/20 text-white font-semibold shadow-sm shadow-gold/10'
                              : 'border-gold/15 bg-white/5 text-mutedtext hover:text-white hover:bg-white/10 hover:border-gold/30'
                          }`}
                        >
                          <div className="text-xs text-white truncate flex items-center justify-between">
                            <span>{loc.city}</span>
                            {loc.isVerified && <span className="text-[10px] text-emerald-400">✓</span>}
                          </div>
                          <div className="text-[10px] text-lightgold/80 font-serif truncate">
                            {loc.state}, {loc.country}
                          </div>
                          <div className="text-[9px] text-mutedtext/60 font-mono mt-0.5 truncate">
                            {loc.latitude}, {loc.longitude}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual Fields: City, State, Country */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                            isCoordinatesVerified: false, // Custom entry needs verification
                          }));
                          if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
                        }}
                        className={`w-full rounded-xl bg-white/5 px-3.5 py-2 text-xs text-white border transition-all focus:outline-none ${
                          errors.city ? 'border-red-400' : 'border-gold/25 focus:border-gold'
                        }`}
                      />
                      {errors.city && <p className="text-[10px] text-red-300 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        State / Region <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, state: e.target.value }));
                          if (errors.state) setErrors((prev) => ({ ...prev, state: null }));
                        }}
                        className={`w-full rounded-xl bg-white/5 px-3.5 py-2 text-xs text-white border transition-all focus:outline-none ${
                          errors.state ? 'border-red-400' : 'border-gold/25 focus:border-gold'
                        }`}
                      />
                      {errors.state && <p className="text-[10px] text-red-300 mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, country: e.target.value }));
                          if (errors.country) setErrors((prev) => ({ ...prev, country: null }));
                        }}
                        className={`w-full rounded-xl bg-white/5 px-3.5 py-2 text-xs text-white border transition-all focus:outline-none ${
                          errors.country ? 'border-red-400' : 'border-gold/25 focus:border-gold'
                        }`}
                      />
                      {errors.country && <p className="text-[10px] text-red-300 mt-1">{errors.country}</p>}
                    </div>
                  </div>

                  {/* Coordinates & Timezone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="latitude" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        Latitude
                      </label>
                      <input
                        id="latitude"
                        type="text"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            latitude: e.target.value,
                            isCoordinatesVerified: false,
                          }))
                        }
                        placeholder="e.g. 25.3176° N"
                        className="w-full rounded-xl bg-white/5 px-3.5 py-2 text-xs text-white border border-gold/25 focus:border-gold transition-all focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="longitude" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        Longitude
                      </label>
                      <input
                        id="longitude"
                        type="text"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            longitude: e.target.value,
                            isCoordinatesVerified: false,
                          }))
                        }
                        placeholder="e.g. 82.9739° E"
                        className="w-full rounded-xl bg-white/5 px-3.5 py-2 text-xs text-white border border-gold/25 focus:border-gold transition-all focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-[11px] font-mono uppercase text-mutedtext mb-1">
                        Timezone <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, timezone: e.target.value }));
                          if (errors.timezone) setErrors((prev) => ({ ...prev, timezone: null }));
                        }}
                        className="w-full rounded-xl bg-[#0b0817] px-3.5 py-2 text-xs text-white border border-gold/25 focus:border-gold transition-all focus:outline-none"
                      >
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <option key={tz} value={tz} className="bg-[#0b0817] text-white">
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ayanamsha Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-lightgold mb-2 flex items-center gap-1.5">
                    <Orbit className="h-3.5 w-3.5 text-gold" />
                    <span>Ayanamsha System</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AYANAMSHA_SYSTEMS.map((sys) => {
                      const isSelected = formData.ayanamsa.includes(sys.label.split(' ')[0]);
                      return (
                        <div
                          key={sys.id}
                          onClick={() => setFormData((prev) => ({ ...prev, ayanamsa: sys.label }))}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-gold bg-gold/15 shadow-sm shadow-gold/10'
                              : 'border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-white">{sys.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gold/10 text-lightgold border border-gold/20">
                              {sys.badge}
                            </span>
                          </div>
                          <p className="text-[11px] font-serif text-mutedtext leading-relaxed">
                            {sys.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="mt-8 pt-5 border-t border-gold/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 text-xs text-mutedtext hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Personal</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Review & Verification</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* STEP 3: REVIEW & CONFIRMATION                             */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <section aria-label="Step 3: Review and Verify" className="animate-fadeIn">
            <div className="rounded-3xl border border-gold/20 bg-[#0b0817]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple/10">
              <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-6">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    <span>Review Astrological Data</span>
                  </h2>
                  <p className="text-xs font-serif text-mutedtext mt-0.5">
                    Step 3 of 3: Confirm all parameters prior to generating sidereal charts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    {completionMetrics.percentage}% Ready
                  </span>
                </div>
              </div>

              {/* Data Verification Overview Cards */}
              <div className="space-y-5">
                {/* Section 1: Nomenclature Card */}
                <div className="rounded-2xl border border-gold/15 bg-white/5 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gold/10 mb-3">
                    <span className="text-xs font-semibold text-lightgold uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gold" />
                      1. Nomenclature & Identity
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-lightgold hover:text-white flex items-center gap-1 font-serif underline underline-offset-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Legal Name:</span>
                      <span className="font-semibold text-white text-sm">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Display / Spiritual Name:</span>
                      <span className="font-medium text-white">{formData.displayName || 'Same as Legal'}</span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Gender Context:</span>
                      <span className="capitalize text-white font-medium">{formData.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Temporal Coordinates Card */}
                <div className="rounded-2xl border border-gold/15 bg-white/5 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gold/10 mb-3">
                    <span className="text-xs font-semibold text-lightgold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      2. Temporal Birth Coordinates
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-lightgold hover:text-white flex items-center gap-1 font-serif underline underline-offset-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Date of Birth:</span>
                      <span className="font-semibold text-white text-sm">{formData.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Exact Birth Time:</span>
                      {formData.isTimeUnknown ? (
                        <span className="text-amber-300 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Unknown / Approximate
                        </span>
                      ) : (
                        <span className="font-semibold text-white text-sm">{formData.birthTime}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Time Precision Status:</span>
                      <span className="text-emerald-300 font-mono text-[11px]">
                        {formData.isTimeUnknown ? 'Moon Chart Level' : 'Lagna Degree Exact'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Spatial & Ephemeris Coordinates Card */}
                <div className="rounded-2xl border border-gold/15 bg-white/5 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gold/10 mb-3">
                    <span className="text-xs font-semibold text-lightgold uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      3. Spatial Ephemeris Coordinates
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-lightgold hover:text-white flex items-center gap-1 font-serif underline underline-offset-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Birth Location:</span>
                      <span className="font-medium text-white">{formData.city}, {formData.state}</span>
                      <span className="text-[10px] text-mutedtext block">{formData.country}</span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Coordinates:</span>
                      <span className="font-mono text-white text-xs">
                        {formData.latitude || 'N/A'}, {formData.longitude || 'N/A'}
                      </span>
                      <span className="block mt-0.5">
                        {formData.isCoordinatesVerified ? (
                          <span className="text-[10px] text-emerald-400">Calibrated Reference</span>
                        ) : (
                          <span className="text-[10px] text-amber-300">Pending Verification</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Standard Timezone:</span>
                      <span className="font-medium text-white truncate block">{formData.timezone}</span>
                    </div>
                    <div>
                      <span className="text-mutedtext/70 block mb-0.5">Ayanamsha System:</span>
                      <span className="font-medium text-lightgold truncate block">{formData.ayanamsa}</span>
                    </div>
                  </div>
                </div>

                {/* Astrological Verification Notice */}
                <div className="p-4 rounded-2xl border border-gold/20 bg-gold/5 flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-mutedtext leading-relaxed font-serif">
                    <strong className="text-white font-sans block mb-0.5">Astronomical Calibration Principle:</strong>
                    Veda AI uses the Indian Standard Sidereal ephemeris to calculate Bhavas from local sidereal time (LST). Submitting this profile updates your active session and recalculates your astrological readiness score.
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="mt-8 pt-5 border-t border-gold/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-gold/20 bg-white/5 hover:bg-white/10 text-xs text-mutedtext hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Birth Details</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-2 rounded-xl py-3 px-7 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-vedabg" />
                      <span>Saving Natal Ephemeris...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-vedabg" />
                      <span>Save & Apply Birth Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION VIEW                                 */}
        {/* ========================================================= */}
        {currentStep === 'success' && (
          <section aria-label="Profile Saved Confirmation" className="animate-fadeIn">
            <div className="rounded-3xl border border-emerald-500/30 bg-[#0b0817]/95 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl shadow-purple/20">
              <div className="max-w-lg mx-auto space-y-5">
                {/* Success Icon */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
                  <div className="relative h-16 w-16 rounded-full border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-serif text-emerald-300 uppercase tracking-wider">
                  <span>Profile Successfully Synchronized</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  Birth Profile Updated
                </h2>

                <p className="font-serif text-sm text-mutedtext leading-relaxed">
                  Your civil nomenclature, temporal parameters, and sidereal coordinates have been saved locally into your session state.
                </p>

                {/* Score Confirmation Pill */}
                <div className="p-4 rounded-2xl border border-gold/20 bg-white/5 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-mutedtext">Updated Legal Name:</span>
                    <span className="font-semibold text-white">{formData.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-mutedtext">Birth Coordinates:</span>
                    <span className="font-mono text-lightgold">{formData.city}, {formData.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-mutedtext">Astrological Completion:</span>
                    <span className="font-mono font-bold text-emerald-400">{completionMetrics.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-mutedtext">Ephemeris Calibration:</span>
                    <span className="text-lightgold font-mono">{formData.ayanamsa}</span>
                  </div>
                </div>

                {/* Quick Next Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.CLIENT_KUNDLI)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-xs font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Compass className="h-4 w-4" />
                    <span>View Birth Kundli Chart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-xs font-medium text-lightgold border border-gold/30 bg-gold/10 hover:bg-gold/20 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to Dashboard</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-mutedtext hover:text-white underline underline-offset-4 transition-colors font-serif"
                  >
                    Edit birth details again
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </ClientLayout>
  );
};

export default BirthProfilePage;
