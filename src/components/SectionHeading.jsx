const SectionHeading = ({ title, subtitle, description }) => {
  const sub = subtitle || description;

  return (
    <div className="text-center mb-10 sm:mb-14">
      {/* Gold celestial ornament */}
      <div className="inline-flex items-center gap-2 mb-3.5" aria-hidden="true">
        <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-gold/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/80 shadow-[0_0_6px_rgba(245,184,46,0.8)]" />
        <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-gold/60" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-wide text-balance">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 font-serif text-base sm:text-lg text-mutedtext max-w-2xl mx-auto px-4 leading-relaxed text-balance">
          {sub}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
