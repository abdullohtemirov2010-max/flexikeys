import React from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

const OnboardingScreen: React.FC = () => {
  const { setScreen, language } = useGame();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 animate-fade-in-up">
      <CloudMascot mood="happy" size={300} />
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">FlexiKeys</h1>
        <p className="text-xl text-muted-foreground font-medium">{t.tagline}</p>
      </div>
      <button
        onClick={() => setScreen('language')}
        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-12 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        {t.start}
      </button>
    </div>
  );
};

export default OnboardingScreen;
