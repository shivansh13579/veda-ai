import { Briefcase, Heart, HeartHandshake, Wallet, GraduationCap, HeartPulse } from 'lucide-react';
import { categories } from '../data/prompts';
import SectionHeading from './SectionHeading';

const iconMap = {
  career: Briefcase,
  love: Heart,
  marriage: HeartHandshake,
  finance: Wallet,
  education: GraduationCap,
  health: HeartPulse,
};

const AstrologyCategories = ({ onSelect }) => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading
        title="Explore What the Stars Say"
        subtitle="Choose a life area to discover personalized astrological insights from your planetary placements."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {categories.map((cat) => {
          const Icon = iconMap[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.question)}
              className="group relative flex flex-col justify-between text-left rounded-2xl border border-gold/15 bg-white/5 backdrop-blur-sm p-6 hover:border-gold/40 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(113,56,168,0.35)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple/20 to-gold/10 border border-gold/20 group-hover:from-purple/30 group-hover:to-gold/20 transition-all">
                    <Icon className="h-5 w-5 text-lightgold" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white group-hover:text-lightgold transition-colors">
                    {cat.title}
                  </h3>
                </div>
                <p className="text-sm text-mutedtext leading-relaxed line-clamp-2">
                  {cat.question}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-gold/80 group-hover:text-gold transition-colors">
                Ask about this <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AstrologyCategories;
