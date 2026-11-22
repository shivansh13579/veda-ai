import { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import QuestionInput from '../components/QuestionInput';
import PromptLibrary from '../components/PromptLibrary';
import LoginPrompt from '../components/LoginPrompt';
import Testimonials from '../components/Testimonials';
import AstrologyCategories from '../components/AstrologyCategories';
import KundliSection from '../components/KundliSection';
import WhatVedaOffers from '../components/WhatVedaOffers';
import PlatformPathways from '../components/PlatformPathways';
import HowItWorks from '../components/HowItWorks';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';
import { navigate } from '../router';

const quickSuggestions = [
  {
    label: 'Career Timing',
    prompt: "I'm planning to change my job next month. What do my planetary positions indicate about my career?",
  },
  {
    label: 'Love Compatibility',
    prompt: 'How compatible am I with my partner based on our birth charts, and what does the future hold for us?',
  },
  {
    label: 'Marriage Timing',
    prompt: 'When is the most auspicious time for me to get married according to my Kundli and planetary transits?',
  },
  {
    label: 'Wealth & Growth',
    prompt: 'Is this a favorable period to invest my savings, and what do my houses of wealth indicate about financial growth?',
  },
];

const LandingPage = () => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [navNotice, setNavNotice] = useState('');

  const handleAsk = () => {
    if (!question.trim()) {
      setError('Please enter a question for Veda AI to answer.');
      setSubmitted(false);
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handlePromptSelect = (prompt) => {
    setQuestion(prompt);
    setError('');
    setSubmitted(false);
  };

  const handleCategorySelect = (prompt) => {
    setQuestion(prompt);
    setError('');
    setSubmitted(false);
    const hero = document.getElementById('hero-input');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleNavigate = (label) => {
    setNavNotice(`${label} — coming soon.`);
    setTimeout(() => setNavNotice(''), 2500);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center">
      <CosmicBackground />

      {/* Top sticky navigation header */}
      <Navbar onGetStarted={handleGetStarted} />

      {/* Main hero content */}
      <main id="hero" className="flex-1 w-full flex flex-col items-center justify-center px-4 pt-10 sm:pt-16 pb-14 scroll-mt-20 sm:scroll-mt-24">
        <div id="hero-input" className="w-full max-w-3xl flex flex-col items-center">
          <HeroSection />

          <div className="w-full flex flex-col items-center gap-4">
            {/* Integrated AI Prompt Console */}
            <QuestionInput
              value={question}
              onChange={(v) => {
                setQuestion(v);
                if (error) setError('');
                if (submitted) setSubmitted(false);
              }}
              placeholder="I'm planning to change my job next month. What do my planetary positions indicate about my career?"
            >
              <div className="flex items-center gap-2">
                <PromptLibrary onSelect={handlePromptSelect} />
              </div>

              {/* Primary Ask CTA inside console */}
              <button
                type="button"
                onClick={handleAsk}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm sm:text-base font-semibold text-vedabg bg-gradient-to-r from-lightgold via-gold to-lightgold shadow-md shadow-gold/30 hover:shadow-gold/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <Sparkles className="h-4 w-4" />
                Ask Veda AI
              </button>
            </QuestionInput>

            {/* Quick interactive astrology topic chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-center">
              <span className="text-xs text-mutedtext/70 mr-1 hidden sm:inline">Try asking:</span>
              {quickSuggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePromptSelect(item.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-white/5 px-3 py-1 text-xs text-lightgold hover:bg-gold/15 hover:border-gold/50 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
                >
                  <span className="text-[10px] text-gold">✦</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Validation error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-300 animate-fadeIn mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success / demo message */}
            {submitted && (
              <div className="rounded-xl border border-gold/30 bg-gold/10 px-5 py-3 text-center text-sm text-lightgold animate-scaleIn max-w-md mt-1">
                Your question is ready for Veda AI. This is a demo — full readings are coming soon.
              </div>
            )}

            {/* Login prompt */}
            <div className="mt-2">
              <LoginPrompt onLogin={handleLogin} />
            </div>
          </div>
        </div>
      </main>

      {/* Sections below the hero */}
      <AstrologyCategories onSelect={handleCategorySelect} />
      <KundliSection />
      <WhatVedaOffers />
      <PlatformPathways />
      <HowItWorks />
      <Testimonials />
      <FaqSection />

      <Footer onNavigate={handleNavigate} />

      {navNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-gold/30 bg-[#0b0817]/95 px-5 py-3 text-sm text-lightgold shadow-xl shadow-purple/30 animate-fadeIn">
          {navNotice}
        </div>
      )}
    </div>
  );
};

export default LandingPage;

