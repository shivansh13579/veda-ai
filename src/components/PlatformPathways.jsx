import { useState } from 'react';
import { Compass, ShieldCheck, MessageCircle, Check } from 'lucide-react';
import { pathways } from '../data/prompts';
import SectionHeading from './SectionHeading';

const iconMap = {
  free: Compass,
  verify: ShieldCheck,
  talk: MessageCircle,
};

const PlatformPathways = () => {
  const [notice, setNotice] = useState('');

  const handleCta = (tier) => {
    setNotice(`${tier} pathway is coming soon. Stay tuned!`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <section id="pathways" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <SectionHeading
        title="Choose Your Journey with Veda"
        subtitle="Select the path that matches your personal inquiry, from free exploration to direct astrologer consultation."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {pathways.map((p) => {
          const Icon = iconMap[p.id];
          const featured = p.id === 'verify';
          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${
                featured
                  ? 'border-gold/50 bg-gradient-to-b from-purple/20 via-purple/5 to-white/5 shadow-[0_8px_32px_-10px_rgba(113,56,168,0.45)] hover:border-gold/70'
                  : 'border-gold/15 bg-white/5 hover:border-gold/40 hover:bg-white/[0.08] hover:shadow-[0_8px_24px_-8px_rgba(113,56,168,0.3)]'
              }`}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-lightgold to-gold px-3.5 py-0.5 text-xs font-semibold text-vedabg shadow-md shadow-gold/20">
                  Recommended
                </span>
              )}
              <div>
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple/20 to-gold/10 border border-gold/20 mb-4">
                  <Icon className="h-6 w-6 text-lightgold" />
                </div>
                <div className="mb-1 text-xs font-semibold tracking-widest text-gold/80 uppercase">
                  {p.tier}
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{p.name}</h3>
                <p className="text-sm text-mutedtext leading-relaxed mb-6">{p.description}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-white/90">
                      <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleCta(p.tier)}
                className={`w-full rounded-2xl px-5 py-3 font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                  featured
                    ? 'text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/25 hover:shadow-gold/45 hover:scale-[1.01] active:scale-[0.98]'
                    : 'text-lightgold border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold/60 active:scale-[0.98]'
                }`}
              >
                {p.id === 'free' ? 'Start Free' : p.id === 'verify' ? 'Get Verified' : 'Talk to Astrologers'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="min-h-[1.5rem] mt-6 flex items-center justify-center text-center">
        {notice && (
          <p className="text-sm text-lightgold animate-fadeIn">{notice}</p>
        )}
      </div>
    </section>
  );
};

export default PlatformPathways;
