import React, { useEffect, useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { speakLevelComplete } from '@/lib/voiceFeedback';

const LevelCompleteScreen: React.FC = () => {
  const { language, childName, level, stage, getStarsForLevel, coins, advanceToNextLevel, repeatLevel } = useGame();
  const t = translations[language];
  const starCount = getStarsForLevel();
  const [showStars, setShowStars] = useState(0);
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    speakLevelComplete();

    // Animate stars one by one
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= starCount; i++) {
      timers.push(setTimeout(() => setShowStars(i), i * 600));
    }
    timers.push(setTimeout(() => setShowCoins(true), starCount * 600 + 400));

    return () => timers.forEach(clearTimeout);
  }, [starCount]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 animate-fade-in-up">
      <CloudMascot mood="happy" size={240} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{t.woow}</h1>
        <p className="text-xl text-muted-foreground">
          {t.youCompleted} {t.level} {level}!
        </p>
        <p className="text-lg text-muted-foreground">{t.greatJob}, {childName}!</p>
      </div>

      {/* Stars animation */}
      <div className="flex items-center justify-center gap-3 py-4">
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={`text-5xl transition-all duration-500 ${
              i <= showStars ? 'animate-star-pop opacity-100 scale-100' : 'opacity-10 scale-75'
            }`}
            style={{ animationDelay: `${(i - 1) * 0.15}s` }}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Coins animation */}
      <div className={`transition-all duration-700 ${showCoins ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="text-2xl font-bold text-accent-foreground bg-accent/30 px-6 py-2 rounded-full">
          🪙 +5
        </span>
      </div>

      <p className="text-muted-foreground text-sm mt-2">{t.imProud}</p>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button
          onClick={advanceToNextLevel}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-10 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {t.continue}
        </button>
        <button
          onClick={repeatLevel}
          className="bg-card hover:bg-primary/10 text-foreground font-medium text-lg px-10 py-4 rounded-2xl border-2 border-border transition-all hover:scale-105 active:scale-95"
        >
          {t.repeat} 🔁
        </button>
      </div>
    </div>
  );
};

export default LevelCompleteScreen;
