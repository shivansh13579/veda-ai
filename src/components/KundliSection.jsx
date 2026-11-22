import { useState, useEffect } from 'react';
import { X, Sparkles, Orbit, Home, TrendingUp, Compass } from 'lucide-react';
import SectionHeading from './SectionHeading';
import KundliChart from './KundliChart';

const highlights = [
  {
    icon: Orbit,
    tag: '9 Grahas Analyzed',
    title: 'Planetary Positions & Dignities',
    desc: 'Calculate exact degrees, signs, retrograde states, and planetary strengths across your chart.',
  },
  {
    icon: Home,
    tag: '12 Life Bhavas',
    title: 'Houses & Ascendant (Lagna)',
    desc: 'Determine your rising sign and discover how the 12 cosmic houses govern career, wealth, and destiny.',
  },
  {
    icon: TrendingUp,
    tag: 'Vimshottari Timelines',
    title: 'Dashas & Live Planetary Transits',
    desc: 'Track Mahadasha and Antardasha cycles alongside real-time planetary transits for opportune timing.',
  },
];

const KundliSection = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <section id="kundli" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-20 sm:scroll-mt-24">
      <SectionHeading
        title="Discover Your Cosmic Blueprint"
        subtitle="Explore your authentic Vedic birth chart and decode the exact celestial forces governing your life journey."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Descriptive Content & Feature Cards (7 cols) */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center">
          {/* Section Sub-badge */}
          <div className="inline-flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-gold" />
            <span className="text-xs font-semibold tracking-wider text-lightgold uppercase">
              Precision Astrological Computing
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-3">
            Your Celestial Sky, Decoded by Intelligence
          </h3>

          <p className="font-serif text-base sm:text-lg text-mutedtext leading-relaxed mb-8">
            Your Kundli is a snapshot of the cosmos at the exact second you entered the world.
            Veda AI reconstructs this sacred astronomical matrix, analyzing planetary degrees and
            house rulers to reveal your innate strengths and life rhythms.
          </p>

          {/* Differentiated Analysis Feature Cards */}
          <div className="space-y-3.5">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="group relative flex items-start gap-4 rounded-2xl border border-gold/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 hover:border-gold/40 hover:bg-white/[0.08] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple/30 to-gold/15 border border-gold/25 group-hover:from-purple/40 group-hover:to-gold/25 transition-all mt-0.5">
                  <h.icon className="h-5 w-5 text-lightgold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border border-gold/20 bg-gold/10 text-lightgold">
                      {h.tag}
                    </span>
                  </div>
                  <h4 className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-lightgold transition-colors">
                    {h.title}
                  </h4>
                  <p className="text-sm text-mutedtext leading-relaxed mt-1">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Primary CTA Area */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/30 hover:shadow-gold/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <Sparkles className="h-5 w-5" />
              <span>Explore Your Kundli</span>
            </button>
            <span className="text-xs text-mutedtext/70">
              Computed from your birth date, exact time & location
            </span>
          </div>
        </div>

        {/* Right Column: High-Impact Kundli Chart Showcase (5 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center">
          <KundliChart />
        </div>
      </div>

      {/* Birth Details Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kundli-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-gold/30 bg-[#0b0817]/95 p-6 shadow-2xl shadow-purple/30 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 id="kundli-modal-title" className="font-display text-lg font-semibold text-white">
                  Explore Your Kundli
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-mutedtext hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-lightgold mb-1.5 font-medium">Date of Birth</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gold/25 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-lightgold mb-1.5 font-medium">Time of Birth</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-gold/25 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-lightgold mb-1.5 font-medium">Place of Birth</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  className="w-full rounded-xl border border-gold/25 bg-white/5 px-4 py-2.5 text-white placeholder:text-mutedtext/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-2xl px-6 py-3.5 font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all duration-300"
            >
              Generate My Kundli
            </button>
            <p className="mt-3 text-center text-xs text-mutedtext">
              This is a demo. Full Kundli calculation is coming soon.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default KundliSection;
