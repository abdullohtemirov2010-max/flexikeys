import React, { useEffect, useState, useRef, useMemo } from 'react';
import kbFire from '@/assets/intro/kb-fire.mp4.asset.json';
import kbExplode from '@/assets/intro/kb-explode.mp4.asset.json';
import kbCrash from '@/assets/intro/kb-crash.mp4.asset.json';
import kbLogo from '@/assets/intro/kb-logo.mp4.asset.json';

// Each video flows INTO the next — crossfade overlap creates one continuous sequence
const videos = [
  { src: kbFire.url, duration: 5000 },
  { src: kbExplode.url, duration: 5000 },
  { src: kbCrash.url, duration: 4000 },
  { src: kbLogo.url, duration: 3500 },
];

const CROSSFADE_MS = 1200; // overlap between videos for smooth blending

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [opacity, setOpacity] = useState(1);
  // Track fractional crossfade per video for smooth blending
  const [videoOpacities, setVideoOpacities] = useState([1, 0, 0, 0]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Precompute stable particle positions
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => {
      const angle = (i / 20) * 360;
      const rad = (angle * Math.PI) / 180;
      const size = 3 + (i % 5);
      const dist = 80 + (i * 7) % 120;
      const delay = (i * 0.03);
      const dur = 1.5 + (i % 3) * 0.5;
      return { angle, rad, size, dist, delay, dur, color: i % 2 === 0 ? '#FF6B00' : '#2196F3' };
    }), []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Start all videos preloading, play first immediately
    videoRefs.current.forEach((v) => v?.load());
    videoRefs.current[0]?.play().catch(() => {});

    // Smooth crossfade: start next video BEFORE current ends
    let elapsed = 0;
    for (let i = 0; i < 3; i++) {
      const fadeStart = elapsed + videos[i].duration - CROSSFADE_MS;
      const idx = i + 1;

      // Begin crossfade — fade out current, fade in next simultaneously
      timers.push(setTimeout(() => {
        videoRefs.current[idx]?.play().catch(() => {});
        // Animate crossfade over CROSSFADE_MS
        const steps = 20;
        const stepMs = CROSSFADE_MS / steps;
        for (let s = 0; s <= steps; s++) {
          const step = s;
          timers.push(setTimeout(() => {
            const progress = step / steps;
            setVideoOpacities(prev => {
              const next = [...prev];
              next[idx - 1] = 1 - progress;
              next[idx] = progress;
              return next;
            });
          }, stepMs * step));
        }
      }, fadeStart));

      // Update phase for other elements
      timers.push(setTimeout(() => setPhase(idx), fadeStart + CROSSFADE_MS / 2));

      elapsed += videos[i].duration - CROSSFADE_MS / 2; // overlap shrinks total time
    }

    // After crash video (phase 3), the crash "breaks" into logo reveal
    const crashEnd = elapsed + videos[3].duration - 500;

    // Shake effect during crash
    timers.push(setTimeout(() => {
      const container = document.getElementById('intro-container');
      if (container) {
        container.style.animation = 'intro-shake 0.15s ease-in-out 3';
        setTimeout(() => { container.style.animation = ''; }, 500);
      }
    }, elapsed + 1000));

    // Logo bursts out from the crash
    timers.push(setTimeout(() => {
      setPhase(4);
      // Fade out all videos
      setVideoOpacities([0, 0, 0, 0]);
    }, crashEnd));

    // Final fade out
    timers.push(setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 800);
    }, crashEnd + 3000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      id="intro-container"
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{
        opacity,
        transition: 'opacity 0.8s ease-out',
        background: '#000',
      }}
    >
      {/* Video layers — simultaneous with opacity crossfade for continuous flow */}
      {videos.map((vid, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: videoOpacities[i],
            transition: 'none', // controlled via JS for smooth crossfade
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

      {/* Fire glow during phase 0 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: phase === 0
            ? 'radial-gradient(ellipse at 50% 60%, rgba(255,100,0,0.25) 0%, transparent 60%)'
            : phase === 1
            ? 'radial-gradient(ellipse at 50% 50%, rgba(255,200,0,0.15) 0%, transparent 50%)'
            : phase === 2
            ? 'radial-gradient(ellipse at 50% 50%, rgba(100,100,255,0.1) 0%, transparent 60%)'
            : 'none',
          transition: 'background 1.5s ease',
          mixBlendMode: 'screen',
        }}
      />

      {/* Breaking debris particles during crash phase */}
      {phase >= 2 && phase < 4 && Array.from({ length: 12 }).map((_, i) => {
        const x = (i - 6) * 60;
        const y = -200 - (i % 3) * 100;
        return (
          <div
            key={`debris-${i}`}
            className="absolute z-15"
            style={{
              left: '50%',
              top: '50%',
              width: `${4 + (i % 4) * 2}px`,
              height: `${4 + (i % 4) * 2}px`,
              background: i % 2 === 0 ? '#FF6B00' : '#aaa',
              borderRadius: i % 3 === 0 ? '50%' : '2px',
              transform: `translate(${x}px, ${y}px) rotate(${i * 45}deg)`,
              animation: `cinematic-particle 2s ease-out ${i * 0.1}s forwards`,
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* Logo reveal — bursts out after crash breaks everything */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.97) 100%)',
          }}
        />

        <div className="relative z-10 text-center">
          <div
            className="text-7xl md:text-9xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF9800 30%, #2196F3 60%, #1976D2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: phase >= 4 ? 'scale(1) translateY(0)' : 'scale(3) translateY(30px)',
              opacity: phase >= 4 ? 1 : 0,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
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

          <div
            className="mx-auto mt-6 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #FF6B00, #2196F3, transparent)',
              width: phase >= 4 ? '240px' : '0px',
              transition: 'width 1s ease-out 0.8s',
            }}
          />
        </div>

        {/* Burst particles */}
        {phase >= 4 && particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: '50%',
              top: '50%',
              background: p.color,
              transform: `translate(-50%, -50%) translate(${Math.cos(p.rad) * p.dist}px, ${Math.sin(p.rad) * p.dist}px)`,
              opacity: 0,
              animation: `cinematic-particle ${p.dur}s ease-out ${p.delay}s forwards`,
              zIndex: 25,
            }}
          />
        ))}
      </div>

      {/* ===== BRAND STAMP — made by: lojon ===== */}
      <div
        className="absolute bottom-5 right-5 z-[50] flex items-center gap-1.5"
        style={{
          opacity: phase >= 0 ? 0.85 : 0,
          transition: 'opacity 0.8s ease-out',
        }}
      >
        <span className="text-sm font-medium tracking-widest uppercase" style={{ color: '#777' }}>
          made by:
        </span>
        <span
          className="text-sm font-black tracking-wider uppercase"
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
        onClick={() => { setOpacity(0); setTimeout(onComplete, 400); }}
        className="absolute top-6 right-6 z-[50] px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase"
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
