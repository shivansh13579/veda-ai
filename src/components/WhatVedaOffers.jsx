import { Sparkles, Orbit, TrendingUp, BookOpen } from 'lucide-react';
import { features } from '../data/prompts';
import SectionHeading from './SectionHeading';

const iconMap = {
  predictions: Sparkles,
  kundli: Orbit,
  transits: TrendingUp,
  remedies: BookOpen,
};

const WhatVedaOffers = () => {
  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <SectionHeading
        title="Ancient Wisdom, Intelligent Insights"
        subtitle="Authentic Vedic astrology principles translated into modern, actionable guidance."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((f) => {
          const Icon = iconMap[f.id];
          return (
            <div
              key={f.id}
              className="group rounded-2xl border border-gold/15 bg-white/5 backdrop-blur-sm p-6 hover:border-gold/40 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(113,56,168,0.35)] transition-all duration-300"
            >
              <div className="mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple/20 to-gold/10 border border-gold/20 group-hover:from-purple/30 group-hover:to-gold/20 transition-all">
                <Icon className="h-5 w-5 text-lightgold" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white group-hover:text-lightgold mb-2 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-mutedtext leading-relaxed">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhatVedaOffers;
