import React, { useEffect, useState } from 'react';
import kb1 from '@/assets/intro/kb-1.png';
import kb2 from '@/assets/intro/kb-2.png';
import kb3 from '@/assets/intro/kb-3.png';
import kb4 from '@/assets/intro/kb-4.png';

const images = [kb1, kb2, kb3, kb4];

interface CinematicIntroProps {
  onComplete: () => void;
}

/**
 * Premium cinematic intro — 4 keyboard shots cross-fade with zoom/pan,
 * ending with the FlexiKeys logo reveal. ~8s total.
 */
const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0-3 = images, 4 = logo, 5 = fade out
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Each image shows for ~1.6s, then crossfade
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 0 starts immediately
    timers.push(setTimeout(() => setPhase(1), 1600));
    timers.push(setTimeout(() => setPhase(2), 3200));
    timers.push(setTimeout(() => setPhase(3), 4800));
    timers.push(setTimeout(() => setPhase(4), 6400)); // logo reveal
    timers.push(setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 800);
    }, 8500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Cinematic pan/zoom transforms per phase
  const transforms = [
    'scale(1.15) translateY(-3%)',
    'scale(1.2) translateX(4%) rotate(-1deg)',
    'scale(1.25) translateX(-3%) translateY(2%)',
    'scale(1.1) rotate(0.5deg)',
  ];

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{
        opacity,
        transition: 'opacity 0.8s ease-out',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)',
      }}
    >
      {/* Subtle light leak overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(200,220,255,0.2) 0%, transparent 50%)',
        }}
      />

      {/* Image layers — all stacked, opacity-driven crossfade */}
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === i ? 1 : 0,
            transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: phase >= i ? transforms[i] : 'scale(1)',
            zIndex: i + 1,
          }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-contain max-w-[90vw] max-h-[80vh]"
            style={{
              filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.15))',
            }}
          />
        </div>
      ))}

      {/* Logo reveal phase */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Bright backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 60%, rgba(230,230,230,0.95) 100%)',
          }}
        />

        {/* FK Logo text */}
        <div className="relative z-10 text-center">
          <div
            className="text-7xl md:text-9xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 40%, #F57C00 60%, #FF9800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: phase >= 4 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(40px)',
              transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 4px 20px rgba(33,150,243,0.3))',
            }}
          >
            FLEXIKEYS
          </div>

          {/* Tagline */}
          <p
            className="mt-4 text-lg md:text-xl font-medium tracking-wide"
            style={{
              color: '#666',
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.5s',
            }}
          >
            Small steps. Big progress.
          </p>

          {/* Decorative line */}
          <div
            className="mx-auto mt-6 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #2196F3, #F57C00, transparent)',
              width: phase >= 4 ? '200px' : '0px',
              transition: 'width 1s ease-out 0.8s',
            }}
          />
        </div>
      </div>

      {/* Brand stamp — always visible, bottom right */}
      <div
        className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5"
        style={{
          opacity: phase >= 1 ? 0.5 : 0,
          transition: 'opacity 1s ease-out',
        }}
      >
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#999' }}>
          made by:
        </span>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#777' }}>
          lojon
        </span>
      </div>

      {/* Particle effects — floating light dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0
              ? 'rgba(33,150,243,0.3)'
              : 'rgba(245,124,0,0.3)',
            animation: `cinematic-particle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
            zIndex: 15,
          }}
        />
      ))}
    </div>
  );
};

export default CinematicIntro;
