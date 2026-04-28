import React, { useEffect, useState } from 'react';
import earthImg from '@/assets/earth-3d.png';

interface EarthIntroProps {
  onComplete: () => void;
}

/**
 * Cinematic intro: starry space → 3D Earth spins in and grows → fades to reveal map.
 * Total duration ~3.2s.
 */
const EarthIntro: React.FC<EarthIntroProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 200);
    }, 3000);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#0b1020] to-[#1e1b4b] overflow-hidden">
      {/* Twinkling stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Earth */}
      <img
        src={earthImg}
        alt="Earth"
        className="w-80 h-80 md:w-96 md:h-96 object-contain animate-earth-spin drop-shadow-[0_0_60px_rgba(120,180,255,0.6)]"
      />

      {/* Title */}
      <div className="absolute bottom-20 left-0 right-0 text-center animate-fade-in-up">
        <p className="text-white/90 text-2xl md:text-3xl font-bold tracking-wide">
          🌍 Adventure around the world
        </p>
        <p className="text-white/60 text-sm mt-2">Loading your journey...</p>
      </div>
    </div>
  );
};

export default EarthIntro;
