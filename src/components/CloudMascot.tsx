import React, { useEffect, useRef, useState } from 'react';
import mascotNeutral from '@/assets/mascot-neutral.png';
import mascotHappy from '@/assets/mascot-happy.png';
import mascotEncouraging from '@/assets/mascot-encouraging.png';

type MascotMood = 'happy' | 'neutral' | 'encouraging';

interface CloudMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const moodImages: Record<MascotMood, string> = {
  neutral: mascotNeutral,
  happy: mascotHappy,
  encouraging: mascotEncouraging,
};

/**
 * Animated, reactive cloud mascot.
 *  - happy:        smiles, bounces up, sparkles burst
 *  - encouraging:  gentle head-tilt + glowing aura ("you can do it" body language)
 *  - neutral:      slow idle float + occasional blink/wiggle
 *
 * Mood transitions are detected so each new reaction replays its animation
 * instead of staying static.
 */
const CloudMascot: React.FC<CloudMascotProps> = ({ mood = 'neutral', size = 160, className = '' }) => {
  const prev = useRef<MascotMood>(mood);
  const [reactKey, setReactKey] = useState(0);

  useEffect(() => {
    if (prev.current !== mood) {
      prev.current = mood;
      setReactKey(k => k + 1);
    }
  }, [mood]);

  // Idle blink: every ~4s squash the mascot slightly.
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (mood !== 'neutral') return;
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 180);
    }, 4200);
    return () => window.clearInterval(id);
  }, [mood]);

  const moodAnim =
    mood === 'happy'
      ? 'animate-mascot-happy'
      : mood === 'encouraging'
      ? 'animate-mascot-encourage'
      : 'animate-float';

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Cloud mascot ${mood}`}
    >
      {/* Soft aura — color shifts with mood */}
      <span
        key={`aura-${reactKey}`}
        aria-hidden
        className={`absolute inset-0 rounded-full blur-2xl opacity-60 transition-colors duration-300 ${
          mood === 'happy'
            ? 'bg-amber-200 animate-aura-pulse'
            : mood === 'encouraging'
            ? 'bg-rose-200 animate-aura-pulse'
            : 'bg-sky-200/70'
        }`}
      />

      {/* Mascot body */}
      <img
        key={`body-${reactKey}`}
        src={moodImages[mood]}
        alt=""
        width={size}
        height={size}
        className={`relative w-full h-full object-contain drop-shadow-lg origin-bottom ${moodAnim}`}
        style={{
          transform: blink ? 'scaleY(.94) scaleX(1.03)' : undefined,
          transition: 'transform .18s ease-out',
        }}
        draggable={false}
      />

      {/* Happy sparkles — replay every time mood becomes happy */}
      {mood === 'happy' && (
        <div key={`sparks-${reactKey}`} className="pointer-events-none absolute inset-0">
          {[
            { left: '12%', top: '18%', delay: '0s' },
            { left: '78%', top: '22%', delay: '.15s' },
            { left: '18%', top: '70%', delay: '.3s' },
            { left: '82%', top: '66%', delay: '.45s' },
            { left: '50%', top: '8%',  delay: '.2s' },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute text-amber-400 text-xl animate-spark"
              style={{ left: s.left, top: s.top, animationDelay: s.delay }}
            >
              ✦
            </span>
          ))}
        </div>
      )}

      {/* Encouraging hint — small "you got this" thumbs/heart */}
      {mood === 'encouraging' && (
        <span
          key={`heart-${reactKey}`}
          className="absolute -top-2 right-2 text-2xl animate-encourage-pop select-none"
          aria-hidden
        >
          💪
        </span>
      )}
    </div>
  );
};

export default CloudMascot;
