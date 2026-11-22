const quickLinks = [
  { label: 'Home', target: 'hero' },
  { label: 'Explore Kundli', target: 'kundli' },
  { label: 'Features', target: 'features' },
  { label: 'FAQs', target: 'faq' },
];

const platformLinks = [
  { label: 'FREE', target: 'pathways' },
  { label: 'VERIFY', target: 'pathways' },
  { label: 'TALK', target: 'pathways' },
];

const Footer = ({ onNavigate }) => {
  const handleLinkClick = (e, target, label) => {
    e.preventDefault();
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigate) {
      onNavigate(label);
    }
  };

  return (
    <footer className="w-full border-t border-gold/15 bg-[#070512]/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a
              href="#hero"
              onClick={(e) => handleLinkClick(e, 'hero', 'Home')}
              className="inline-flex items-center gap-2.5 mb-3 group"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gold/30 blur-sm group-hover:bg-gold/50 transition-all" />
                <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-lightgold to-gold flex items-center justify-center">
                  <span className="font-display text-base font-bold text-vedabg">V</span>
                </div>
              </div>
              <span className="font-display text-lg font-semibold text-white group-hover:text-lightgold transition-colors">
                Veda AI
              </span>
            </a>
            <p className="text-sm text-mutedtext leading-relaxed max-w-xs">
              AI-powered Vedic astrology insights grounded in ancient wisdom.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-lightgold mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`#${link.target}`}
                    onClick={(e) => handleLinkClick(e, link.target, link.label)}
                    className="text-sm text-mutedtext hover:text-gold transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display text-sm font-semibold text-lightgold mb-3 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`#${link.target}`}
                    onClick={(e) => handleLinkClick(e, link.target, link.label)}
                    className="text-sm text-mutedtext hover:text-gold transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tagline / Connect */}
          <div>
            <h4 className="font-display text-sm font-semibold text-lightgold mb-3 uppercase tracking-wider">
              Connect
            </h4>
            <p className="text-sm text-mutedtext leading-relaxed">
              Explore the stars, understand your Kundli, and discover what the planets hold for you.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-mutedtext">
            © {new Date().getFullYear()} Veda AI. All rights reserved.
          </p>
          <p className="text-xs text-mutedtext/70">Crafted with ancient wisdom & modern intelligence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
