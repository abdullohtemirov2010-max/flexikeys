import React, { useState, useEffect, useRef } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { TOTAL_STAGES } from '@/lib/gameData';
import { speakLevelUnlocked } from '@/lib/voiceFeedback';

// Each stage = a themed "island" on the world map
const stageThemes: Record<number, { name: string; emoji: string; biome: string; bg: string; ring: string }> = {
  1:  { name: 'Alphabet Meadow',  emoji: '🌱', biome: 'meadow',   bg: 'from-emerald-200 to-emerald-400',  ring: 'ring-emerald-300' },
  2:  { name: 'Word Forest',      emoji: '🌳', biome: 'forest',   bg: 'from-green-300 to-emerald-500',    ring: 'ring-green-300' },
  3:  { name: 'Sunny Beach',      emoji: '🏖️', biome: 'beach',    bg: 'from-amber-200 to-yellow-400',     ring: 'ring-amber-300' },
  4:  { name: 'Crystal Lake',     emoji: '💧', biome: 'lake',     bg: 'from-sky-200 to-cyan-400',         ring: 'ring-sky-300' },
  5:  { name: 'Misty Mountain',   emoji: '⛰️', biome: 'mountain', bg: 'from-slate-300 to-slate-500',      ring: 'ring-slate-300' },
  6:  { name: 'Volcano Valley',   emoji: '🌋', biome: 'volcano',  bg: 'from-orange-300 to-red-500',       ring: 'ring-orange-300' },
  7:  { name: 'Frozen Tundra',    emoji: '❄️', biome: 'ice',      bg: 'from-cyan-100 to-blue-300',        ring: 'ring-cyan-200' },
  8:  { name: 'Desert Dunes',     emoji: '🏜️', biome: 'desert',   bg: 'from-yellow-200 to-orange-400',    ring: 'ring-yellow-300' },
  9:  { name: 'Sky Castle',       emoji: '🏯', biome: 'sky',      bg: 'from-indigo-200 to-purple-400',    ring: 'ring-indigo-300' },
  10: { name: "Champion's Peak",  emoji: '👑', biome: 'crown',    bg: 'from-yellow-300 to-amber-500',     ring: 'ring-yellow-400' },
};

// Hand-tuned positions for a winding adventure path (percent of map)
const stagePositions: Record<number, { x: number; y: number }> = {
  1:  { x: 18, y: 92 },
  2:  { x: 38, y: 86 },
  3:  { x: 60, y: 80 },
  4:  { x: 78, y: 70 },
  5:  { x: 62, y: 60 },
  6:  { x: 38, y: 54 },
  7:  { x: 20, y: 44 },
  8:  { x: 38, y: 32 },
  9:  { x: 62, y: 24 },
  10: { x: 50, y: 10 },
};

const StageScreen: React.FC = () => {
  const { language, unlockedStages, startLevel, setScreen } = useGame();
  const t = translations[language];
  const [unlockingStage, setUnlockingStage] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current stage on mount
  useEffect(() => {
    const current = Math.min(unlockedStages, TOTAL_STAGES);
    const pos = stagePositions[current];
    if (mapRef.current && pos) {
      const target = mapRef.current.scrollHeight * (pos.y / 100) - mapRef.current.clientHeight / 2;
      mapRef.current.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  }, [unlockedStages]);

  const handleStageClick = (stageNum: number) => {
    if (stageNum <= unlockedStages) startLevel(stageNum, 1);
  };

  // Build SVG path connecting stages
  const pathD = (() => {
    const points = Array.from({ length: TOTAL_STAGES }, (_, i) => stagePositions[i + 1]);
    return points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2 + (i % 2 === 0 ? 8 : -8);
        const cy = (prev.y + p.y) / 2;
        return `Q ${cx} ${cy} ${p.x} ${p.y}`;
      })
      .join(' ');
  })();

  return (
    <div className="min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/70 backdrop-blur-md border-b border-border/50 z-20">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-foreground">🗺️ Adventure Map</h2>
        <div className="w-16" />
      </div>

      {/* Floating clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <span className="absolute top-[10%] left-[5%] text-5xl opacity-50 animate-float">☁️</span>
        <span className="absolute top-[30%] right-[8%] text-4xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
        <span className="absolute top-[55%] left-[15%] text-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>☁️</span>
        <span className="absolute top-[75%] right-[20%] text-4xl opacity-40 animate-float" style={{ animationDelay: '0.5s' }}>☁️</span>
      </div>

      {/* Scrollable Map */}
      <div ref={mapRef} className="flex-1 overflow-y-auto relative z-10">
        <div className="relative mx-auto max-w-md" style={{ height: '1400px' }}>
          {/* Path SVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="dashes" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="white" opacity="0.7" />
              </pattern>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke="white"
              strokeWidth="1.2"
              strokeDasharray="2 1.5"
              strokeLinecap="round"
              opacity="0.85"
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
            />
          </svg>

          {/* Stage Islands */}
          {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(stageNum => {
            const theme = stageThemes[stageNum];
            const pos = stagePositions[stageNum];
            const unlocked = stageNum <= unlockedStages;
            const isCurrent = stageNum === unlockedStages;

            return (
              <button
                key={stageNum}
                onClick={() => handleStageClick(stageNum)}
                disabled={!unlocked}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* Shadow base */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/20 blur-md rounded-full" />

                {/* Island */}
                <div
                  className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${theme.bg} flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 ${
                    unlocked
                      ? `ring-4 ${theme.ring} ring-offset-2 ring-offset-transparent hover:scale-110 active:scale-95 cursor-pointer`
                      : 'grayscale opacity-60 cursor-not-allowed'
                  } ${isCurrent ? 'animate-pulse-slow' : ''}`}
                  style={{
                    boxShadow: unlocked
                      ? '0 12px 30px -6px rgba(0,0,0,0.3), inset 0 -8px 16px rgba(0,0,0,0.15), inset 0 6px 12px rgba(255,255,255,0.4)'
                      : '0 6px 14px -4px rgba(0,0,0,0.2), inset 0 -4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <span className="drop-shadow-md">{theme.emoji}</span>

                  {/* Stage number badge */}
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-foreground font-bold text-sm flex items-center justify-center shadow-md border-2 border-white">
                    {stageNum}
                  </span>

                  {/* Lock */}
                  {!unlocked && (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl bg-black/30 rounded-full backdrop-blur-[1px]">
                      🔒
                    </span>
                  )}

                  {/* Current marker */}
                  {isCurrent && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                      📍
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                    unlocked ? 'bg-white/90 text-foreground' : 'bg-white/50 text-muted-foreground'
                  } shadow-md`}>
                    {theme.name}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Mascot near top (champion's peak) */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-20px' }}>
            <CloudMascot mood="happy" size={90} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageScreen;
