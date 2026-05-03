import React, { useEffect } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { speakWelcomeBack } from '@/lib/voiceFeedback';

const WelcomeBackScreen: React.FC = () => {
  const { childName, language, resumeGame, setScreen } = useGame();
  const t = translations[language];

  useEffect(() => {
    // Delay voice so it doesn't overlap with cinematic intro
    const timer = setTimeout(() => {
      if (childName) {
        speakWelcomeBack(childName);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [childName]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 animate-fade-in-up">
      <CloudMascot mood="happy" size={280} />
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.welcomeBack}, {childName} 🌱
        </h1>
        <p className="text-lg text-muted-foreground">{t.readyContinue}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button
          onClick={resumeGame}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-10 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {t.continue}
        </button>
        <button
          onClick={() => setScreen('stages')}
          className="bg-card hover:bg-primary/10 text-foreground font-semibold text-lg px-10 py-4 rounded-2xl border-2 border-border transition-all hover:scale-105 active:scale-95"
        >
          {t.stages}
        </button>
      </div>
    </div>
  );
};

export default WelcomeBackScreen;
