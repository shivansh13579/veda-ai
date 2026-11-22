/**
 * Structured Mock Dataset for Personalized Predictions & Transit Engine
 * Strictly sample data for educational and architectural display.
 * Designed to mirror future backend API schemas.
 */

export const VIMSHOTTARI_DASHA_DATA = {
  activeMahadasha: {
    planet: 'Jupiter (Guru)',
    glyph: '♃',
    totalYears: 16,
    startDate: '14 Nov 2015',
    endDate: '14 Nov 2031',
    progressPercentage: 68,
    primaryTheme: 'Wisdom, Dharma, Career Expansion & Knowledge Synthesis',
    overview:
      'The 16-year Jupiter (Guru) Mahadasha is characterized by philosophical maturation, moral grounding, and institutional elevation. Guru expands the native’s intellectual horizon, brings spiritual guides into life, and fosters long-term prosperity through ethical perseverance.',
  },
  activeAntardasha: {
    planet: 'Saturn (Shani)',
    glyph: '♄',
    parentMahadasha: 'Jupiter (Guru)',
    startDate: '18 Nov 2024',
    endDate: '28 May 2027',
    progressPercentage: 42,
    primaryTheme: 'Discipline, Karmic Balance & Professional Stabilization',
    overview:
      'The Guru-Shani sub-period represents a harmonious tension between idealist expansion (Jupiter) and structural realism (Saturn). While Jupiter envisions future growth, Saturn insists upon methodical execution, legal compliance, and daily discipline. Endeavors commenced with patient groundwork achieve durable stability.',
    keyGuidance: [
      'Prioritize structured, long-range career milestones over speculative shortcuts.',
      'Maintain accountability in financial contracts and avoid hasty oral agreements.',
      'Cultivate physical stamina and spinal ergonomics through yogic stretches.',
    ],
  },
  antardashaSequence: [
    {
      planet: 'Jupiter - Jupiter',
      startYear: '2015',
      endYear: '2018',
      status: 'completed',
      badge: 'Completed',
    },
    {
      planet: 'Jupiter - Saturn',
      startYear: 'Nov 2024',
      endYear: 'May 2027',
      status: 'active',
      badge: 'Current Sub-Period',
      isCurrent: true,
    },
    {
      planet: 'Jupiter - Mercury',
      startYear: 'May 2027',
      endYear: 'Sep 2029',
      status: 'upcoming',
      badge: 'Next Period',
    },
    {
      planet: 'Jupiter - Ketu',
      startYear: 'Sep 2029',
      endYear: 'Aug 2030',
      status: 'upcoming',
      badge: 'Upcoming',
    },
    {
      planet: 'Jupiter - Venus',
      startYear: 'Aug 2030',
      endYear: 'Apr 2033',
      status: 'upcoming',
      badge: 'Upcoming',
    },
  ],
  mahadashaTimeline: [
    { planet: 'Rahu (North Node)', years: 18, span: '1997 – 2015', status: 'completed' },
    { planet: 'Jupiter (Guru)', years: 16, span: '2015 – 2031', status: 'active', isCurrent: true },
    { planet: 'Saturn (Shani)', years: 19, span: '2031 – 2050', status: 'upcoming' },
    { planet: 'Mercury (Budha)', years: 17, span: '2050 – 2067', status: 'upcoming' },
    { planet: 'Ketu (South Node)', years: 7, span: '2067 – 2074', status: 'upcoming' },
  ],
};

export const GOCHARA_TRANSITS_DATA = [
  {
    id: 'transit-saturn',
    planet: 'Saturn (Shani)',
    glyph: '♄',
    motion: 'Direct',
    currentSign: 'Pisces (Meena)',
    degree: '18° 42\'',
    natalHouse: '6th House (Ari Bhava)',
    effectiveRange: 'Nov 2026 – Feb 2027',
    resonance: 'Favorable Upachaya',
    tag: 'Major Transit',
    summary:
      'Shani stations direct in the 6th house of service and obstacles, conferring tenacity against workplace competition and reinforcing physical immunity.',
    influence:
      'Saturn in the 6th house is an auspicious Upachaya placement in classical Vedic texts. It grants victory over pending disputes, stabilizes daily work schedules, and rewards systematic labor.',
    keyFocus: 'Debt elimination, immune resilience, workplace mastery',
  },
  {
    id: 'transit-jupiter',
    planet: 'Jupiter (Guru)',
    glyph: '♃',
    motion: 'Retrograde (Vakra)',
    currentSign: 'Taurus (Vrishabha)',
    degree: '14° 10\'',
    natalHouse: '8th House (Ayur Bhava)',
    effectiveRange: 'Dec 2026 – Apr 2027',
    resonance: 'Introspective / Occult',
    tag: 'Planetary Shift',
    summary:
      'Guru retrogrades through the 8th house, turning expansive philosophical energy inward toward research, unearned resources, and esoteric learning.',
    influence:
      'Favorable window for reviewing ancestral inheritance, tax optimization, and meditation on life transformations. Guard against over-optimism in joint financial ventures.',
    keyFocus: 'Research, legacy planning, spiritual contemplation',
  },
  {
    id: 'transit-rahu',
    planet: 'Rahu (North Node)',
    glyph: '☊',
    motion: 'Retrograde (True Node)',
    currentSign: 'Pisces (Meena)',
    degree: '04° 18\'',
    natalHouse: '6th House (Service & Debts)',
    effectiveRange: 'Ongoing through 2026',
    resonance: 'Strategic Ambition',
    tag: 'Nodal Shift',
    summary:
      'Nodal axis in 6th house fuels unconventional problem-solving abilities and ambitious foreign collaborations in competitive arenas.',
    influence:
      'Heightened analytical instincts; favorable for handling technical litigation or overseas business disputes. Requires mindful avoidance of impulsive work commitments.',
    keyFocus: 'Strategic negotiation, foreign clients, boundary setting',
  },
  {
    id: 'transit-sun',
    planet: 'Sun (Surya)',
    glyph: '☉',
    motion: 'Direct Ingress',
    currentSign: 'Sagittarius (Dhanu)',
    degree: '01° 00\'',
    natalHouse: '9th House (Dharma Bhava)',
    effectiveRange: '16 Dec 2026 – 14 Jan 2027',
    resonance: 'Solar Illumination',
    tag: 'Dhanu Sankranti',
    summary:
      'Surya enters the 9th house of Dharma and higher guidance, bringing solar vitality to spiritual pursuits, legal clarity, and relations with father figures.',
    influence:
      'A month of righteous renewal, auspicious for embarking on pilgrimages, publishing research, or formalizing mentor alliances.',
    keyFocus: 'Higher learning, ethical guidance, spiritual pilgrimage',
  },
];

export const PREDICTIONS_DATA = [
  // CAREER CATEGORY
  {
    id: 'pred-career-01',
    category: 'career',
    categoryLabel: 'Career & Vocation',
    title: 'Strategic Leadership Transition & Institutional Stabilization',
    timeframe: 'Q4 2026 – Q2 2027',
    resonanceBadge: 'High Astrological Resonance',
    resonanceType: 'positive',
    summary:
      'Saturn stationing direct in your 6th house while Jupiter governs your 10th house creates prime conditions for organizational recognition and durable leadership.',
    relevantPlanets: ['Jupiter (Guru)', 'Saturn (Shani)', 'Sun (Surya)'],
    relevantHouses: ['10th House (Karma)', '6th House (Service)', '1st House (Self)'],
    supportingFactors: [
      'Active Jupiter Mahadasha lord aspecting Karma Bhava',
      'Saturn direct transit in 6th house dissolving peer friction',
      'Solar ingress into 9th house empowering mentor sponsorships',
    ],
    detailedInterpretation:
      'During this phase, professional recognition is achieved not through hasty speculation, but through structured reliability. Saturn in the 6th house rewards natives who handle complex institutional backlog with quiet competence. If you have been preparing for an executive credential or higher administrative responsibility, the planetary currents support formalizing that elevation between January and April 2027.',
    remedialAction:
      'Recite the Aditya Hridaya Stotra on Sundays; offer yellow flowers to Guru on Thursdays.',
    disclaimer:
      'Astrological transit forecasts reflect cosmic archetype tendencies and do not guarantee specific corporate promotion or contract execution.',
    saved: true,
  },
  {
    id: 'pred-career-02',
    category: 'career',
    categoryLabel: 'Career & Vocation',
    title: 'Navigating Cross-Functional Delegation & Technical Backlog',
    timeframe: 'Dec 2026 – Feb 2027',
    resonanceBadge: 'Moderate Alignment / Patience Required',
    resonanceType: 'neutral',
    summary:
      'Jupiter retrograde in the 8th house suggests taking time to audit existing operational protocols rather than initiating hasty corporate reorganizations.',
    relevantPlanets: ['Jupiter (Guru)', 'Mercury (Budha)'],
    relevantHouses: ['8th House (Transformation)', '10th House (Karma)'],
    supportingFactors: [
      'Guru Vakra station in 8th house emphasizing procedural review',
      'Mercury rising in 1st house supporting articulate internal memos',
    ],
    detailedInterpretation:
      'Rethink legacy technical debt and operational dependencies. Colleagues will respond best to documented standard operating procedures rather than spontaneous mandates. Take this window to streamline workflow bottlenecks before pushing for product launches.',
    remedialAction:
      'Practice silence for 20 minutes before morning meetings; feed birds green grains on Wednesdays.',
    disclaimer:
      'Informational guidance intended to promote reflective workplace mindfulness, not managerial dictate.',
    saved: false,
  },

  // FINANCE CATEGORY
  {
    id: 'pred-finance-01',
    category: 'finance',
    categoryLabel: 'Finance & Wealth',
    title: 'Wealth Consolidation & Prudent Asset Restructuring',
    timeframe: 'Nov 2026 – May 2027',
    resonanceBadge: 'Favorable Wealth Alignment',
    resonanceType: 'positive',
    summary:
      'Jupiter residing in your natal 2nd house of accumulated wealth (Dhana Bhava) provides sustained support for debt retirement and conservative capital preservation.',
    relevantPlanets: ['Jupiter (Guru)', 'Venus (Shukra)'],
    relevantHouses: ['2nd House (Dhana)', '11th House (Labha)'],
    supportingFactors: [
      '2nd house Guru preserving core liquid reserves',
      'Venus occupying 11th house of gains generating secondary income flows',
    ],
    detailedInterpretation:
      'This period strongly favors conservative capital consolidation over volatile speculative markets. Focus on extinguishing high-interest obligations and anchoring surplus liquidity into sovereign or fixed-yield structures. Collaborative family ventures benefit from transparent balance sheet reviews.',
    remedialAction:
      'Maintain an unbroken budget ledger; donate to educational charities on Shukla Paksha Thursdays.',
    disclaimer:
      'Veda AI does not provide financial, investment, tax, or legal advice. Consult certified financial advisors before financial transactions.',
    saved: true,
  },
  {
    id: 'pred-finance-02',
    category: 'finance',
    categoryLabel: 'Finance & Wealth',
    title: 'Joint Venture & Shared Asset Audit Window',
    timeframe: 'Dec 2026 – Jan 2027',
    resonanceBadge: 'Cautionary Advisory',
    resonanceType: 'caution',
    summary:
      'Transiting Jupiter in the 8th house calls for strict scrutiny of insurance terms, joint bank agreements, and estate documentation.',
    relevantPlanets: ['Jupiter (Guru)', 'Saturn (Shani)'],
    relevantHouses: ['8th House (Shared Assets)', '6th House (Debts)'],
    supportingFactors: [
      'Jupiter retrograde in 8th house urging contract verification',
      'Saturn 6th house transit helping identify hidden recurring subscriptions',
    ],
    detailedInterpretation:
      'Do not rush into speculative syndicates or unverified joint investments. Ensure tax filings and partnership terms are formally notarized. A disciplined audit conducted now prevents unexpected fiscal audits in late 2027.',
    remedialAction:
      'Light a sesame lamp for Shani on Saturday evenings; avoid borrowing on Tuesdays.',
    disclaimer:
      'Strictly sample astrological interpretation. Never base investment, banking, or tax decisions upon astrology.',
    saved: false,
  },

  // RELATIONSHIPS CATEGORY
  {
    id: 'pred-relationships-01',
    category: 'relationships',
    categoryLabel: 'Love & Relationships',
    title: 'Maturation of Partnerships & Reaffirming Commitments',
    timeframe: 'Q4 2026 – Q1 2027',
    resonanceBadge: 'Harmonious Partnership Window',
    resonanceType: 'positive',
    summary:
      'Venus in 11th house forming harmonious trine aspects encourages mature, value-aligned conversations with spouse and close companions.',
    relevantPlanets: ['Venus (Shukra)', 'Saturn (Shani)', 'Moon (Chandra)'],
    relevantHouses: ['7th House (Kalatra)', '11th House (Friendship)', '4th House (Home)'],
    supportingFactors: [
      'Lagna lord Venus in 11th house promoting social mutual respect',
      'Chandra in 4th house anchoring emotional loyalty and domestic peace',
    ],
    detailedInterpretation:
      'Emotional maturity takes precedence over transient infatuation. Partners who coordinate life goals, domestic purchases, and long-term travel plans find mutual respect deepening. For unmarried seekers, alliances formed through mutual professional or intellectual circles have favorable longevity.',
    remedialAction:
      'Observe peace during sunset hours; offer white sweets to young children on Fridays.',
    disclaimer:
      'Reflective astrological counsel for relationship harmony; not psychological counseling or marital therapy.',
    saved: false,
  },

  // HEALTH CATEGORY
  {
    id: 'pred-health-01',
    category: 'health',
    categoryLabel: 'Health & Vitality',
    title: 'Strengthening Digestive Fire (Agni) & Skeletal Alignment',
    timeframe: 'Nov 2026 – Mar 2027',
    resonanceBadge: 'Disciplined Regimen Advised',
    resonanceType: 'neutral',
    summary:
      'Saturn direct in the 6th house provides sustained endurance for structured fitness, but requires mindful attention to spine and joint flexibility.',
    relevantPlanets: ['Saturn (Shani)', 'Mars (Mangala)', 'Sun (Surya)'],
    relevantHouses: ['1st House (Vitality)', '6th House (Physiology)'],
    supportingFactors: [
      'Saturn transiting 6th house rewarding disciplined lifestyle protocols',
      'Sun occupying 12th house suggesting periodic mental retreat',
    ],
    detailedInterpretation:
      'A structured routine—consistent wake times, balanced seasonal dietary intake, and daily low-impact spinal stretches—yields disproportionate vitality benefits. Avoid irregular late-night meals to maintain optimal digestive equilibrium (Jatharagni).',
    remedialAction:
      'Practice Surya Namaskar in morning light; consume warm water and ginger tea.',
    disclaimer:
      'Medical disclaimer: Astrology is never a substitute for medical diagnosis, therapy, or treatment. Consult licensed medical professionals for health concerns.',
    saved: true,
  },

  // EDUCATION CATEGORY
  {
    id: 'pred-education-01',
    category: 'education',
    categoryLabel: 'Education & Higher Growth',
    title: 'Vedic Philosophy, Analytical Research & Mentor Immersion',
    timeframe: 'Dec 2026 – May 2027',
    resonanceBadge: 'Peak Scholarly Resonance',
    resonanceType: 'positive',
    summary:
      'Sun entering the 9th house of Dharma combined with Jupiter Mahadasha unlocks high receptivity for advanced scholarly research and classical texts.',
    relevantPlanets: ['Sun (Surya)', 'Jupiter (Guru)', 'Mercury (Budha)'],
    relevantHouses: ['9th House (Dharma & Gurus)', '5th House (Intellect)', '1st House (Cognition)'],
    supportingFactors: [
      'Solar transit illuminating the 9th house of higher wisdom',
      'Mercury placed in 1st house sharpening analytical writing',
      'Jupiter Mahadasha Karaka for scholarly initiation',
    ],
    detailedInterpretation:
      'An exceptional window for academic enrollment, scriptural study, technical certification, and deep writing. Interactions with seasoned teachers and academic mentors yield career-defining clarity. Commit to structured reading schedules.',
    remedialAction:
      'Recite the Saraswati Vandana before study sessions; donate notebooks to underprivileged students.',
    disclaimer:
      'Educational guidance based on classical Jyotish archetypes. Examination results depend entirely upon personal effort and institutional rigor.',
    saved: false,
  },
];

export const UPCOMING_EVENTS_TIMELINE = [
  {
    id: 'event-1',
    date: '28 Nov 2026',
    title: 'Saturn (Shani) Stations Direct in Pisces (Meena)',
    category: 'Major Transit',
    badge: 'Stabilizing',
    description: 'Brings structural momentum to 6th house affairs, resolving workplace inertia and clarifying healthcare routines.',
  },
  {
    id: 'event-2',
    date: '04 Dec 2026',
    title: 'Full Moon (Purnima) in Rohini Nakshatra',
    category: 'Lunar Gateway',
    badge: 'Auspicious',
    description: 'Chandra reaches maximum exaltation in Taurus. Ideal for family reconciliation, artistic devotion, and mental clarity.',
  },
  {
    id: 'event-3',
    date: '12 Dec 2026',
    title: 'Jupiter (Guru) Retrograde in Taurus (Vrishabha)',
    category: 'Planetary Shift',
    badge: 'Introspective',
    description: 'Directs spiritual and analytical wisdom inward. Favorable for deep research, estate audits, and classical study.',
  },
  {
    id: 'event-4',
    date: '16 Dec 2026',
    title: 'Sun (Surya) Sagittarius Ingress (Dhanu Sankranti)',
    category: 'Solar Gateway',
    badge: 'Dharma Renewal',
    description: 'Solar transit into the 9th house of wisdom and higher principles, illuminating spiritual and scholarly pursuits.',
  },
  {
    id: 'event-5',
    date: '14 Jan 2027',
    title: 'Makar Sankranti & Uttarayana Commencement',
    category: 'Solstice Gateway',
    badge: 'Peak Auspiciousness',
    description: 'The northward celestial journey of the Sun begins, heralding renewal of vitality, societal clarity, and auspicious beginnings.',
  },
];

