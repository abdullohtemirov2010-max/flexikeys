import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { TOTAL_STAGES } from '@/lib/gameData';
import EarthIntro from '@/components/EarthIntro';
import worldMap from '@/assets/world-map-flags.png';
import iconBack from '@/assets/icon-back.png';

/**
 * 10 country-themed stages with curriculum tailored for autism / Down syndrome learners.
 * Curriculum order is research-informed: alphabet recognition → letter formation →
 * numbers → shapes/colors → words → social/emotion → daily routines → fine motor →
 * simple sentences → mastery.
 */
interface StageTheme {
  country: string;
  flag: string;
  title: string;
  desc: string;
  /** Position on world map background, % from left/top */
  x: number;
  y: number;
}

const stageThemes: Record<number, StageTheme> = {
  1:  { country: 'Uzbekistan',    flag: '🇺🇿', title: 'Master Alphabets',   desc: 'Recognize letters A–Z',           x: 64, y: 36 },
  2:  { country: 'Turkey',        flag: '🇹🇷', title: 'Write Alphabets',    desc: 'Trace & form each letter',        x: 56, y: 38 },
  3:  { country: 'Egypt',         flag: '🇪🇬', title: 'Numbers 1–20',       desc: 'Count and recognize numbers',     x: 56, y: 50 },
  4:  { country: 'Kenya',         flag: '🇰🇪', title: 'Shapes & Colors',    desc: 'Match shapes and primary colors', x: 58, y: 62 },
  5:  { country: 'India',         flag: '🇮🇳', title: 'First Words',        desc: 'CVC words: cat, dog, sun',        x: 70, y: 48 },
  6:  { country: 'Japan',         flag: '🇯🇵', title: 'Emotions & Faces',   desc: 'Identify happy, sad, calm',       x: 84, y: 42 },
  7:  { country: 'Australia',     flag: '🇦🇺', title: 'Daily Routines',     desc: 'Brush teeth, eat, sleep',         x: 84, y: 72 },
  8:  { country: 'Brazil',        flag: '🇧🇷', title: 'Sentence Builder',   desc: 'I am happy. I see a cat.',        x: 32, y: 62 },
  9:  { country: 'United States', flag: '🇺🇸', title: 'Reading Together',   desc: 'Short stories aloud',             x: 18, y: 38 },
  10: { country: 'World Champion',flag: '🏆', title: 'Grand Mastery',      desc: 'Final test of all skills',        x: 50, y: 18 },
};

const StageScreen: React.FC = () => {
  const { unlockedStages, startLevel, setScreen } = useGame();
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro once per session
    return sessionStorage.getItem('fk_seen_earth') !== '1';
  });
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const handleIntroComplete = () => {
    sessionStorage.setItem('fk_seen_earth', '1');
    setShowIntro(false);
  };

  const handleStageClick = (n: number) => {
    if (n > unlockedStages) return;
    setSelectedStage(n);
  };

  const startStage = (n: number) => {
    startLevel(n, 1);
  };

  if (showIntro) return <EarthIntro onComplete={handleIntroComplete} />;

  const selected = selectedStage ? stageThemes[selectedStage] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-blue-100 animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border/50 z-20 shadow-sm">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <img src={iconBack} alt="Back" className="w-10 h-10 drop-shadow-md" />
        </button>
        <h2 className="flex-1 text-center text-xl font-black text-foreground">
          🌍 World Adventure Map
        </h2>
        <div className="w-10" />
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-auto">
        <div className="relative w-full" style={{ minHeight: '70vh' }}>
          {/* Map background */}
          <img
            src={worldMap}
            alt="World map"
            className="absolute inset-0 w-full h-full object-cover animate-map-reveal"
            style={{ minHeight: '70vh' }}
          />
          {/* Soft overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-100/30" />

          {/* Country pins */}
          {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(n => {
            const theme = stageThemes[n];
            const unlocked = n <= unlockedStages;
            const isCurrent = n === unlockedStages;
            return (
              <button
                key={n}
                onClick={() => handleStageClick(n)}
                disabled={!unlocked}
                className="absolute group animate-pin-drop"
                style={{
                  left: `${theme.x}%`,
                  top: `${theme.y}%`,
                  animationDelay: `${0.6 + n * 0.08}s`,
                }}
              >
                {/* Pin */}
                <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                  {/* Country chip */}
                  <div
                    className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg border-2 ${
                      unlocked
                        ? 'bg-white text-foreground border-white hover:scale-110 cursor-pointer'
                        : 'bg-white/60 text-muted-foreground border-white/60 grayscale cursor-not-allowed'
                    } transition-transform`}
                  >
                    <span className="text-base leading-none">{theme.flag}</span>
                    <span>{n}</span>
                  </div>
                  {/* Stem */}
                  <div className="w-0.5 h-3 bg-foreground/40" />
                  {/* Dot on map */}
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
                      unlocked ? 'bg-red-500' : 'bg-gray-400'
                    } ${isCurrent ? 'animate-pulse-slow ring-4 ring-red-300/50' : ''}`}
                  />

                  {/* Lock badge */}
                  {!unlocked && (
                    <span className="absolute -top-2 -right-3 text-sm">🔒</span>
                  )}
                  {/* You-are-here marker */}
                  {isCurrent && (
                    <span className="absolute -top-7 text-xl animate-bounce">📍</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend / curriculum list below map */}
        <div className="px-4 py-6 bg-gradient-to-b from-blue-100/0 via-blue-50 to-white">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-3">
            ✈️ Your Learning Journey
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
            {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(n => {
              const theme = stageThemes[n];
              const unlocked = n <= unlockedStages;
              return (
                <button
                  key={n}
                  onClick={() => handleStageClick(n)}
                  disabled={!unlocked}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition ${
                    unlocked
                      ? 'bg-white border-primary/20 hover:border-primary hover:shadow-md cursor-pointer'
                      : 'bg-muted/30 border-muted opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-3xl">{theme.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Stage {n} · {theme.country}</p>
                    <p className="font-bold text-sm text-foreground truncate">{theme.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{theme.desc}</p>
                  </div>
                  {!unlocked && <span className="text-lg">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage detail modal */}
      {selected && selectedStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up"
          onClick={() => setSelectedStage(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-primary/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-3">
              <div className="text-7xl">{selected.flag}</div>
              <p className="text-xs font-medium text-muted-foreground">
                Stage {selectedStage} · {selected.country}
              </p>
              <h3 className="text-2xl font-black text-foreground">{selected.title}</h3>
              <p className="text-sm text-muted-foreground">{selected.desc}</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedStage(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => startStage(selectedStage)}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 active:scale-95 transition"
              >
                Start ✈️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageScreen;
