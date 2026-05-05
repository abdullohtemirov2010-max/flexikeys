import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import kbFire from '@/assets/intro/kb-fire.mp4.asset.json';
import kbExplode from '@/assets/intro/kb-explode.mp4.asset.json';
import kbCrash from '@/assets/intro/kb-crash.mp4.asset.json';
import kbLogo from '@/assets/intro/kb-logo.mp4.asset.json';

// Shorter durations + fewer effects = smoother on mobile
const videos = [
  { src: kbFire.url, duration: 4000 },
  { src: kbExplode.url, duration: 4000 },
  { src: kbCrash.url, duration: 3000 },
  { src: kbLogo.url, duration: 3000 },
];

const CROSSFADE_MS = 800;

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [activeVideo, setActiveVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState(-1);
  const [crossfadeProgress, setCrossfadeProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  const handleSkip = useCallback(() => {
    setOpacity(0);
    setTimeout(onComplete, 400);
  }, [onComplete]);

  // Stable particle data for logo burst (reduced count for mobile)
  const particles = useMemo(() =>
    Array.from({ length: 10 }).map((_, i) => {
      const angle = (i / 10) * 360;
      const rad = (angle * Math.PI) / 180;
      const size = 3 + (i % 4);
      const dist = 60 + (i * 10) % 80;
      const delay = i * 0.04;
      const dur = 1.2 + (i % 2) * 0.4;
      return { rad, size, dist, delay, dur, color: i % 2 === 0 ? '#FF6B00' : '#2196F3' };
    }), []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Only load and play the first video immediately
    const firstVideo = videoRefs.current[0];
    if (firstVideo) {
      firstVideo.load();
      firstVideo.play().catch(() => {});
    }

    let elapsed = 0;
    for (let i = 0; i < 3; i++) {
      const fadeStart = elapsed + videos[i].duration - CROSSFADE_MS;
      const idx = i + 1;

      timers.push(setTimeout(() => {
        // Load and play next video just before needed
        const nextVid = videoRefs.current[idx];
        if (nextVid) {
          nextVid.load();
          nextVid.play().catch(() => {});
        }
        setNextVideo(idx);
        setCrossfadeProgress(0);

        // Use RAF for smooth crossfade instead of many setTimeout
        const start = performance.now();
        const animateFade = (now: number) => {
          const progress = Math.min((now - start) / CROSSFADE_MS, 1);
          setCrossfadeProgress(progress);
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(animateFade);
          } else {
            setActiveVideo(idx);
            setNextVideo(-1);
            setCrossfadeProgress(0);
            // Pause previous video to free resources
            const prevVid = videoRefs.current[idx - 1];
            if (prevVid) prevVid.pause();
          }
        };
        rafRef.current = requestAnimationFrame(animateFade);
      }, fadeStart));

      timers.push(setTimeout(() => setPhase(idx), fadeStart + CROSSFADE_MS / 2));
      elapsed += videos[i].duration - CROSSFADE_MS / 2;
    }

    // Shake during crash
    timers.push(setTimeout(() => {
      const container = document.getElementById('intro-container');
      if (container) {
        container.style.animation = 'intro-shake 0.15s ease-in-out 3';
        setTimeout(() => { container.style.animation = ''; }, 500);
      }
    }, elapsed + 800));

    const crashEnd = elapsed + videos[3].duration - 500;

    // Logo reveal
    timers.push(setTimeout(() => {
      setPhase(4);
      // Pause all videos
      videoRefs.current.forEach(v => v?.pause());
    }, crashEnd));

    // Final fade out
    timers.push(setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 800);
    }, crashEnd + 2500));

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
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
      {/* Only render active + next video, not all 4 */}
      {videos.map((vid, i) => {
        const isActive = i === activeVideo;
        const isNext = i === nextVideo;
        if (!isActive && !isNext && phase < 4) return null;
        if (phase >= 4) return null;

        let vidOpacity = 0;
        if (isActive && isNext) vidOpacity = 1;
        else if (isActive) vidOpacity = nextVideo >= 0 ? 1 - crossfadeProgress : 1;
        else if (isNext) vidOpacity = crossfadeProgress;

        return (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: vidOpacity, zIndex: i + 1 }}
          >
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={vid.src}
              muted
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              style={{ willChange: 'opacity' }}
            />
          </div>
        );
      })}

      {/* Subtle glow overlay — simplified for mobile */}
      {phase < 4 && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: phase === 0
              ? 'radial-gradient(ellipse at 50% 60%, rgba(255,100,0,0.2) 0%, transparent 60%)'
              : phase === 2
              ? 'radial-gradient(ellipse at 50% 50%, rgba(100,100,255,0.1) 0%, transparent 60%)'
              : 'none',
            transition: 'background 1s ease',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Logo reveal */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {phase >= 4 && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.97) 100%)',
              }}
            />
            <div className="relative z-10 text-center">
              <div
                className="text-6xl md:text-9xl font-black tracking-tighter"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF9800 30%, #2196F3 60%, #1976D2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transform: 'scale(1)',
                  animation: 'logo-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: 'drop-shadow(0 0 40px rgba(255,107,0,0.5))',
                }}
              >
                FLEXIKEYS
              </div>
              <p
                className="mt-4 text-lg md:text-xl font-medium tracking-wide"
                style={{
                  color: '#aaa',
                  animation: 'fade-up 0.8s ease-out 0.5s both',
                }}
              >
                Small steps. Big progress.
              </p>
              <div
                className="mx-auto mt-6 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #FF6B00, #2196F3, transparent)',
                  animation: 'line-expand 1s ease-out 0.8s both',
                }}
              />
            </div>

            {/* Burst particles — reduced count */}
            {particles.map((p, i) => (
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
          </>
        )}
      </div>

      {/* Brand stamp */}
      <div
        className="absolute bottom-5 right-5 z-[50] flex items-center gap-1.5"
        style={{ opacity: 0.85 }}
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
        onClick={handleSkip}
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
