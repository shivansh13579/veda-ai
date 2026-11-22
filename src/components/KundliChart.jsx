const BHAVA_POLYGONS = {
  1: '200,20 290,110 200,200 110,110',
  2: '20,20 200,20 110,110',
  3: '20,20 110,110 20,200',
  4: '20,200 110,110 200,200 110,290',
  5: '20,200 110,290 20,380',
  6: '20,380 110,290 200,380',
  7: '200,200 290,290 200,380 110,290',
  8: '200,380 290,290 380,380',
  9: '290,290 380,200 380,380',
  10: '200,200 290,110 380,200 290,290',
  11: '290,110 380,20 380,200',
  12: '200,20 380,20 290,110',
};

const KundliChart = ({
  chartType = 'D1',
  activeBhava = null,
  onSelectBhava = null,
}) => {
  const isD9 = chartType === 'D9';

  const handleHouseClick = (houseNum) => {
    if (onSelectBhava) {
      onSelectBhava(houseNum);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Outer Glow & Cosmic Halo */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-purple/30 via-gold/15 to-purple/20 blur-xl opacity-80" />

      {/* Main Glass Enclosure */}
      <div className="relative rounded-3xl border border-gold/30 bg-[#070512]/95 backdrop-blur-xl p-4 sm:p-6 shadow-[0_0_50px_-10px_rgba(113,56,168,0.4)] transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_60px_-10px_rgba(245,184,46,0.25)]">
        {/* Chart Header Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gold/15 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="font-display font-semibold tracking-wider text-lightgold uppercase text-xs">
              {isD9 ? 'D-9 Navamsha Harmonics' : 'D-1 Lagna Kundli'}
            </span>
          </div>
          <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-lightgold">
            {isD9 ? 'Illustrative Divisional' : 'Vedic Natal Chart'}
          </span>
        </div>

        {/* Mathematically Exact North Indian Kundli SVG */}
        <div className="relative aspect-square w-full">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full select-none"
            role="img"
            aria-label={`${isD9 ? 'D-9 Navamsha' : 'D-1 Lagna'} North Indian Kundli Chart with 12 Bhavas and planetary positions`}
          >
            <defs>
              {/* Subtle gold line gradient */}
              <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD978" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#F5B82E" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFD978" stopOpacity="0.9" />
              </linearGradient>

              {/* Central Kendra subtle glow */}
              <radialGradient id="kendraGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(245,184,46,0.15)" />
                <stop offset="70%" stopColor="rgba(113,56,168,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Central Kendra Fill */}
            <polygon
              points="200,20 380,200 200,380 20,200"
              fill="url(#kendraGlow)"
            />

            {/* Active Highlighted Bhava Polygon (if selected) */}
            {activeBhava && BHAVA_POLYGONS[activeBhava] && (
              <polygon
                points={BHAVA_POLYGONS[activeBhava]}
                fill="rgba(245, 184, 46, 0.22)"
                stroke="#F5B82E"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* Outer Decorative Double Border */}
            <rect
              x="20"
              y="20"
              width="360"
              height="360"
              fill="none"
              stroke="url(#goldLineGrad)"
              strokeWidth="2"
              rx="4"
            />
            <rect
              x="26"
              y="26"
              width="348"
              height="348"
              fill="none"
              stroke="rgba(245,184,46,0.3)"
              strokeWidth="1"
              rx="2"
            />

            {/* Corner Decorative Celestial Accents */}
            <path d="M 28 40 L 40 40 L 40 28" fill="none" stroke="rgba(245,184,46,0.6)" strokeWidth="1.5" />
            <path d="M 372 40 L 360 40 L 360 28" fill="none" stroke="rgba(245,184,46,0.6)" strokeWidth="1.5" />
            <path d="M 28 360 L 40 360 L 40 372" fill="none" stroke="rgba(245,184,46,0.6)" strokeWidth="1.5" />
            <path d="M 372 360 L 360 360 L 360 372" fill="none" stroke="rgba(245,184,46,0.6)" strokeWidth="1.5" />

            {/* 1. North Indian Inner Diamond */}
            <polygon
              points="200,20 380,200 200,380 20,200"
              fill="none"
              stroke="url(#goldLineGrad)"
              strokeWidth="1.8"
            />

            {/* 2. Diagonals (A-C and B-D) */}
            <line
              x1="20"
              y1="20"
              x2="380"
              y2="380"
              stroke="url(#goldLineGrad)"
              strokeWidth="1.8"
            />
            <line
              x1="380"
              y1="20"
              x2="20"
              y2="380"
              stroke="url(#goldLineGrad)"
              strokeWidth="1.8"
            />

            {/* Center Brahma Bindu (Center of Cosmic Energy) */}
            <circle cx="200" cy="200" r="10" fill="rgba(113,56,168,0.4)" stroke="#F5B82E" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="3.5" fill="#FFD978" />

            {/* Clickable House Interaction Zones & Glyphs */}

            {/* House 1: Lagna / Ascendant (Top Rhombus) */}
            <g
              transform="translate(200, 105)"
              onClick={() => handleHouseClick(1)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-12" fill={activeBhava === 1 ? '#FFFFFF' : '#FFD978'} fontSize="13" fontFamily="Cinzel, serif" fontWeight="bold">1</text>
              <text textAnchor="middle" y="4" fill="#FFFFFF" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600">{isD9 ? 'D9 Lagna' : 'Asc'}</text>
              <text textAnchor="middle" y="20" fill="#F5B82E" fontSize="10.5" fontFamily="Inter, sans-serif">{isD9 ? 'Sa ♄' : 'Ju ♃'}</text>
            </g>

            {/* House 2: Dhana Bhava (Top-Left Upper Triangle) */}
            <g
              transform="translate(110, 52)"
              onClick={() => handleHouseClick(2)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">2</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? 'Ju ♃' : 'Mo ☽'}</text>
            </g>

            {/* House 3: Sahaja Bhava (Top-Left Lower Triangle) */}
            <g
              transform="translate(52, 110)"
              onClick={() => handleHouseClick(3)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">3</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? 'Su ☉' : 'Ma ♂'}</text>
            </g>

            {/* House 4: Sukha Bhava (Left Rhombus) */}
            <g
              transform="translate(105, 200)"
              onClick={() => handleHouseClick(4)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-10" fill={activeBhava === 4 ? '#FFFFFF' : '#FFD978'} fontSize="13" fontFamily="Cinzel, serif" fontWeight="bold">4</text>
              <text textAnchor="middle" y="8" fill="#FFFFFF" fontSize="10.5" fontFamily="Inter, sans-serif">{isD9 ? 'Ve ♀' : 'Me ☿'}</text>
            </g>

            {/* House 5: Putra Bhava (Bottom-Left Upper Triangle) */}
            <g
              transform="translate(52, 290)"
              onClick={() => handleHouseClick(5)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">5</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? 'Ke ☋' : 'Ve ♀'}</text>
            </g>

            {/* House 6: Ari Bhava (Bottom-Left Lower Triangle) */}
            <g
              transform="translate(110, 348)"
              onClick={() => handleHouseClick(6)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">6</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? 'Me ☿' : 'Ke ☋'}</text>
            </g>

            {/* House 7: Kalatra Bhava (Bottom Rhombus) */}
            <g
              transform="translate(200, 295)"
              onClick={() => handleHouseClick(7)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-10" fill={activeBhava === 7 ? '#FFFFFF' : '#FFD978'} fontSize="13" fontFamily="Cinzel, serif" fontWeight="bold">7</text>
              <text textAnchor="middle" y="8" fill="#FFFFFF" fontSize="10.5" fontFamily="Inter, sans-serif">{isD9 ? 'Mo ☽' : 'Sa ♄'}</text>
            </g>

            {/* House 8: Ayur Bhava (Bottom-Right Lower Triangle) */}
            <g
              transform="translate(290, 348)"
              onClick={() => handleHouseClick(8)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">8</text>
              <text textAnchor="middle" y="10" fill="#C5C2CE" fontSize="9.5" fontFamily="Inter, sans-serif">{isD9 ? 'Ma ♂' : '-'}</text>
            </g>

            {/* House 9: Bhagya Bhava (Bottom-Right Upper Triangle) */}
            <g
              transform="translate(348, 290)"
              onClick={() => handleHouseClick(9)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">9</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? '-' : 'Su ☉'}</text>
            </g>

            {/* House 10: Karma Bhava (Right Rhombus) */}
            <g
              transform="translate(295, 200)"
              onClick={() => handleHouseClick(10)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-10" fill={activeBhava === 10 ? '#FFFFFF' : '#FFD978'} fontSize="13" fontFamily="Cinzel, serif" fontWeight="bold">10</text>
              <text textAnchor="middle" y="8" fill="#FFFFFF" fontSize="10.5" fontFamily="Inter, sans-serif">{isD9 ? 'Ra ☊' : 'Ma ♂'}</text>
            </g>

            {/* House 11: Labha Bhava (Top-Right Lower Triangle) */}
            <g
              transform="translate(348, 110)"
              onClick={() => handleHouseClick(11)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">11</text>
              <text textAnchor="middle" y="10" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif">{isD9 ? '-' : 'Ra ☊'}</text>
            </g>

            {/* House 12: Vyaya Bhava (Top-Right Upper Triangle) */}
            <g
              transform="translate(290, 52)"
              onClick={() => handleHouseClick(12)}
              className="cursor-pointer group"
            >
              <text textAnchor="middle" y="-6" fill="rgba(255,217,120,0.85)" fontSize="11" fontFamily="Cinzel, serif" fontWeight="600">12</text>
              <text textAnchor="middle" y="10" fill="#C5C2CE" fontSize="9.5" fontFamily="Inter, sans-serif">{isD9 ? '-' : 'Ke ☋'}</text>
            </g>
          </svg>
        </div>

        {/* Chart Legend / Metadata Bar */}
        <div className="mt-4 pt-3.5 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mutedtext">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-lightgold font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Kendras: 1, 4, 7, 10
            </span>
            <span className="inline-flex items-center gap-1 text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple" />
              Trikonas: 1, 5, 9
            </span>
          </div>
          <span className="text-gold/80 font-medium">
            {activeBhava ? `House ${activeBhava} Selected` : 'Click house to inspect'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KundliChart;
