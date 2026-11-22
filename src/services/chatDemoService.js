/**
 * Veda AI Chat Demo Service
 * Provides deterministic Jyotish response synthesis and local session persistence.
 * Designed as a clean abstraction so it can be swapped for a live backend API service in Phase 3.
 */

import { DEMO_RESPONSES, INITIAL_CONVERSATIONS } from '../data/chatMockData';

export const CHAT_STORAGE_KEY = 'veda_chat_conversations';

/**
 * Safely load saved conversations from sessionStorage with fallback
 */
export const loadSavedConversations = () => {
  if (typeof window === 'undefined') return INITIAL_CONVERSATIONS;
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_CONVERSATIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read chat history from sessionStorage:', err);
  }
  return INITIAL_CONVERSATIONS;
};

/**
 * Safely persist conversations to sessionStorage
 */
export const persistConversations = (conversations) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('Could not persist chat history to sessionStorage:', err);
  }
};

/**
 * Keyword-based matching algorithm to pair user inquiries with educational Jyotish responses
 */
export const findMatchingResponse = (query, suggestionId = null) => {
  // If an exact suggestion ID was clicked
  if (suggestionId && DEMO_RESPONSES[suggestionId]) {
    return DEMO_RESPONSES[suggestionId];
  }

  const normalized = (query || '').toLowerCase().trim();

  // Career & 10th House
  if (normalized.includes('10th') || normalized.includes('career') || normalized.includes('profession') || normalized.includes('vocation') || normalized.includes('job')) {
    if (normalized.includes('planet') || normalized.includes('growth') || normalized.includes('advance')) {
      return DEMO_RESPONSES['career-planets'];
    }
    return DEMO_RESPONSES['career-10th-house'];
  }

  // Finance & Wealth (2nd & 11th)
  if (normalized.includes('finance') || normalized.includes('wealth') || normalized.includes('money') || normalized.includes('2nd') || normalized.includes('11th') || normalized.includes('income')) {
    if (normalized.includes('jupiter') || normalized.includes('guru')) {
      return DEMO_RESPONSES['finance-jupiter'];
    }
    return DEMO_RESPONSES['finance-2nd-11th'];
  }

  // Relationships & 7th House
  if (normalized.includes('relationship') || normalized.includes('marriage') || normalized.includes('love') || normalized.includes('7th') || normalized.includes('partner') || normalized.includes('spouse')) {
    if (normalized.includes('venus') || normalized.includes('shukra')) {
      return DEMO_RESPONSES['rel-venus'];
    }
    return DEMO_RESPONSES['rel-7th-house'];
  }

  // Dasha & Timelines
  if (normalized.includes('dasha') || normalized.includes('mahadasha') || normalized.includes('antardasha') || normalized.includes('vimshottari') || normalized.includes('period')) {
    return DEMO_RESPONSES['dasha-current'];
  }

  // Transits / Gochara
  if (normalized.includes('transit') || normalized.includes('gochara') || normalized.includes('saturn transit') || normalized.includes('jupiter transit')) {
    return DEMO_RESPONSES['transit-gochara'];
  }

  // Ascendant / Lagna
  if (normalized.includes('ascendant') || normalized.includes('lagna') || normalized.includes('rising')) {
    return DEMO_RESPONSES['kundli-ascendant'];
  }

  // Moon sign / Nakshatra
  if (
    normalized.includes('moon') ||
    normalized.includes('chandra') ||
    normalized.includes('nakshatra') ||
    normalized.includes('rashi') ||
    normalized.includes('capricorn') ||
    normalized.includes('makara') ||
    normalized.includes('shravana')
  ) {
    return DEMO_RESPONSES['kundli-moon'];
  }

  // General Fallback for unmapped queries in demo mode
  return {
    title: 'Veda AI Demo Consultation',
    content: `Thank you for your inquiry: *"${query}"*.

### Educational Demo Notice
You are interacting with the **frontend demonstration environment** of Veda AI. In this pre-backend mode, full generative reasoning across all 300+ divisional charts and Shadbala calculations is simulated using pre-configured classical Parashari knowledge bases.

### What Live Veda AI Will Analyze Upon Backend Connection:
1. **Dynamic Ephemeris Computation**: Real-time evaluation of your planetary degrees down to arcseconds using your exact birth coordinates.
2. **Multi-Divisional Cross-Referencing**: Deep analysis across the Navamsha (D-9 for inner dharma) and Dashamsha (D-10 for professional status).
3. **Ashtakavarga & Gochara Synergies**: Exact Bindu scores mapped across transit houses to predict optimal timing.

### Try Asking One of the Supported Topics:
- *"What does my 10th house indicate about my career?"*
- *"What is the significance of my 2nd and 11th houses?"*
- *"Explain my current Mahadasha."*
- *"Help me understand my Ascendant."*
- *"Explain Venus's significance in relationship astrology."*`,
    upaya: 'For general clarity, recite the Gayatri Mantra or Gayatri of your Ishta Devata during sunrise twilight.',
    tags: ['Demo Mode', 'Astrological Synthesis', 'Classical Jyotish'],
  };
};

/**
 * Simulate dispatching a message to the AI assistant with a natural thinking delay
 */
export const dispatchMessageToAssistant = async ({
  userQuery,
  suggestionId = null,
  delayMs = 850,
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = findMatchingResponse(userQuery, suggestionId);
      const assistantMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        role: 'assistant',
        title: match.title,
        content: match.content,
        upaya: match.upaya,
        tags: match.tags || [],
        timestamp: new Date().toISOString(),
        source: 'demo',
        metadata: {
          isDemo: true,
          notice: 'Demo response – not generated by a live AI model.',
          topicKey: suggestionId || 'custom-query',
        },
      };
      resolve(assistantMessage);
    }, delayMs);
  });
};

