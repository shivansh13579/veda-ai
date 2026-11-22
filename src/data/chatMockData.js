/**
 * Veda AI Conversational Chat Mock Data
 * Sample conversations, suggested categorized prompts, and educational Jyotish responses.
 * Strictly demo data for architectural and UI integration.
 */

export const SUGGESTED_QUESTIONS = [
  {
    category: 'Career',
    icon: 'Briefcase',
    questions: [
      {
        id: 'career-10th-house',
        text: 'What does my 10th house indicate about my career?',
        shortLabel: '10th House & Career path',
      },
      {
        id: 'career-planets',
        text: 'Which planets influence my professional growth?',
        shortLabel: 'Planets influencing growth',
      },
    ],
  },
  {
    category: 'Finance',
    icon: 'Coins',
    questions: [
      {
        id: 'finance-2nd-11th',
        text: 'What is the significance of my 2nd and 11th houses?',
        shortLabel: '2nd & 11th Wealth houses',
      },
      {
        id: 'finance-jupiter',
        text: 'Explain the role of Jupiter in wealth-related astrology.',
        shortLabel: 'Jupiter (Guru) in wealth',
      },
    ],
  },
  {
    category: 'Relationships',
    icon: 'Heart',
    questions: [
      {
        id: 'rel-7th-house',
        text: 'What does my 7th house represent?',
        shortLabel: '7th House & Partnerships',
      },
      {
        id: 'rel-venus',
        text: "Explain Venus's significance in relationship astrology.",
        shortLabel: 'Venus (Shukra) in relationships',
      },
    ],
  },
  {
    category: 'Dasha & Transit',
    icon: 'Orbit',
    questions: [
      {
        id: 'dasha-current',
        text: 'Explain my current Mahadasha.',
        shortLabel: 'Current Jupiter Mahadasha',
      },
      {
        id: 'transit-gochara',
        text: 'What is Gochara in Vedic astrology?',
        shortLabel: 'Gochara (Transits) overview',
      },
    ],
  },
  {
    category: 'Kundli',
    icon: 'Compass',
    questions: [
      {
        id: 'kundli-ascendant',
        text: 'Help me understand my Ascendant.',
        shortLabel: 'Libra (Tula) Ascendant analysis',
      },
      {
        id: 'kundli-moon',
        text: 'Explain my Moon sign and Nakshatra.',
        shortLabel: 'Moon in Capricorn & Shravana',
      },
    ],
  },
];

export const DEMO_RESPONSES = {
  'career-10th-house': {
    title: '10th House (Karma Bhava) Analysis',
    content: `In your Vedic chart with a **Libra (Tula) Ascendant**, the **10th House (Karma Bhava)** falls in the cardinal water sign of **Cancer (Karka)**, governed by **Chandra (the Moon)**.

### Classical Parashari Principles:
1. **The Seat of Public Karma**: The 10th Bhava governs your professional vocation, social prestige, authority, and public reputation. With Cancer on the 10th cusp, your career is deeply connected to intuitive leadership, emotional intelligence, mentorship, and nurturing collective endeavors.
2. **Lord of the 10th House**: Chandra (Moon) resides in **Capricorn (Makara)** in your **4th House (Sukha Bhava)**, directly aspecting its own 10th House across the chart (*Swa-Drishti*). In classical Parashari principles, a planet aspecting its own domain fortifies that house with enduring institutional support, connecting your foundational inner peace with public career dignity.
3. **Planetary Influences**: The transit of **Shani (Saturn)** through your 6th house confers tenacious stamina, demanding long-term structural patience rather than impulsive shortcuts.

### Actionable Vedic Guidance:
Focus on roles requiring strategic negotiation, advisory foresight, or creative organization. Maintain unwavering integrity in leadership, honoring Saturn's cardinal law of sustainable effort.`,
    upaya: 'Chant the Chandra Beej Mantra ("Om Shram Shreem Shrom Sah Chandraya Namah") on Mondays to strengthen vocational clarity.',
    tags: ['Career', '10th House', 'Cancer', 'Karma Bhava'],
  },

  'career-planets': {
    title: 'Key Planetary Drivers of Professional Growth',
    content: `In Vedic astrology, professional advancement is synthesized through three primary celestial significators (*Karakas*):

### 1. Saturn (Shani) – The Natural Karma Karaka
Saturn governs labor, persistence, organizational systems, and career longevity. In your chart, Saturn's current transit in Aquarius activates your 5th house of intellect and strategic acumen, rewarding systematic dedication and meticulous skill refinement.

### 2. Jupiter (Guru) – The Advisor & Expansionist
As the ruler of your 3rd and 6th houses currently transiting your 8th house, Jupiter signifies professional evolution through research, technical expertise, and collaborative problem-solving.

### 3. Sun (Surya) & Mercury (Budha)
- **Sun (Surya)** represents government recognition, authority, and executive command.
- **Mercury (Budha)**, exalted in Virgo in the 12th house, provides sharp analytical depth, making behind-the-scenes strategy and cross-border initiatives exceptionally potent.

### Synthesis:
Progress in your chart is not overnight; it follows the classical Saturnian arc: steady foundation building leading to permanent, unshakeable professional stature.`,
    upaya: 'Perform Surya Namaskar at dawn and maintain ethical transparency in all contractual engagements.',
    tags: ['Career', 'Saturn', 'Jupiter', 'Sun', 'Mercury'],
  },

  'finance-2nd-11th': {
    title: 'The Wealth Axis: 2nd (Dhana) & 11th (Labha) Bhavas',
    content: `In classical Jyotish, your financial potential is mapped by the polarity between **Dhana Bhava (2nd House of Accumulated Wealth)** and **Labha Bhava (11th House of Gains and Cash Flow)**.

### 2nd House (Dhana Bhava) – Scorpio (Vrishchika)
- **Significance**: Accumulated liquid savings, family heritage, speech, and value systems.
- **Lord**: Mars (Mangala), placed in Cancer (10th House) creating a classical karma-wealth dynamic.
- **Placement**: Jupiter (Guru) resides here in Scorpio, creating an auspicious *Dhana Yoga* that protects financial prudence and long-range wealth accumulation.

### 11th House (Labha Bhava) – Leo (Simha)
- **Significance**: Recurring revenues, profits from investments, professional network, and fulfillment of heartfelt desires.
- **Lord**: Sun (Surya) in the 12th house, indicating that maximum financial yield emerges through foreign enterprises, digital platforms, institutional consultancies, and charitable donations.

### Astrological Recommendation:
Automate long-term investments during favorable dasha windows to counter impulsive spending triggered by lunar mood cycles.`,
    upaya: 'Offer yellow flowers or turmeric to Lord Vishnu on Thursdays; practice mindful dana (giving) of 2-5% of surplus earnings.',
    tags: ['Finance', '2nd House', '11th House', 'Wealth Axis'],
  },

  'finance-jupiter': {
    title: 'The Role of Jupiter (Guru) in Wealth & Abundance',
    content: `**Guru (Jupiter)** is the supreme natural significator (*Naisargika Dhana Karaka*) of fortune, ethical prosperity, wisdom, and institutional abundance.

### Core Vedic Astrological Functions:
1. **Divine Grace (Bhagya)**: While Saturn measures earned karma through sweat, Jupiter represents *Purva Punya*—blessings carried forward from past good deeds.
2. **In Your Chart**: With a Libra Ascendant, Jupiter rules Pisces (6th house) and Sagittarius (3rd house). Though functionally challenging for Libra Lagna, Jupiter remains universally auspicious in bestowing moral prudence in financial dealings.
3. **Current Gochara (Transit)**: Jupiter's transit through Taurus casts an auspicious 9th aspect onto your 2nd house of accumulated wealth (Scorpio), acting as a celestial cushion against financial volatility.

### Classical Wisdom:
Vedic texts note that Jupiter's wealth is never speculative or illicit; it thrives through teaching, ethical commerce, advisory roles, and knowledge dissemination.`,
    upaya: 'Feed soaked chana dal and jaggery to cows on Thursday mornings; wear yellow or golden hues during important financial meetings.',
    tags: ['Finance', 'Jupiter', 'Guru', 'Prosperity'],
  },

  'rel-7th-house': {
    title: '7th House (Kalatra / Yuvati Bhava) & Partnership Karma',
    content: `The **7th House** in your birth chart represents the sacred mirror of human interaction: long-term marital partnerships, contractual alliances, and interpersonal equilibrium.

### Placements in Your Chart:
- **Sign on 7th Cusp**: **Aries (Mesha)**, the fire sign of initiative, passion, courage, and autonomy.
- **Ruler of 7th**: **Mars (Mangala)** resides in Cancer (10th House) aspecting your Lagna and 5th house.
- **Dynamic**: You attract partners who are dynamic, independent, courageous, and career-driven. Because your Lagna is gentle and diplomatic (Libra), your partnerships provide decisive motivation and active collaboration in life pursuits.

### Interpersonal Synthesis:
Mutual respect for autonomy is vital. Mars governing the 7th house gives intense devotion and protective loyalty, yet demands that partnership decisions are addressed with transparent communication and shared purpose.`,
    upaya: 'Light a sesame oil lamp on Tuesdays and recite the Mangal Kavach to channel martial energy into constructive companionship.',
    tags: ['Relationships', '7th House', 'Aries', 'Mars', 'Ruchaka Yoga'],
  },

  'rel-venus': {
    title: "Venus (Shukra): The Divine Embodiment of Love & Harmony",
    content: `In Vedic astrology, **Shukra (Venus)** is the supreme *Kalatra Karaka* (significator of marriage, affection, refinement, aesthetic sensibilities, and social grace).

### Your Venusian Signature:
1. **Lagna Lord**: For Libra Ascendant, Venus is your ruling deity (*Lagnesha*), making relational harmony central to your psychological well-being.
2. **Placement**: Venus resides in the 11th house of Leo, connecting your romantic and social bonds with warm-hearted nobility, high social circles, and creative collaborations.
3. **Relationship Philosophy**: You view companionship as a sacred, refined art form. You flourish when relationships are grounded in mutual courtesy, artistic appreciation, and intellectual fairness.

### Harmonizing Advice:
Honor the Venusian principle of *Samanvaya* (cooperative synergy). Avoid allowing Leo's regal pride to impede vulnerability; true intimacy deepens when both partners celebrate each other's individuality.`,
    upaya: 'Maintain fragrant white flowers (such as jasmine or mogra) in your living space; respect women and mentors as living embodiments of Lakshmi.',
    tags: ['Relationships', 'Venus', 'Shukra', 'Harmony'],
  },

  'dasha-current': {
    title: 'Vimshottari Dasha Analysis: Jupiter-Saturn Period',
    content: `You are currently experiencing the major planetary period (**Mahadasha**) of **Jupiter (Guru)**, coupled with the sub-period (**Antardasha**) of **Saturn (Shani)**, running until **April 2027**.

### Classical Dynamics of Guru-Shani:
- **Jupiter (16 Years)**: Directs the soul toward higher philosophical understanding, ethical re-alignment, family responsibility, and knowledge acquisition.
- **Saturn Sub-period (approx. 2.5 Years)**: Known in classical texts as *Dharma-Karma Adhipati* interaction when favorable. It represents the grounding of Jupiterian vision into realistic, tangible form.
- **Current Life Stage**: This is a period of serious consolidation. While Jupiter presents visionary ideas and expansive horizons, Saturn demands meticulous implementation, audits, patience, and elimination of superfluous commitments.

### Key Milestones:
Expect important structural developments in career authority and residential stability. Do not rush outcomes; the rewards of Guru-Shani arrive through methodical perseverance.`,
    upaya: 'Read a chapter of the Bhagavad Gita daily; chant "Om Namo Bhagavate Vasudevaya" 108 times at dusk.',
    tags: ['Dasha', 'Jupiter Mahadasha', 'Saturn Antardasha', 'Consolidation'],
  },

  'transit-gochara': {
    title: 'Understanding Gochara (Transits) in Vedic Astrology',
    content: `In Vedic astrology, **Gochara** literally translates to "the movement of cows" or the celestial wandering of planets across the sidereal zodiac (*Nirayana* system).

### The Golden Rule of Gochara:
> *"A transit cannot deliver what the natal chart (Janma Kundli) does not promise, nor what the active Dasha does not authorize."*

### How Gochara Works:
1. **Base Coordinate**: Unlike Western astrology which primarily reads transits relative to the Sun, Vedic Gochara is evaluated primarily from the **Janma Rashi (Natal Moon sign)**, and secondarily from the **Lagna (Ascendant)**.
2. **Major Transit Engines**:
   - **Saturn (Shani)**: 2.5 years per sign (karmic discipline and reality checks).
   - **Jupiter (Guru)**: ~1 year per sign (expansion, divine protection, and wisdom).
   - **Rahu & Ketu**: 18 months per sign (karmic axis, breakthroughs, and release).
3. **Current Transits**: Saturn in Kumbha (Aquarius) and Jupiter in Vrishabha (Taurus) provide a stabilizing backdrop for purposeful, long-range achievements.`,
    upaya: 'Review weekly transits with detachment; treat challenging planetary movements as opportunities for spiritual fortitude.',
    tags: ['Transits', 'Gochara', 'Saturn', 'Jupiter', 'Astrology 101'],
  },

  'kundli-ascendant': {
    title: 'Ascendant Deep-Dive: Libra (Tula Lagna)',
    content: `Your **Ascendant (Lagna)** is at **14° 22' Libra (Tula)** in the nakshatra of **Swati (Pada 3)**.

### Psychological & Physical Constitution:
- **Element**: Air (*Vayu*), endowing you with quick intellectual perception, philosophical curiosity, and an innate instinct for civil debate.
- **Modality**: Cardinal (*Chara*), indicating a proactive initiator who motivates others through persuasive diplomatic charm rather than raw coercion.
- **Ruling Deity**: Governed by **Shukra (Venus)**, conferring natural aesthetic refinement, an aversion to vulgarity, and an unquenchable drive for equilibrium.

### Swati Nakshatra (The Independent Sprout):
Swati is presided over by **Vayu**, the Wind God, symbolized by a tender plant shoot bending with the breeze without breaking. This bestows profound resilience, adaptability, and an independent spirit that treasures intellectual freedom.`,
    upaya: 'Practice regular Pranayama (Nadi Shodhana) to balance Vayu dosha; meditate facing east during morning twilight.',
    tags: ['Kundli', 'Ascendant', 'Libra', 'Tula', 'Swati'],
  },

  'kundli-moon': {
    title: 'Lunar Archetype: Moon in Capricorn & Shravana Nakshatra',
    content: `Your **Moon (Chandra)** is situated at **18° 44' Capricorn (Makara)**, in the nakshatra of **Shravana (Pada 2)** in your **4th House (Sukha Bhava)**.

### Emotional Landscape:
- **Saturnian Discipline**: In classical astrology, Moon in Capricorn is governed by Saturn (Shani). This confers an emotionally grounded, disciplined, and responsible disposition. You maintain high composure under stress and approach challenges with pragmatic maturity rather than impulsive panic.
- **4th House Placement**: Occupying Sukha Bhava, Chandra creates deep devotion to family heritage, inner sanctuary, and home stability. By casting a direct 7th aspect onto the 10th house of career (*Swa-Drishti*), your emotional fulfillment is tightly linked to meaningful public contribution.

### Shravana Nakshatra (The Sacred Ear):
- **Presiding Deity**: **Lord Vishnu**, the Preserver.
- **Symbol**: Three footprints or an ear.
- **Traits**: Endows the precious gift of deep listening, scholarly retention, oral wisdom, and intuitive empathy for the subtle unspoken needs of others.`,
    upaya: 'Practice Chandra Namaskar; honor maternal elders; meditate quietly under the moonlight on Purnima evenings.',
    tags: ['Kundli', 'Moon Sign', 'Capricorn', 'Makara', 'Shravana', '4th House'],
  },
};

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-career-10th',
    title: 'Career & 10th House Consultation',
    createdAt: '2026-11-18T10:15:00.000Z',
    updatedAt: '2026-11-18T10:18:00.000Z',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What does my 10th house indicate about my career?',
        timestamp: '2026-11-18T10:15:00.000Z',
        source: 'user',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: DEMO_RESPONSES['career-10th-house'].content,
        upaya: DEMO_RESPONSES['career-10th-house'].upaya,
        tags: DEMO_RESPONSES['career-10th-house'].tags,
        timestamp: '2026-11-18T10:16:30.000Z',
        source: 'demo',
        metadata: {
          isDemo: true,
          notice: 'Demo response – not generated by a live AI model.',
          topicKey: 'career-10th-house',
        },
      },
    ],
  },
  {
    id: 'conv-dasha-period',
    title: 'Current Mahadasha & Saturn Antardasha',
    createdAt: '2026-11-17T14:20:00.000Z',
    updatedAt: '2026-11-17T14:24:00.000Z',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Explain my current Mahadasha.',
        timestamp: '2026-11-17T14:20:00.000Z',
        source: 'user',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: DEMO_RESPONSES['dasha-current'].content,
        upaya: DEMO_RESPONSES['dasha-current'].upaya,
        tags: DEMO_RESPONSES['dasha-current'].tags,
        timestamp: '2026-11-17T14:21:15.000Z',
        source: 'demo',
        metadata: {
          isDemo: true,
          notice: 'Demo response – not generated by a live AI model.',
          topicKey: 'dasha-current',
        },
      },
    ],
  },
];
