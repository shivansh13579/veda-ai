import { ArrowLeft, Sparkles, Shield, Compass, Star } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import { navigate } from '../router';

const AuthLayout = ({ children }) => {
  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-vedabg text-white overflow-x-hidden">
      {/* Background celestial field */}
      <CosmicBackground />

      {/* Main Grid: Responsive Split on Desktop, Single Column on Mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Showcase Column (Visible on lg+) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative flex-col justify-between p-10 xl:p-14 border-r border-gold/15 bg-[#070512]/80 backdrop-blur-md overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-purple/20 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

          {/* Top Brand & Return Link */}
          <div className="relative z-10 flex items-center justify-between">
            <a
              href="/"
              onClick={handleHomeClick}
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg p-1"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gold/30 blur-sm group-hover:bg-gold/50 transition-all" />
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
                  <span className="font-display text-lg font-bold text-vedabg">V</span>
                </div>
              </div>
              <span className="font-display text-xl font-semibold text-white tracking-wide group-hover:text-lightgold transition-colors">
                Veda AI
              </span>
            </a>

            <a
              href="/"
              onClick={handleHomeClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mutedtext hover:text-lightgold transition-colors py-1.5 px-3 rounded-full border border-gold/20 hover:border-gold/40 bg-white/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </a>
          </div>

          {/* Center Graphic & Astrological Narrative */}
          <div className="relative z-10 my-auto py-10">
            {/* Celestial Armillary / Zodiac Illustration */}
            <div className="relative mx-auto h-48 w-48 mb-8">
              <div className="absolute inset-0 rounded-full border border-gold/25 animate-spin [animation-duration:60s]" />
              <div className="absolute inset-3 rounded-full border border-dashed border-gold/40 animate-spin [animation-duration:45s] [animation-direction:reverse]" />
              <div className="absolute inset-8 rounded-full border border-purple/40 bg-purple/10 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-lightgold via-gold to-lightgold flex items-center justify-center shadow-lg shadow-gold/30">
                  <Sparkles className="h-8 w-8 text-vedabg" />
                </div>
              </div>
              {/* Planetary Nodes */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-lightgold shadow-[0_0_8px_#FFD978]" />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-purple shadow-[0_0_8px_#7138A8]" />
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-lightgold shadow-[0_0_8px_#FFD978]" />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold shadow-[0_0_8px_#F5B82E]" />
            </div>

            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-gold/50" />
              <span className="text-[11px] font-semibold tracking-widest text-lightgold uppercase">
                Vedic AI Platform
              </span>
              <span className="h-px w-6 bg-gold/50" />
            </div>

            <h2 className="font-display text-2xl xl:text-3xl font-semibold text-white tracking-wide leading-snug mb-3">
              Enter the Sanctuary of Astrological Clarity
            </h2>

            <p className="font-serif text-base text-mutedtext leading-relaxed mb-6">
              Access your personal birth chart, planetary transits, and tailored Vedic guidance decoded through classical Jyotish mathematics.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2 text-left">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-lightgold flex-shrink-0">
                  <Compass className="h-3.5 w-3.5 text-gold" />
                </div>
                <span>Astronomical precision for 9 Grahas & 12 Bhavas</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-lightgold flex-shrink-0">
                  <Star className="h-3.5 w-3.5 text-gold" />
                </div>
                <span>Vimshottari Dasha cycles and transit timing</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-lightgold flex-shrink-0">
                  <Shield className="h-3.5 w-3.5 text-gold" />
                </div>
                <span>Strict privacy and confidential chart storage</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 pt-6 border-t border-gold/10 text-xs text-mutedtext/70">
            <p className="italic font-serif text-sm text-lightgold/80">
              &ldquo;The stars impel, they do not compel. Wisdom is understanding the current.&rdquo;
            </p>
          </div>
        </div>

        {/* Right Form Column (Handles all mobile & desktop viewports) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-4 sm:p-8 lg:p-12 min-h-screen">
          {/* Mobile Top Header (Visible only on < lg) */}
          <div className="flex lg:hidden items-center justify-between w-full max-w-md mx-auto mb-6 pt-2">
            <a
              href="/"
              onClick={handleHomeClick}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center shadow-md shadow-gold/20">
                <span className="font-display text-base font-bold text-vedabg">V</span>
              </div>
              <span className="font-display text-lg font-semibold text-white tracking-wide">
                Veda AI
              </span>
            </a>

            <a
              href="/"
              onClick={handleHomeClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mutedtext hover:text-lightgold transition-colors py-1.5 px-3 rounded-full border border-gold/20 bg-white/5"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </a>
          </div>

          {/* Centered Form Container */}
          <div className="my-auto w-full max-w-md mx-auto py-4">
            {children}
          </div>

          {/* Bottom Legal / Copyright */}
          <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-mutedtext/60">
            <p>© {new Date().getFullYear()} Veda AI • Ancient Wisdom, Modern Intelligence.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

