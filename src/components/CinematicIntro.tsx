import React, { useEffect, useState, useCallback } from 'react';
import kb1 from '@/assets/intro/kb-1.png';
import kb2 from '@/assets/intro/kb-2.png';
import kb3 from '@/assets/intro/kb-3.png';
import kb4 from '@/assets/intro/kb-4.png';

/**
 * Lightweight cinematic intro — pure CSS animations over static PNGs.
 * No video files = zero loading lag.
 *
 * Timeline (total ~8s):
 *   0–2s     Phase 0: kb-1 fades in with fire glow + slow zoom
 *   2–4s     Phase 1: crossfade to kb-2, keys lifting out
 *   4–5.5s   Phase 2: crossfade to kb-3, crash/break with screen shake
 *   5.5–6s   Phase 3: crossfade to kb-4, aftermath
 *   6–8s     Phase 4: logo reveal bursts in
 *   8s+      fade out → onComplete
 */

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [fading, setFading] = useState(false);

  const handleSkip = useCallback(() => {
    setFading(true);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => {
        // Shake the container during crash
        const el = document.getElementById('intro-container');
        if (el) {
          el.style.animation = 'intro-shake 0.12s ease-in-out 4';
          setTimeout(() => { el.style.animation = ''; }, 500);
        }
      }, 4200),
      setTimeout(() => setPhase(3), 5500),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => {
        setFading(true);
        setTimeout(onComplete, 700);
      }, 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const images = [kb1, kb2, kb3, kb4];

  // Which image index is "active" per phase
  const activeImg = phase >= 4 ? -1 : Math.min(phase, 3);

  return (
    <div
      id="intro-container"
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        background: '#000',
      }}
    >
      {/* Image layers with CSS crossfade */}
      {images.map((src, i) => {
        const isActive = i === activeImg;
        // Compute a cinematic transform per phase
        let transform = 'scale(1)';
        if (i === 0 && phase === 0) transform = 'scale(1.08)';
        if (i === 1 && phase === 1) transform = 'scale(1.05) translateY(-2%)';
        if (i === 2 && phase === 2) transform = 'scale(1.12) rotate(0.5deg)';
        if (i === 3 && phase === 3) transform = 'scale(1.03)';

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: i + 1,
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                transform,
                transition: 'transform 2s ease-out',
                willChange: 'transform',
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Fire glow overlay for phase 0 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            phase === 0
              ? 'radial-gradient(ellipse at 50% 60%, rgba(255,80,0,0.3) 0%, transparent 65%)'
              : phase === 1
              ? 'radial-gradient(ellipse at 50% 40%, rgba(255,180,0,0.15) 0%, transparent 55%)'
              : phase === 2
              ? 'radial-gradient(ellipse at 50% 50%, rgba(200,200,255,0.12) 0%, transparent 60%)'
              : 'none',
          transition: 'background 1.2s ease',
          mixBlendMode: 'screen',
        }}
      />

      {/* Flying debris particles during crash phases */}
      {(phase === 2 || phase === 3) && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`d-${i}`}
              className="absolute"
              style={{
                left: `${20 + i * 8}%`,
                top: `${30 + (i % 3) * 15}%`,
                width: `${3 + (i % 3) * 2}px`,
                height: `${3 + (i % 3) * 2}px`,
                background: i % 2 === 0 ? '#FF6B00' : '#ccc',
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                animation: `cinematic-particle 1.5s ease-out ${i * 0.08}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* ========== LOGO REVEAL ========== */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          zIndex: 20,
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {phase >= 4 && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.97) 100%)',
              }}
            />
            <div className="relative z-10 text-center px-4">
              <div
                className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF9800 30%, #2196F3 60%, #1976D2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'logo-pop 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                  filter: 'drop-shadow(0 0 30px rgba(255,107,0,0.4))',
                }}
              >
                FLEXIKEYS
              </div>
              <p
                className="mt-3 text-base sm:text-lg md:text-xl font-medium tracking-wide"
                style={{
                  color: '#aaa',
                  animation: 'fade-up 0.8s ease-out 0.4s both',
                }}
              >
                Small steps. Big progress.
              </p>
              <div
                className="mx-auto mt-5 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #FF6B00, #2196F3, transparent)',
                  animation: 'line-expand 1s ease-out 0.7s both',
                }}
              />
            </div>

            {/* Burst particles */}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * 2 * Math.PI;
              const dist = 50 + (i * 9) % 70;
              return (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${3 + (i % 4)}px`,
                    height: `${3 + (i % 4)}px`,
                    left: '50%',
                    top: '50%',
                    background: i % 2 === 0 ? '#FF6B00' : '#2196F3',
                    transform: `translate(-50%,-50%) translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px)`,
                    opacity: 0,
                    animation: `cinematic-particle 1.2s ease-out ${i * 0.04}s forwards`,
                    zIndex: 25,
                  }}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Brand stamp */}
      <div
        className="absolute bottom-4 right-4 z-[50] flex items-center gap-1.5"
        style={{ opacity: 0.8 }}
      >
        <span className="text-xs sm:text-sm font-medium tracking-widest uppercase" style={{ color: '#666' }}>
          made by:
        </span>
        <span
          className="text-xs sm:text-sm font-black tracking-wider uppercase"
          style={{
            background: 'linear-gradient(135deg, #FF6B00, #2196F3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          lojon
        </span>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-5 right-5 z-[50] px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase"
        style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#888',
          border: '1px solid rgba(255,255,255,0.15)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        Skip
      </button>
    </div>
  );
};

export default CinematicIntro;
