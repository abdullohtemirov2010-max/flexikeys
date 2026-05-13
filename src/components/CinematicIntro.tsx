import React, { useEffect, useState, useCallback } from 'react';

/**
 * Pure-CSS cinematic intro. No images, no video — zero loading lag.
 * Keys fly in, snap together, FLEXIKEYS logo reveals, fade out (~3.2s).
 */

interface CinematicIntroProps {
  onComplete: () => void;
}

const LETTERS = ['F', 'L', 'E', 'X', 'I', 'K', 'E', 'Y', 'S'];

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0); // 0 keys flying, 1 snapped, 2 logo, 3 fade
  const [fading, setFading] = useState(false);

  const finish = useCallback(() => {
    setFading(true);
    setTimeout(onComplete, 500);
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1400); // keys snapped
    const t2 = setTimeout(() => setPhase(2), 1900); // logo gradient + tagline
    const t3 = setTimeout(() => finish(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [finish]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #0b1220 0%, #000 80%)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Soft glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(33,150,243,0.18) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,107,0,0.10) 0%, transparent 70%)',
          opacity: phase >= 1 ? 1 : 0.4,
          transition: 'opacity 0.8s ease',
        }}
      />

      {/* Keys */}
      <div className="relative flex items-center justify-center gap-1 sm:gap-2 md:gap-3" style={{ perspective: '800px' }}>
        {LETTERS.map((ch, i) => {
          const offset = i - (LETTERS.length - 1) / 2;
          // Random fly-in start position
          const startX = (i % 2 === 0 ? -1 : 1) * (200 + i * 18);
          const startY = (i % 3 === 0 ? -1 : 1) * (140 + (i % 4) * 22);
          const startRot = (i % 2 === 0 ? -1 : 1) * (45 + i * 6);

          const flying = phase === 0;
          const logoMode = phase >= 2;

          return (
            <div
              key={i}
              className="font-black select-none"
              style={{
                fontSize: 'clamp(2.2rem, 9vw, 6rem)',
                width: '1.05em',
                height: '1.25em',
                lineHeight: '1.25em',
                textAlign: 'center',
                color: logoMode ? 'transparent' : '#fff',
                background: logoMode
                  ? 'linear-gradient(135deg, #FF6B00 0%, #FF9800 35%, #2196F3 70%, #1976D2 100%)'
                  : 'linear-gradient(180deg, #2a3447 0%, #161e2d 100%)',
                WebkitBackgroundClip: logoMode ? 'text' : 'border-box',
                WebkitTextFillColor: logoMode ? 'transparent' : '#fff',
                borderRadius: logoMode ? 0 : '14%',
                boxShadow: logoMode
                  ? 'none'
                  : 'inset 0 -4px 0 rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08), 0 6px 14px rgba(0,0,0,0.6)',
                transform: flying
                  ? `translate3d(${startX}px, ${startY}px, 0) rotate(${startRot}deg) scale(0.4)`
                  : `translate3d(0,0,0) rotate(0deg) scale(${logoMode ? 1.05 : 1})`,
                opacity: flying ? 0 : 1,
                transition: `transform 0.8s cubic-bezier(.34,1.56,.64,1) ${i * 60}ms, opacity 0.4s ease ${i * 60}ms, color 0.4s ease, background 0.6s ease, box-shadow 0.6s ease, border-radius 0.6s ease`,
                filter: logoMode ? 'drop-shadow(0 0 18px rgba(255,140,0,0.45))' : 'none',
                willChange: 'transform, opacity',
              }}
            >
              {ch}
            </div>
          );
        })}
      </div>

      {/* Tagline */}
      <p
        className="mt-5 text-sm sm:text-base md:text-lg tracking-[0.2em] uppercase"
        style={{
          color: '#9aa4b2',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .6s ease .1s, transform .6s ease .1s',
        }}
      >
        Small steps · Big progress
      </p>

      {/* Accent line */}
      <div
        className="mt-4 h-[2px] rounded-full"
        style={{
          width: phase >= 2 ? 220 : 0,
          background: 'linear-gradient(90deg, transparent, #FF6B00, #2196F3, transparent)',
          transition: 'width .8s ease .25s',
        }}
      />

      {/* Brand stamp */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5" style={{ opacity: 0.75 }}>
        <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase" style={{ color: '#666' }}>
          made by:
        </span>
        <span
          className="text-[10px] sm:text-xs font-black tracking-wider uppercase"
          style={{
            background: 'linear-gradient(135deg, #FF6B00, #2196F3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          lojon
        </span>
      </div>

      {/* Skip */}
      <button
        onClick={finish}
        className="absolute top-5 right-5 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wide"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: '#aaa',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        Skip
      </button>
    </div>
  );
};

export default CinematicIntro;
