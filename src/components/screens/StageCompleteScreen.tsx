import React, { useEffect, useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { speakRank, speakStageComplete } from '@/lib/voiceFeedback';

// Rank progression — one per stage
const ranks: Record<number, { title: string; emoji: string; color: string; glow: string }> = {
  1:  { title: 'NOVICE',         emoji: '🌱', color: 'from-emerald-400 to-emerald-600', glow: 'emerald' },
  2:  { title: 'APPRENTICE',     emoji: '📘', color: 'from-sky-400 to-blue-600',        glow: 'sky' },
  3:  { title: 'EXPLORER',       emoji: '🧭', color: 'from-amber-400 to-orange-600',    glow: 'amber' },
  4:  { title: 'ADVENTURER',     emoji: '⚔️', color: 'from-cyan-400 to-teal-600',       glow: 'cyan' },
  5:  { title: 'EXPERT',         emoji: '🎯', color: 'from-violet-400 to-purple-600',   glow: 'violet' },
  6:  { title: 'CHAMPION',       emoji: '🏆', color: 'from-orange-400 to-red-600',      glow: 'orange' },
  7:  { title: 'HERO',           emoji: '🦸', color: 'from-blue-400 to-indigo-600',     glow: 'blue' },
  8:  { title: 'MASTER',         emoji: '🥇', color: 'from-yellow-400 to-amber-600',    glow: 'yellow' },
  9:  { title: 'GRANDMASTER',    emoji: '💎', color: 'from-pink-400 to-fuchsia-600',    glow: 'pink' },
  10: { title: 'LEGEND',         emoji: '👑', color: 'from-yellow-300 to-amber-500',    glow: 'amber' },
};

const StageCompleteScreen: React.FC = () => {
  const { language, childName, stage, advanceToNextLevel, repeatLevel, setScreen } = useGame();
  const t = translations[language];
  const rank = ranks[stage] || ranks[10];

  const [phase, setPhase] = useState<'intro' | 'reveal' | 'celebrate'>('intro');

  useEffect(() => {
    speakStageComplete();
    const t1 = setTimeout(() => {
      setPhase('reveal');
      speakRank(rank.title);
    }, 900);
    const t2 = setTimeout(() => setPhase('celebrate'), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [rank.title]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden bg-gradient-to-b from-background via-primary/10 to-background">
      {/* Confetti / sparkles */}
      {phase !== 'intro' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-10 - Math.random() * 20}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2.5 + Math.random() * 2}s`,
              }}
            >
              {['✨', '⭐', '🌟', '💫', '🎉'][i % 5]}
            </span>
          ))}
        </div>
      )}

      {/* Radial glow behind rank */}
      {phase !== 'intro' && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 bg-gradient-to-br ${rank.color} animate-pulse-slow pointer-events-none`}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4">
        {phase === 'intro' && (
          <>
            <CloudMascot mood="happy" size={220} />
            <h1 className="text-3xl font-bold text-foreground animate-fade-in-up">
              {t.stage} {stage} {t.stageComplete}
            </h1>
          </>
        )}

        {phase !== 'intro' && (
          <>
            {/* Rank emoji burst */}
            <div className="text-8xl animate-rank-pop drop-shadow-2xl">{rank.emoji}</div>

            {/* Rank title — letter-by-letter reveal */}
            <div className={`bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
              <h1 className="text-5xl md:text-6xl font-black tracking-widest text-center drop-shadow-lg animate-rank-title">
                {rank.title.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block animate-letter-drop"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {ch}
                  </span>
                ))}
              </h1>
            </div>

            {/* Underline shine */}
            <div className={`h-1 w-48 rounded-full bg-gradient-to-r ${rank.color} animate-shine-line`} />

            <p className="text-xl text-foreground font-semibold mt-2 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              {t.greatJob}, {childName}!
            </p>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  className="text-4xl animate-star-pop"
                  style={{ animationDelay: `${1 + (i - 1) * 0.2}s` }}
                >
                  🌟
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {phase === 'celebrate' && (
        <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs mt-2 animate-fade-in-up">
          <button
            onClick={advanceToNextLevel}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-10 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {t.goToStage} {stage + 1}
          </button>
          <button
            onClick={repeatLevel}
            className="bg-card hover:bg-primary/10 text-foreground font-medium text-lg px-10 py-4 rounded-2xl border-2 border-border transition-all hover:scale-105 active:scale-95"
          >
            {t.repeatStage} 🔁
          </button>
          <button
            onClick={() => setScreen('stages')}
            className="text-muted-foreground hover:text-foreground text-sm font-medium py-2 transition-colors"
          >
            🗺️ {t.stages}
          </button>
        </div>
      )}
    </div>
  );
};

export default StageCompleteScreen;
