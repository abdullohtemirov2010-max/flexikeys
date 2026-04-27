import React, { useEffect } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { speakStageComplete } from '@/lib/voiceFeedback';

const StageCompleteScreen: React.FC = () => {
  const { language, childName, stage, advanceToNextLevel, repeatLevel, setScreen } = useGame();
  const t = translations[language];

  useEffect(() => {
    speakStageComplete();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 animate-fade-in-up">
      <CloudMascot mood="happy" size={280} />

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          {t.stage} {stage} {t.stageComplete} 🌟
        </h1>
        <p className="text-xl text-muted-foreground">{t.greatJob}, {childName}!</p>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map(i => (
          <span key={i} className="text-5xl animate-star-pop" style={{ animationDelay: `${(i - 1) * 0.3}s` }}>
            🌟
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button
          onClick={advanceToNextLevel}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-10 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {t.goToStage} {stage + 1}
        </button>
        <button
          onClick={() => { repeatLevel(); }}
          className="bg-card hover:bg-primary/10 text-foreground font-medium text-lg px-10 py-4 rounded-2xl border-2 border-border transition-all hover:scale-105 active:scale-95"
        >
          {t.repeatStage} 🔁
        </button>
        <button
          onClick={() => setScreen('stages')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium py-2 transition-colors"
        >
          {t.stages}
        </button>
      </div>
    </div>
  );
};

export default StageCompleteScreen;
