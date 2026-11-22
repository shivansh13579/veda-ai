import { Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="text-center mb-8 sm:mb-10 flex flex-col items-center">
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-md mb-5 shadow-[0_0_20px_-5px_rgba(245,184,46,0.3)] animate-fadeIn">
        <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
        <span className="text-xs font-semibold tracking-wider text-lightgold uppercase">
          Vedic AI Intelligence
        </span>
      </div>

      {/* Main Heading with Brand Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gold/40 blur-md animate-glowPulse" />
          <div className="relative h-11 w-11 sm:h-13 sm:w-13 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-lg shadow-gold/30 border border-lightgold/40">
            <span className="font-display text-lg sm:text-xl font-bold text-vedabg">V</span>
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.15] text-balance">
          Vedic Wisdom,{' '}
          <span className="bg-gradient-to-r from-lightgold via-[#ffe29a] to-gold bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(245,184,46,0.25)]">
            Illuminated by AI
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="font-serif text-base sm:text-lg md:text-xl text-mutedtext/90 max-w-xl mx-auto leading-relaxed px-4 text-balance">
        Ask your deepest life questions, explore your Kundli, and discover personalized planetary guidance grounded in authentic Vedic astrology.
      </p>
    </div>
  );
};

export default HeroSection;
