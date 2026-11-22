/**
 * Dynamic Profile Completion Calculator and Advisory Generator
 * Computes completion metrics based on real input values without hardcoding.
 */

export const calculateProfileCompletion = (profileData = {}) => {
  let score = 0;
  const missingFields = [];
  const warnings = [];

  const fullName = profileData.fullName?.trim() || profileData.name?.trim() || '';
  const displayName = profileData.displayName?.trim() || '';
  const dateOfBirth = profileData.dateOfBirth?.trim() || '';
  const isTimeUnknown = Boolean(profileData.isTimeUnknown);
  const birthTime = profileData.birthTime?.trim() || '';
  const country = profileData.country?.trim() || '';
  const state = profileData.state?.trim() || '';
  const city = profileData.city?.trim() || '';
  const timezone = profileData.timezone?.trim() || '';
  const latitude = profileData.latitude?.toString().trim() || '';
  const longitude = profileData.longitude?.toString().trim() || '';
  const isCoordinatesVerified = Boolean(profileData.isCoordinatesVerified);

  // 1. Full Legal Name (20%)
  if (fullName.length >= 2) {
    score += 20;
  } else {
    missingFields.push({
      field: 'fullName',
      label: 'Full Name',
      severity: 'required',
      advice: 'Required for natal chart personalization and identification.',
    });
  }

  // 2. Date of Birth (20%)
  if (dateOfBirth) {
    score += 20;
  } else {
    missingFields.push({
      field: 'dateOfBirth',
      label: 'Date of Birth',
      severity: 'required',
      advice: 'Mandatory to determine planetary ephemeris longitudes.',
    });
  }

  // 3. Birth Time (25% if exact, 12% if explicitly marked unknown)
  if (!isTimeUnknown && birthTime) {
    score += 25;
  } else if (isTimeUnknown) {
    score += 12;
    warnings.push({
      field: 'birthTime',
      label: 'Approximate Birth Time',
      type: 'warning',
      advice: 'Exact birth time is unknown. Moon chart (Chandra Kundli) is active, but Rising Sign (Lagna) and 12 Bhavas cannot be verified.',
    });
  } else {
    missingFields.push({
      field: 'birthTime',
      label: 'Birth Time',
      severity: 'required',
      advice: 'Required to calculate your Ascendant (Lagna) and D9 Navamsha chart.',
    });
  }

  // 4. Birth Location: Country, State, City (15%)
  if (country && state && city) {
    score += 15;
  } else {
    const locParts = [];
    if (!city) locParts.push('City');
    if (!state) locParts.push('State');
    if (!country) locParts.push('Country');
    missingFields.push({
      field: 'location',
      label: `Birth Location (${locParts.join(', ')})`,
      severity: 'required',
      advice: 'Needed to determine local sidereal sunrise and timezone offset.',
    });
  }

  // 5. Geographic Coordinates (10%)
  if (latitude && longitude) {
    score += 10;
    if (!isCoordinatesVerified) {
      warnings.push({
        field: 'coordinates',
        label: 'Unverified Coordinates',
        type: 'info',
        advice: 'Coordinates are entered manually and marked as pending astronomical verification.',
      });
    }
  } else {
    missingFields.push({
      field: 'coordinates',
      label: 'Geographical Coordinates',
      severity: 'recommended',
      advice: 'Latitude and Longitude yield high precision for house cusps.',
    });
  }

  // 6. Timezone (5%)
  if (timezone) {
    score += 5;
  } else {
    missingFields.push({
      field: 'timezone',
      label: 'Timezone',
      severity: 'required',
      advice: 'Required to convert local civil time to Greenwich Sidereal Time.',
    });
  }

  // 7. Display Name (5%)
  if (displayName) {
    score += 5;
  }

  const completionPercentage = Math.min(100, Math.max(0, score));

  // Determine qualitative status
  let status = 'Incomplete';
  let statusColor = 'text-red-400';
  let badgeBg = 'bg-red-500/10 border-red-500/30';

  if (completionPercentage === 100) {
    status = 'Fully Complete';
    statusColor = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/10 border-emerald-500/30';
  } else if (completionPercentage >= 75) {
    status = 'Sufficient for Primary Kundli';
    statusColor = 'text-lightgold';
    badgeBg = 'bg-gold/10 border-gold/30';
  } else if (completionPercentage >= 40) {
    status = 'Partially Complete';
    statusColor = 'text-amber-300';
    badgeBg = 'bg-amber-500/10 border-amber-500/30';
  }

  return {
    percentage: completionPercentage,
    status,
    statusColor,
    badgeBg,
    missingFields,
    warnings,
  };
};

