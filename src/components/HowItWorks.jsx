import { Calendar, Orbit, Sparkles } from 'lucide-react';
import { steps } from '../data/prompts';
import SectionHeading from './SectionHeading';

const iconMap = [Calendar, Orbit, Sparkles];

const HowItWorks = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading
        title="Your Journey to Astrological Clarity"
        subtitle="A simple three-step progression from your birth data to deep personal illumination."
      />
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        {steps.map((step, i) => {
          const Icon = iconMap[i];
          return (
            <div
              key={step.id}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-transparent hover:border-gold/20 hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="relative z-10 mb-5">
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-md group-hover:bg-gold/30 transition-all" />
                <div className="relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-gold/40 bg-[#0b0817] group-hover:border-gold/70 transition-colors">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-lightgold" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-lightgold to-gold text-xs font-bold text-vedabg shadow-md shadow-gold/25">
                  {step.id}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white group-hover:text-lightgold mb-2 transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-mutedtext leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
