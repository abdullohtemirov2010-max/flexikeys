import React, { useEffect, useState, useRef } from 'react';
import kbFire from '@/assets/intro/kb-fire.mp4.asset.json';
import kbExplode from '@/assets/intro/kb-explode.mp4.asset.json';
import kbCrash from '@/assets/intro/kb-crash.mp4.asset.json';
import kbLogo from '@/assets/intro/kb-logo.mp4.asset.json';

const videos = [
  { src: kbFire.url, duration: 4500 },   // Fire burning
  { src: kbExplode.url, duration: 4500 }, // Keys popping out
  { src: kbCrash.url, duration: 4500 },   // Crashing/breaking
  { src: kbLogo.url, duration: 4500 },    // Logo bursting out
];

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0-3 = videos, 4 = logo reveal, 5 = fade out
  const [opacity, setOpacity] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Play first video immediately
    videoRefs.current[0]?.play().catch(() => {});

    // Transition through videos
    let elapsed = 0;
    for (let i = 1; i <= 3; i++) {
      elapsed += videos[i - 1].duration;
      const idx = i;
      timers.push(setTimeout(() => {
        setPhase(idx);
        videoRefs.current[idx]?.play().catch(() => {});
      }, elapsed));
    }

    // Logo reveal after last video
    elapsed += videos[3].duration;
    timers.push(setTimeout(() => setPhase(4), elapsed));

    // Fade out
    timers.push(setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 800);
    }, elapsed + 2500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{
        opacity,
        transition: 'opacity 0.8s ease-out',
        background: '#000',
      }}
    >
      {/* Video layers — stacked, opacity-driven crossfade */}
      {videos.map((vid, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === i ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: i + 1,
          }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={vid.src}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{
              filter: 'brightness(1.1) contrast(1.05)',
            }}
          />
        </div>
      ))}

      {/* Cinematic light leak overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,140,0,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(33,150,243,0.1) 0%, transparent 50%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Logo reveal phase — pops out right after crash */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
          }}
        />

        {/* Logo — explosive pop-in */}
        <div className="relative z-10 text-center">
          <div
            className="text-7xl md:text-9xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF9800 30%, #2196F3 60%, #1976D2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: phase >= 4 ? 'scale(1) translateY(0)' : 'scale(3) translateY(0)',
              opacity: phase >= 4 ? 1 : 0,
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
              filter: 'drop-shadow(0 0 40px rgba(255,107,0,0.5)) drop-shadow(0 0 80px rgba(33,150,243,0.3))',
            }}
          >
            FLEXIKEYS
          </div>

          <p
            className="mt-4 text-lg md:text-xl font-medium tracking-wide"
            style={{
              color: '#aaa',
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.5s',
            }}
          >
            Small steps. Big progress.
          </p>

          {/* Fire-inspired decorative line */}
          <div
            className="mx-auto mt-6 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #FF6B00, #2196F3, transparent)',
              width: phase >= 4 ? '240px' : '0px',
              transition: 'width 1s ease-out 0.8s',
            }}
          />
        </div>

        {/* Radial burst particles */}
        {phase >= 4 && Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * 360;
          const rad = (angle * Math.PI) / 180;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                left: '50%',
                top: '50%',
                background: i % 2 === 0 ? '#FF6B00' : '#2196F3',
                transform: `translate(-50%, -50%) translate(${Math.cos(rad) * (80 + Math.random() * 120)}px, ${Math.sin(rad) * (80 + Math.random() * 120)}px)`,
                opacity: 0,
                animation: `cinematic-particle ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                zIndex: 25,
              }}
            />
          );
        })}
      </div>

      {/* Brand stamp */}
      <div
        className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5"
        style={{
          opacity: phase >= 1 ? 0.6 : 0,
          transition: 'opacity 1s ease-out',
        }}
      >
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#666' }}>
          made by:
        </span>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#999' }}>
          lojon
        </span>
      </div>

      {/* Skip button */}
      <button
        onClick={() => { setOpacity(0); setTimeout(onComplete, 400); }}
        className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase"
        style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#888',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'none',
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
