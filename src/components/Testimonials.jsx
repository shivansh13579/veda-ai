import { Star } from 'lucide-react';
import { testimonials } from '../data/prompts';
import SectionHeading from './SectionHeading';

const Testimonials = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading
        title="What Seekers Are Saying"
        subtitle="Reflections and experiences from seekers who explored their charts with Veda AI."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-gold/15 bg-white/5 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-gold/40 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(113,56,168,0.35)] transition-all duration-300"
          >
            <div>
              {/* Star Rating */}
              <div className="mb-4 flex items-center gap-1" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5 fill-gold text-gold"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Testimonial Quote */}
              <p className="italic font-serif text-base text-mutedtext group-hover:text-white/90 leading-relaxed transition-colors">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>

            {/* Author Attribution */}
            <div className="mt-5 pt-4 border-t border-gold/10 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-purple/20 border border-gold/25 flex items-center justify-center text-xs font-semibold text-lightgold flex-shrink-0">
                {t.author.charAt(0)}
              </div>
              <span className="text-xs font-medium text-white/80">{t.author}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
