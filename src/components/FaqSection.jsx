import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../data/prompts';
import SectionHeading from './SectionHeading';

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section id="faq" className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
      <SectionHeading
        title="Frequently Asked Questions"
        subtitle="Clear answers about Vedic readings, chart precision, privacy, and astrologer review."
      />
      <div className="space-y-3.5">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                isOpen
                  ? 'border-gold/40 bg-white/[0.08]'
                  : 'border-gold/15 bg-white/5 hover:border-gold/30 hover:bg-white/[0.07]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
              >
                <span className="font-serif text-base sm:text-lg text-white font-medium">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-gold transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 sm:px-6 pb-5 text-sm text-mutedtext leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
