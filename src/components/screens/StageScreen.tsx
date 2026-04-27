import React, { useState, useEffect } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { TOTAL_STAGES } from '@/lib/gameData';
import { speakLevelUnlocked } from '@/lib/voiceFeedback';

const stageNames: Record<number, string> = {
  1: 'Alphabet (A–Z)',
  2: 'Stage 2',
  3: 'Stage 3',
  4: 'Stage 4',
  5: 'Stage 5',
  6: 'Stage 6',
  7: 'Stage 7',
  8: 'Stage 8',
  9: 'Stage 9',
  10: 'Stage 10',
};

const stageIcons: Record<number, string> = {
  1: '🔤', 2: '📝', 3: '📖', 4: '🎯', 5: '⭐',
  6: '🌟', 7: '💎', 8: '🏆', 9: '👑', 10: '🎓',
};

const StageScreen: React.FC = () => {
  const { language, unlockedStages, startLevel, setScreen } = useGame();
  const t = translations[language];
  const [unlockingStage, setUnlockingStage] = useState<number | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  const handleStageClick = (stageNum: number) => {
    if (stageNum <= unlockedStages) {
      startLevel(stageNum, 1);
    }
  };

  // Unlock animation for newly unlocked stages
  const triggerUnlockAnimation = (stageNum: number) => {
    setUnlockingStage(stageNum);
    setShowKey(true);
    speakLevelUnlocked();
    
    setTimeout(() => {
      setShowChest(true);
      setShowKey(false);
    }, 800);
    
    setTimeout(() => {
      setShowGlow(true);
    }, 1400);
    
    setTimeout(() => {
      setUnlockingStage(null);
      setShowKey(false);
      setShowChest(false);
      setShowGlow(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="flex items-center px-4 py-3 bg-card/60 backdrop-blur-sm border-b border-border/50">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-foreground">{t.stages}</h2>
        <div className="w-16" />
      </div>

      <div className="flex justify-center py-4">
        <CloudMascot mood="neutral" size={160} />
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(stageNum => {
            const unlocked = stageNum <= unlockedStages;
            const isUnlocking = unlockingStage === stageNum;

            return (
              <div key={stageNum} className="relative">
                {/* Unlock animation overlay */}
                {isUnlocking && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/90 backdrop-blur-sm">
                    {showKey && (
                      <span className="text-5xl animate-gentle-bounce">🔑</span>
                    )}
                    {showChest && (
                      <div className="flex flex-col items-center gap-2 animate-fade-in-up">
                        <span className="text-5xl">🎁</span>
                        {showGlow && (
                          <span className="text-sm font-bold text-primary animate-fade-in-up">
                            {t.stage} {stageNum} unlocked! 🌟
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleStageClick(stageNum)}
                  disabled={!unlocked}
                  className={`w-full py-5 px-6 rounded-2xl text-lg font-bold transition-all flex items-center justify-between ${
                    unlocked
                      ? 'bg-card/80 backdrop-blur-sm border-2 border-primary/30 text-foreground hover:scale-[1.02] hover:border-primary/60 active:scale-[0.98] shadow-sm hover:shadow-md'
                      : 'bg-muted/30 border-2 border-border/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{stageIcons[stageNum]}</span>
                    <span>
                      {t.stage} {stageNum}
                      <span className="text-sm font-normal ml-2 text-muted-foreground">
                        {stageNames[stageNum]}
                      </span>
                    </span>
                  </span>
                  {!unlocked && <span className="text-xl">🔒</span>}
                  {unlocked && <span className="text-xl text-primary">→</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StageScreen;
