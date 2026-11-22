import { MessageSquareText } from 'lucide-react';

const QuestionInput = ({ value, onChange, placeholder, children }) => {
  return (
    <div className="relative w-full group">
      {/* Dynamic ambient halo */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple/30 via-gold/20 to-purple/30 opacity-70 blur-md group-focus-within:opacity-100 group-focus-within:blur-lg transition-all duration-500" />

      {/* Main glass card console */}
      <div className="relative w-full rounded-3xl border border-gold/30 bg-[#0b0817]/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-purple/20 transition-all duration-300 group-focus-within:border-gold/60 group-focus-within:shadow-[0_0_40px_-10px_rgba(245,184,46,0.25)]">
        {/* Console Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gold/10 text-xs">
          <div className="flex items-center gap-2 text-lightgold/90">
            <MessageSquareText className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold tracking-wider uppercase text-[11px]">
              Vedic AI Query Console
            </span>
          </div>
          <span className="text-[11px] text-mutedtext/70 hidden sm:inline">
            Birth Chart • Transits • Dashas
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          aria-label="Ask your astrological question"
          className="w-full bg-transparent text-white placeholder:text-mutedtext/50 text-base sm:text-lg leading-relaxed resize-none focus:outline-none transition-all"
        />

        {/* Console Actions Toolbar (Prompt Library + Ask CTA) */}
        {children && (
          <div className="mt-4 pt-3 border-t border-gold/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionInput;
